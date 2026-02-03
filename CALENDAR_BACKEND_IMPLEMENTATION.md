# Calendar Django Backend Implementation Guide

## Overview
This guide provides the complete backend implementation for the Calendar module using Django REST Framework. The calendar supports multiple event types (meetings, events, reminders), guest management, and notifications.

## 1. Models (calendar/models.py)

```python
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()

class CalendarEvent(models.Model):
    EVENT_TYPE_CHOICES = [
        ('meeting', 'Meeting'),
        ('event', 'Event'),
        ('reminder', 'Task Reminder'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES, default='meeting')
    
    # Date & Time
    event_date = models.DateField(help_text="Date of the event")
    start_time = models.TimeField(help_text="Start time (HH:MM format)")
    end_time = models.TimeField(help_text="End time (HH:MM format)")
    duration_minutes = models.IntegerField(default=60, validators=[MinValueValidator(15)])
    
    # Location
    location = models.CharField(max_length=255, blank=True, null=True)
    
    # Guest Management
    attendees = models.TextField(blank=True, null=True, help_text="Comma-separated email addresses or JSON list")
    
    # Ownership & Timestamps
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calendar_events')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Notification
    reminder_set = models.BooleanField(default=True, help_text="Send reminder notification")
    reminder_minutes_before = models.IntegerField(default=15, help_text="Minutes before event to send reminder")
    
    class Meta:
        ordering = ['-event_date', '-start_time']
        indexes = [
            models.Index(fields=['owner', 'event_date']),
            models.Index(fields=['event_date', 'start_time']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.event_date} at {self.start_time}"
    
    def get_duration(self):
        """Calculate duration from start and end time"""
        from datetime import datetime, timedelta
        start = datetime.combine(self.event_date, self.start_time)
        end = datetime.combine(self.event_date, self.end_time)
        delta = end - start
        return int(delta.total_seconds() / 60)
    
    def get_attendees_list(self):
        """Parse attendees string into list"""
        if not self.attendees:
            return []
        if self.attendees.startswith('['):
            import json
            try:
                return json.loads(self.attendees)
            except:
                return self.attendees.split(',')
        return [email.strip() for email in self.attendees.split(',')]
    
    @property
    def is_upcoming(self):
        """Check if event is in the future"""
        from django.utils import timezone
        from datetime import datetime
        event_datetime = datetime.combine(self.event_date, self.start_time)
        return event_datetime > timezone.now()


class EventAttendee(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('tentative', 'Tentative'),
    ]
    
    event = models.ForeignKey(CalendarEvent, on_delete=models.CASCADE, related_name='attendee_records')
    email = models.EmailField()
    name = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    responded_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        unique_together = ['event', 'email']
        ordering = ['status', 'email']
    
    def __str__(self):
        return f"{self.email} - {self.event.title} ({self.status})"


class EventReminder(models.Model):
    REMINDER_TYPE_CHOICES = [
        ('email', 'Email'),
        ('notification', 'In-App Notification'),
        ('both', 'Both'),
    ]
    
    event = models.ForeignKey(CalendarEvent, on_delete=models.CASCADE, related_name='reminders')
    reminder_time = models.DateTimeField(help_text="When to send the reminder")
    reminder_type = models.CharField(max_length=20, choices=REMINDER_TYPE_CHOICES, default='notification')
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['reminder_time']
    
    def __str__(self):
        return f"Reminder for {self.event.title} at {self.reminder_time}"
```

## 2. Serializers (calendar/serializers.py)

