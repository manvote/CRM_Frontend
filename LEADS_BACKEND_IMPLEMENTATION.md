# Leads Django Backend Implementation Guide

## Overview
This guide provides the complete backend implementation for the Leads module using Django REST Framework.

## 1. Models (leads/models.py)

```python
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Lead(models.Model):
    STAGE_CHOICES = [
        ('New', 'New'),
        ('Opened', 'Opened'),
        ('Interested', 'Interested'),
        ('Rejected', 'Rejected'),
        ('Closed', 'Closed'),
    ]
    
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Converted', 'Converted'),
    ]
    
    SOURCE_CHOICES = [
        ('Direct', 'Direct'),
        ('Linkedin', 'Linkedin'),
        ('Twitter', 'Twitter'),
        ('Facebook', 'Facebook'),
        ('Website', 'Website'),
        ('Referral', 'Referral'),
        ('Other', 'Other'),
    ]
    
    # Basic Information
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    company = models.CharField(max_length=255, blank=True, null=True)
    position = models.CharField(max_length=255, blank=True, null=True)
    
    # Status & Stage
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='New')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='Direct')
    
    # Additional Information
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='leads/', blank=True, null=True)
    
    # Ownership & Timestamps
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leads')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.company or 'No Company'}"


class LeadNote(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='lead_notes')
    text = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Note for {self.lead.name}"


class LeadActivity(models.Model):
    ACTIVITY_TYPES = [
        ('call', 'Call'),
        ('email', 'Email'),
        ('meeting', 'Meeting'),
        ('note', 'Note'),
        ('status_change', 'Status Change'),
    ]
    
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    activity_date = models.DateTimeField()
    
    class Meta:
        ordering = ['-activity_date']
        verbose_name_plural = 'Lead activities'
    
    def __str__(self):
        return f"{self.activity_type} - {self.lead.name}"
```

## 2. Serializers (leads/serializers.py)

```python
from rest_framework import serializers
from .models import Lead, LeadNote, LeadActivity

class LeadNoteSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='created_by.email', read_only=True)
    date = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = LeadNote
        fields = ['id', 'text', 'author', 'date']
        read_only_fields = ['id', 'author', 'date']


class LeadActivitySerializer(serializers.ModelSerializer):
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    
    class Meta:
        model = LeadActivity
        fields = ['id', 'activity_type', 'description', 'activity_date', 'created_by_email', 'created_at']
        read_only_fields = ['id', 'created_by_email', 'created_at']


class LeadSerializer(serializers.ModelSerializer):
    lead_notes = LeadNoteSerializer(many=True, read_only=True)
    activities = LeadActivitySerializer(many=True, read_only=True)
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    
    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'email', 'phone', 'company', 'position',
            'stage', 'status', 'source', 'value', 'notes', 'image',
            'owner', 'owner_email', 'created_at', 'updated_at',
            'lead_notes', 'activities'
        ]
        read_only_fields = ['id', 'owner', 'owner_email', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Set owner from request context
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class LeadListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views"""
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    
    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'email', 'phone', 'company', 'position',
            'stage', 'status', 'source', 'value', 'owner_email', 'created_at'
        ]
        read_only_fields = ['id', 'owner_email', 'created_at']
```

## 3. Views (leads/views.py)

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Lead, LeadNote, LeadActivity
from .serializers import (
    LeadSerializer, LeadListSerializer,
    LeadNoteSerializer, LeadActivitySerializer
)

class LeadViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return LeadListSerializer
        return LeadSerializer
    
    def get_queryset(self):
        # Users only see their own leads
        queryset = Lead.objects.filter(owner=self.request.user)
        
        # Filter by stage
        stage = self.request.query_params.get('stage')
        if stage:
            queryset = queryset.filter(stage=stage)
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) |
                models.Q(email__icontains=search) |
                models.Q(company__icontains=search) |
                models.Q(phone__icontains=search)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'])
    def notes(self, request, pk=None):
        """Add a note to a lead"""
        lead = self.get_object()
        serializer = LeadNoteSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(lead=lead, created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def activities(self, request, pk=None):
        """Add an activity to a lead"""
        lead = self.get_object()
        serializer = LeadActivitySerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(lead=lead, created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def convert(self, request, pk=None):
        """Convert lead to deal"""
        lead = self.get_object()
        
        # Create a deal from this lead (requires deals app)
        # This is a placeholder - implement based on your deals model
        from deals.models import Deal
        
        deal = Deal.objects.create(
            name=f"Deal with {lead.company or lead.name}",
            contact_name=lead.name,
            contact_email=lead.email,
            contact_phone=lead.phone,
            company=lead.company,
            value=lead.value,
            stage='Qualification',
            owner=request.user,
            source_lead=lead
        )
        
        # Update lead status
        lead.status = 'Converted'
        lead.save()
        
        return Response({
            'message': 'Lead converted to deal successfully',
            'deal_id': deal.id
        }, status=status.HTTP_201_CREATED)
```

## 4. URLs (leads/urls.py)

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet

router = DefaultRouter()
router.register(r'leads', LeadViewSet, basename='lead')

urlpatterns = [
    path('', include(router.urls)),
]
```

## 5. Admin Configuration (leads/admin.py)

```python
from django.contrib import admin
from .models import Lead, LeadNote, LeadActivity

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'email', 'stage', 'status', 'value', 'owner', 'created_at']
    list_filter = ['stage', 'status', 'source', 'created_at']
    search_fields = ['name', 'email', 'company', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'email', 'phone', 'company', 'position')
        }),
        ('Status', {
            'fields': ('stage', 'status', 'source')
        }),
        ('Additional Information', {
            'fields': ('value', 'notes', 'image')
        }),
        ('Ownership', {
            'fields': ('owner', 'created_at', 'updated_at')
        }),
    )

@admin.register(LeadNote)
class LeadNoteAdmin(admin.ModelAdmin):
    list_display = ['lead', 'created_by', 'created_at']
    list_filter = ['created_at']
    search_fields = ['lead__name', 'text']

@admin.register(LeadActivity)
class LeadActivityAdmin(admin.ModelAdmin):
    list_display = ['lead', 'activity_type', 'activity_date', 'created_by']
    list_filter = ['activity_type', 'activity_date']
    search_fields = ['lead__name', 'description']
```

## 6. Migrations

Run these commands to create the database tables:

```bash
python manage.py makemigrations leads
python manage.py migrate leads
```

## 7. Register in Main URLs (crmproject/urls.py)

```python
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('crmapp.urls')),
    path('api/', include('leads.urls')),  # Add this line
    path('api/', include('tasks.urls')),
]
```

## 8. Settings Configuration

Ensure these settings are in your `settings.py`:

```python
INSTALLED_APPS = [
    # ... other apps
    'rest_framework',
    'corsheaders',
    'leads',  # Add this
]

# Media files for lead images
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

## 9. API Endpoints

Once implemented, these endpoints will be available:

```
GET    /api/leads/                    # List all leads (with filters)
POST   /api/leads/                    # Create new lead
GET    /api/leads/{id}/               # Get lead details
PATCH  /api/leads/{id}/               # Update lead
DELETE /api/leads/{id}/               # Delete lead
POST   /api/leads/{id}/notes/         # Add note to lead
POST   /api/leads/{id}/activities/    # Add activity to lead
POST   /api/leads/{id}/convert/       # Convert lead to deal
```

### Query Parameters for List:
- `?stage=New` - Filter by stage
- `?status=Active` - Filter by status
- `?search=john` - Search by name, email, company, or phone

## 10. Testing

Test the endpoints using curl or Postman:

```bash
# Get all leads
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/leads/

# Create a lead
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","company":"Acme Inc","stage":"New"}' \
  http://localhost:8000/api/leads/

# Update lead stage
curl -X PATCH -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"stage":"Interested"}' \
  http://localhost:8000/api/leads/1/

# Add note to lead
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text":"Follow up next week"}' \
  http://localhost:8000/api/leads/1/notes/
```

## 11. Frontend Integration Checklist

- ✅ Created `leadsApi.js` service
- ✅ Updated `Leads.jsx` to use API
- ✅ Updated `AddLead.jsx` to use API
- ✅ Updated `LeadProfile.jsx` to use API
- ✅ Added loading and error states
- ✅ Implemented optimistic updates for drag-and-drop

## 12. Next Steps

1. Implement the backend models, serializers, and views
2. Run migrations
3. Test CRUD operations via Django admin
4. Test API endpoints with Postman
5. Verify frontend integration
6. Move on to Deals module integration