```python
from rest_framework import serializers
from .models import CalendarEvent, EventAttendee, EventReminder
from django.contrib.auth import get_user_model

User = get_user_model()


class EventAttendeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventAttendee
        fields = ['id', 'email', 'name', 'status', 'responded_at']
        read_only_fields = ['id', 'responded_at']


class EventReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventReminder
        fields = ['id', 'reminder_time', 'reminder_type', 'is_sent', 'sent_at']
        read_only_fields = ['id', 'is_sent', 'sent_at']


class CalendarEventSerializer(serializers.ModelSerializer):
    attendee_records = EventAttendeeSerializer(many=True, read_only=True)
    reminders = EventReminderSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    duration = serializers.SerializerMethodField()
    attendees_list = serializers.SerializerMethodField()
    is_upcoming = serializers.BooleanField(read_only=True)
    
    # Frontend field mapping
    date = serializers.DateField(source='event_date')
    start = serializers.TimeField(source='start_time', format='%H:%M')
    end = serializers.TimeField(source='end_time', format='%H:%M')
    type = serializers.CharField(source='event_type')
    desc = serializers.CharField(source='description', required=False, allow_blank=True)
    attendees = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = CalendarEvent
        fields = [
            'id',
            # Backend field names
            'title', 'description', 'event_type', 'event_date', 'start_time', 
            'end_time', 'location', 'reminder_set', 'reminder_minutes_before',
            'attendee_records', 'reminders', 'owner_name', 'created_at', 'updated_at',
            'duration', 'attendees_list', 'is_upcoming',
            # Frontend field names (mapped)
            'date', 'start', 'end', 'type', 'desc', 'attendees'
        ]
        read_only_fields = ['id', 'owner_name', 'attendee_records', 'reminders', 'created_at', 'updated_at']
    
    def get_duration(self, obj):
        """Return duration as string like '60 min'"""
        minutes = obj.get_duration()
        return f"{minutes} min"
    
    def get_attendees_list(self, obj):
        """Return parsed attendees list"""
        return obj.get_attendees_list()
    
    def validate(self, data):
        """Validate event times"""
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError({
                'end_time': 'End time must be after start time.'
            })
        
        return data


class CalendarEventListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    duration = serializers.SerializerMethodField()
    attendees_list = serializers.SerializerMethodField()
    
    # Frontend field mapping
    date = serializers.DateField(source='event_date')
    start = serializers.TimeField(source='start_time', format='%H:%M')
    type = serializers.CharField(source='event_type')
    desc = serializers.CharField(source='description')
    
    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'title', 'description', 'event_type', 'event_date', 'start_time',
            'location', 'owner_name', 'created_at', 'updated_at',
            'duration', 'attendees_list',
            # Frontend fields
            'date', 'start', 'type', 'desc'
        ]
        read_only_fields = ['id', 'owner_name', 'created_at', 'updated_at']
    
    def get_duration(self, obj):
        minutes = obj.get_duration()
        return f"{minutes} min"
    
    def get_attendees_list(self, obj):
        return obj.get_attendees_list()
```

## 3. Views (calendar/views.py)

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta
import json
from .models import CalendarEvent, EventAttendee, EventReminder
from .serializers import (
    CalendarEventSerializer,
    CalendarEventListSerializer,
    EventAttendeeSerializer,
    EventReminderSerializer
)


class CalendarEventViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return events owned by the current user"""
        queryset = CalendarEvent.objects.filter(owner=self.request.user)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(event_date__gte=start_date)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(event_date__lte=end_date)
            except ValueError:
                pass
        
        # Filter by event type
        event_type = self.request.query_params.get('type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by date (single date)
        date = self.request.query_params.get('date')
        if date:
            try:
                date = datetime.strptime(date, '%Y-%m-%d').date()
                queryset = queryset.filter(event_date=date)
            except ValueError:
                pass
        
        # Search by title or description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search)
            )
        
        # Filter upcoming events
        upcoming = self.request.query_params.get('upcoming')
        if upcoming == 'true':
            now = timezone.now()
            queryset = queryset.filter(
                event_date__gte=now.date()
            ) | queryset.filter(
                event_date=now.date(),
                start_time__gte=now.time()
            )
        
        return queryset.select_related('owner').prefetch_related(
            'attendee_records', 'reminders'
        )
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return CalendarEventListSerializer
        return CalendarEventSerializer
    
    def perform_create(self, serializer):
        """Set the owner to the current user and create reminders"""
        event = serializer.save(owner=self.request.user)
        self._create_reminder(event)
        self._create_attendee_records(event, serializer.validated_data.get('attendees', ''))
    
    def perform_update(self, serializer):
        """Update event and reminders"""
        event = serializer.save()
        # Delete old reminders and create new ones
        event.reminders.all().delete()
        self._create_reminder(event)
        self._create_attendee_records(event, serializer.validated_data.get('attendees', ''))
    
    def _create_reminder(self, event):
        """Create reminder for the event"""
        if event.reminder_set:
            reminder_datetime = datetime.combine(
                event.event_date,
                event.start_time
            ) - timedelta(minutes=event.reminder_minutes_before)
            
            EventReminder.objects.create(
                event=event,
                reminder_time=reminder_datetime,
                reminder_type='notification'
            )
    
    def _create_attendee_records(self, event, attendees_str):
        """Create or update attendee records"""
        if not attendees_str:
            return
        
        # Parse attendees string
        try:
            if attendees_str.startswith('['):
                attendees_list = json.loads(attendees_str)
            else:
                attendees_list = [email.strip() for email in attendees_str.split(',')]
        except:
            attendees_list = [email.strip() for email in attendees_str.split(',')]
        
        # Clear existing attendees
        event.attendee_records.all().delete()
        
        # Create new attendee records
        for attendee_info in attendees_list:
            if isinstance(attendee_info, dict):
                email = attendee_info.get('email', '')
                name = attendee_info.get('name', '')
            else:
                email = attendee_info
                name = ''
            
            if email and '@' in email:
                EventAttendee.objects.create(
                    event=event,
                    email=email,
                    name=name or email.split('@')[0],
                    status='pending'
                )
    
    @action(detail=True, methods=['get'])
    def attendees(self, request, pk=None):
        """Get all attendees for an event"""
        event = self.get_object()
        serializer = EventAttendeeSerializer(
            event.attendee_records.all(),
            many=True
        )
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_attendee(self, request, pk=None):
        """Add a new attendee to an event"""
        event = self.get_object()
        email = request.data.get('email')
        name = request.data.get('name', '')
        
        if not email:
            return Response(
                {'email': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not '@' in email:
            return Response(
                {'email': 'Invalid email format.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            attendee, created = EventAttendee.objects.get_or_create(
                event=event,
                email=email,
                defaults={'name': name or email.split('@')[0], 'status': 'pending'}
            )
            
            if not created:
                return Response(
                    {'detail': 'Attendee already exists.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = EventAttendeeSerializer(attendee)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], url_path='attendees/(?P<attendee_id>[^/.]+)/respond')
    def respond_to_event(self, request, pk=None, attendee_id=None):
        """Update attendee response status"""
        event = self.get_object()
        status_response = request.data.get('status')
        
        if status_response not in ['accepted', 'declined', 'tentative']:
            return Response(
                {'status': 'Invalid status value.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            attendee = EventAttendee.objects.get(id=attendee_id, event=event)
            attendee.status = status_response
            attendee.responded_at = timezone.now()
            attendee.save()
            
            serializer = EventAttendeeSerializer(attendee)
            return Response(serializer.data)
        
        except EventAttendee.DoesNotExist:
            return Response(
                {'detail': 'Attendee not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['delete'], url_path='attendees/(?P<attendee_id>[^/.]+)')
    def remove_attendee(self, request, pk=None, attendee_id=None):
        """Remove an attendee from an event"""
        event = self.get_object()
        
        try:
            attendee = EventAttendee.objects.get(id=attendee_id, event=event)
            attendee.delete()
            
            serializer = CalendarEventSerializer(event, context={'request': request})
            return Response(serializer.data)
        
        except EventAttendee.DoesNotExist:
            return Response(
                {'detail': 'Attendee not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def week_view(self, request, pk=None):
        """Get events for a specific week"""
        week_date = request.query_params.get('date')
        
        if not week_date:
            week_date = timezone.now().date()
        else:
            try:
                week_date = datetime.strptime(week_date, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'detail': 'Invalid date format. Use YYYY-MM-DD.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Get week range (Sunday to Saturday)
        from datetime import timedelta
        week_start = week_date - timedelta(days=week_date.weekday())
        week_end = week_start + timedelta(days=6)
        
        events = self.get_queryset().filter(
            event_date__gte=week_start,
            event_date__lte=week_end
        )
        
        serializer = self.get_serializer(events, many=True)
        return Response({
            'week_start': week_start,
            'week_end': week_end,
            'events': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def month_view(self, request):
        """Get events for a specific month"""
        month_date = request.query_params.get('date')
        
        if not month_date:
            month_date = timezone.now().date()
        else:
            try:
                month_date = datetime.strptime(month_date, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'detail': 'Invalid date format. Use YYYY-MM-DD.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Get month range
        month_start = month_date.replace(day=1)
        if month_date.month == 12:
            month_end = month_date.replace(year=month_date.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = month_date.replace(month=month_date.month + 1, day=1) - timedelta(days=1)
        
        events = self.get_queryset().filter(
            event_date__gte=month_start,
            event_date__lte=month_end
        )
        
        serializer = self.get_serializer(events, many=True)
        return Response({
            'month': month_date.strftime('%Y-%m'),
            'month_start': month_start,
            'month_end': month_end,
            'events': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def today_events(self, request):
        """Get today's events"""
        today = timezone.now().date()
        events = self.get_queryset().filter(event_date=today)
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming_events(self, request):
        """Get upcoming events"""
        now = timezone.now()
        events = self.get_queryset().filter(
            event_date__gte=now.date()
        ) | self.get_queryset().filter(
            event_date=now.date(),
            start_time__gte=now.time()
        )
        
        limit = request.query_params.get('limit', 10)
        try:
            limit = int(limit)
            events = events[:limit]
        except ValueError:
            pass
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
```

## 4. URLs (calendar/urls.py)

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CalendarEventViewSet

router = DefaultRouter()
router.register(r'events', CalendarEventViewSet, basename='event')

urlpatterns = [
    path('', include(router.urls)),
]
```

## 5. Admin Configuration (calendar/admin.py)

```python
from django.contrib import admin
from .models import CalendarEvent, EventAttendee, EventReminder


class EventAttendeeInline(admin.TabularInline):
    model = EventAttendee
    extra = 0
    readonly_fields = ['responded_at']


class EventReminderInline(admin.TabularInline):
    model = EventReminder
    extra = 0
    readonly_fields = ['is_sent', 'sent_at']


@admin.register(CalendarEvent)
class CalendarEventAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_date', 'start_time', 'event_type', 'owner', 'created_at']
    list_filter = ['event_type', 'event_date', 'created_at']
    search_fields = ['title', 'description', 'location', 'owner__email']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [EventAttendeeInline, EventReminderInline]
    
    fieldsets = (
        ('Event Information', {
            'fields': ('title', 'description', 'event_type', 'location')
        }),
        ('Date & Time', {
            'fields': ('event_date', 'start_time', 'end_time', 'duration_minutes')
        }),
        ('Attendees', {
            'fields': ('attendees',),
            'classes': ('collapse',)
        }),
        ('Reminders', {
            'fields': ('reminder_set', 'reminder_minutes_before'),
            'classes': ('collapse',)
        }),
        ('Ownership', {
            'fields': ('owner',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EventAttendee)
class EventAttendeeAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'event', 'status', 'responded_at']
    list_filter = ['status', 'responded_at']
    search_fields = ['email', 'name', 'event__title']
    readonly_fields = ['responded_at']


@admin.register(EventReminder)
class EventReminderAdmin(admin.ModelAdmin):
    list_display = ['event', 'reminder_time', 'reminder_type', 'is_sent', 'sent_at']
    list_filter = ['reminder_type', 'is_sent', 'reminder_time']
    search_fields = ['event__title']
    readonly_fields = ['is_sent', 'sent_at']
```

## 6. Main Project URLs Configuration

Add to your main `urls.py`:

```python
from django.urls import path, include

urlpatterns = [
    # ... other patterns
    path('api/calendar/', include('calendar.urls')),
]
```

## 7. Settings Configuration

Ensure these settings in your `settings.py`:

```python
INSTALLED_APPS = [
    # ... other apps
    'rest_framework',
    'calendar',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# Timezone Configuration
USE_TZ = True
TIME_ZONE = 'UTC'  # Adjust to your timezone
```

## 8. API Endpoints Reference

### Event Operations
- `GET /api/calendar/events/` - List all events
- `POST /api/calendar/events/` - Create a new event
- `GET /api/calendar/events/{id}/` - Retrieve a specific event
- `PUT /api/calendar/events/{id}/` - Update an event (full update)
- `PATCH /api/calendar/events/{id}/` - Partial update an event
- `DELETE /api/calendar/events/{id}/` - Delete an event

### Event Views
- `GET /api/calendar/events/week_view/?date=2026-02-02` - Get week view events
- `GET /api/calendar/events/month_view/?date=2026-02-02` - Get month view events
- `GET /api/calendar/events/today_events/` - Get today's events
- `GET /api/calendar/events/upcoming_events/?limit=10` - Get upcoming events

### Attendee Management
- `GET /api/calendar/events/{id}/attendees/` - Get event attendees
- `POST /api/calendar/events/{id}/add_attendee/` - Add attendee to event
- `POST /api/calendar/events/{id}/attendees/{attendee_id}/respond/` - Respond to event invitation
- `DELETE /api/calendar/events/{id}/attendees/{attendee_id}/` - Remove attendee from event

### Query Parameters
- `?start_date=2026-02-01` - Filter events from date
- `?end_date=2026-02-28` - Filter events until date
- `?date=2026-02-15` - Filter events for specific date
- `?type=meeting` - Filter by event type (meeting, event, reminder)
- `?search=keyword` - Search by title, description, or location
- `?upcoming=true` - Get only upcoming events

## 9. Frontend to Backend Field Mapping

| Frontend Field | Backend Field | Type | Notes |
|---|---|---|---|
| title | title | String | Required |
| desc | description | Text | Optional |
| type | event_type | String | meeting/event/reminder |
| date | event_date | Date | Required |
| start | start_time | Time | HH:MM format |
| end | end_time | Time | HH:MM format |
| attendees | attendees | String | Comma-separated emails |
| location | location | String | Optional |

## 10. Testing Examples

### Create Event
```bash
curl -X POST http://localhost:8000/api/calendar/events/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Client Meeting",
    "description": "Discuss project requirements",
    "event_type": "meeting",
    "event_date": "2026-02-15",
    "start_time": "10:00",
    "end_time": "11:00",
    "location": "Conference Room A",
    "attendees": "client@example.com, team@example.com",
    "reminder_set": true,
    "reminder_minutes_before": 15
  }'
```

### Get Week View
```bash
curl -X GET "http://localhost:8000/api/calendar/events/week_view/?date=2026-02-02" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Add Attendee
```bash
curl -X POST http://localhost:8000/api/calendar/events/1/add_attendee/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newattendee@example.com",
    "name": "New Attendee"
  }'
```

### Respond to Event
```bash
curl -X POST http://localhost:8000/api/calendar/events/1/attendees/5/respond/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted"
  }'
```

## 11. Database Migrations

```bash
# Create migrations
python manage.py makemigrations calendar

# Apply migrations
python manage.py migrate calendar

# Create superuser (if needed)
python manage.py createsuperuser
```

## 12. API Integration in Frontend

```javascript
// Replace localStorage calls with API calls
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/calendar';

export const getEvents = async (params = {}) => {
  const response = await axios.get(`${API_BASE}/events/`, { params });
  return response.data.results || response.data;
};

export const saveEvent = async (event) => {
  const response = await axios.post(`${API_BASE}/events/`, event);
  return response.data;
};

export const updateEvent = async (eventId, event) => {
  const response = await axios.patch(`${API_BASE}/events/${eventId}/`, event);
  return response.data;
};

export const deleteEvent = async (eventId) => {
  await axios.delete(`${API_BASE}/events/${eventId}/`);
};

export const getWeekView = async (date) => {
  const response = await axios.get(`${API_BASE}/events/week_view/`, {
    params: { date }
  });
  return response.data;
};
```

## 13. Testing Checklist

- [ ] Create event with all fields
- [ ] Update event details
- [ ] Delete event
- [ ] Add attendee to event
- [ ] Update attendee response (accept/decline)
- [ ] Remove attendee from event
- [ ] Get week view for specific date
- [ ] Get month view for specific date
- [ ] Get today's events
- [ ] Get upcoming events
- [ ] Filter events by type
- [ ] Filter events by date range
- [ ] Search events by keyword
- [ ] Verify reminders are created
- [ ] Test timezone handling

## 14. Security Considerations

- ✅ JWT authentication required for all endpoints
- ✅ Users can only access their own events
- ✅ Attendee email validation
- ✅ Time validation (end time > start time)
- ✅ Proper error handling and validation messages

## 15. Performance Optimizations

- Use `select_related('owner')` to reduce database queries
- Use `prefetch_related('attendee_records', 'reminders')` for related data
- Lightweight `CalendarEventListSerializer` for list views
- Database indexes on owner + event_date and event_date + start_time
- Query parameter filtering to reduce result sets

## 16. Celery Task Scheduler (Optional - for automated reminders)

```python
# calendar/tasks.py
from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from .models import EventReminder

@shared_task
def send_event_reminders():
    """Send reminders for upcoming events"""
    now = timezone.now()
    pending_reminders = EventReminder.objects.filter(
        is_sent=False,
        reminder_time__lte=now
    )
    
    for reminder in pending_reminders:
        # Send notification
        if reminder.reminder_type in ['notification', 'both']:
            # Create in-app notification
            pass
        
        # Send email
        if reminder.reminder_type in ['email', 'both']:
            send_mail(
                f"Reminder: {reminder.event.title}",
                f"Your event '{reminder.event.title}' is coming up at {reminder.event.start_time}",
                'noreply@example.com',
                [reminder.event.owner.email],
                fail_silently=True,
            )
        
        reminder.is_sent = True
        reminder.sent_at = now
        reminder.save()
```

## Need Help?

- Django REST Framework docs: https://www.django-rest-framework.org/
- Django models: https://docs.djangoproject.com/en/stable/topics/db/models/
- JWT authentication: https://django-rest-framework-simplejwt.readthedocs.io/
- Celery documentation: https://docs.celeryproject.org/
