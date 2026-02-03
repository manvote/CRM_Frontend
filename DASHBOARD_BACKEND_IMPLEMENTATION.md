# Dashboard Django Backend Implementation Guide

## Overview
This guide provides the complete backend implementation for the Dashboard module using Django REST Framework. The dashboard aggregates data from Leads, Deals, and Tasks to provide a comprehensive overview with analytics, recent activity tracking, and AI-driven suggestions.

## 1. Models (dashboard/models.py)

```python
from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q
from django.utils import timezone

User = get_user_model()

class DashboardMetric(models.Model):
    """Store calculated metrics for performance optimization"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='dashboard_metric')
    
    # Lead Metrics
    total_leads = models.IntegerField(default=0)
    new_leads_this_month = models.IntegerField(default=0)
    
    # Deal Metrics
    active_deals = models.IntegerField(default=0)
    deals_in_progress = models.IntegerField(default=0)
    won_deals_total = models.IntegerField(default=0)
    lost_deals_total = models.IntegerField(default=0)
    total_deal_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Performance
    customer_satisfaction_rate = models.FloatField(default=0, help_text="Percentage of won deals")
    
    # Timestamps
    last_calculated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Dashboard Metric'
        verbose_name_plural = 'Dashboard Metrics'
    
    def __str__(self):
        return f"Dashboard Metrics for {self.user.email}"
    
    def calculate_metrics(self):
        """Recalculate all metrics from source models"""
        from leads.models import Lead
        from deals.models import Deal
        
        # Lead metrics
        self.total_leads = Lead.objects.filter(owner=self.user).count()
        today = timezone.now().date()
        month_start = today.replace(day=1)
        self.new_leads_this_month = Lead.objects.filter(
            owner=self.user,
            created_at__date__gte=month_start
        ).count()
        
        # Deal metrics
        deals = Deal.objects.filter(owner=self.user)
        self.active_deals = deals.exclude(status__in=['Won', 'Lost']).count()
        self.deals_in_progress = deals.filter(
            stage__in=['Orders', 'Tasks', 'Due Date']
        ).count()
        
        won = deals.filter(status='Won').count()
        lost = deals.filter(status='Lost').count()
        self.won_deals_total = won
        self.lost_deals_total = lost
        
        # Satisfaction rate
        total_closed = won + lost
        self.customer_satisfaction_rate = (won / total_closed * 100) if total_closed > 0 else 0
        
        # Total value
        self.total_deal_value = deals.aggregate(Sum('amount'))['amount__sum'] or 0
        
        self.save()


class DashboardActivity(models.Model):
    """Track user activities for activity feed"""
    ACTIVITY_TYPE_CHOICES = [
        ('lead_created', 'Lead Created'),
        ('lead_updated', 'Lead Updated'),
        ('lead_deleted', 'Lead Deleted'),
        ('deal_created', 'Deal Created'),
        ('deal_updated', 'Deal Updated'),
        ('deal_stage_changed', 'Deal Stage Changed'),
        ('deal_won', 'Deal Won'),
        ('deal_lost', 'Deal Lost'),
        ('task_created', 'Task Created'),
        ('task_completed', 'Task Completed'),
        ('comment_added', 'Comment Added'),
        ('file_uploaded', 'File Uploaded'),
        ('team_joined', 'Team Member Joined'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dashboard_activities')
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPE_CHOICES)
    
    # Related object info
    lead_id = models.IntegerField(blank=True, null=True)
    deal_id = models.IntegerField(blank=True, null=True)
    task_id = models.IntegerField(blank=True, null=True)
    
    # Activity details
    title = models.CharField(max_length=255, help_text="e.g., 'Acme Corp Lead Created'")
    description = models.TextField(blank=True, null=True)
    action = models.CharField(max_length=255, help_text="e.g., 'Lead created for Acme Corp'")
    
    # Change tracking
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['activity_type', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.activity_type} - {self.created_at}"


class AISuggestion(models.Model):
    """AI-driven suggestions for users"""
    SUGGESTION_TYPE_CHOICES = [
        ('follow_up', 'Follow-up Needed'),
        ('risk_alert', 'Lead at Risk'),
        ('opportunity', 'Opportunity'),
        ('performance', 'Performance Insight'),
        ('close_date', 'Close Date Warning'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_suggestions')
    suggestion_type = models.CharField(max_length=30, choices=SUGGESTION_TYPE_CHOICES)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    # Suggestion content
    title = models.CharField(max_length=255, help_text="e.g., '3 leads at risk'")
    description = models.TextField(help_text="Detailed explanation and recommendation")
    confidence_score = models.FloatField(default=0.5, validators=[MinValueValidator(0), MaxValueValidator(1)])
    
    # Related objects
    lead_ids = models.TextField(blank=True, null=True, help_text="Comma-separated lead IDs")
    deal_ids = models.TextField(blank=True, null=True, help_text="Comma-separated deal IDs")
    
    # Metrics
    metric_value = models.CharField(max_length=100, blank=True, null=True)
    metric_change = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., '+15%' or '-5%'")
    
    # Status
    is_actioned = models.BooleanField(default=False)
    actioned_at = models.DateTimeField(blank=True, null=True)
    action_notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(help_text="When this suggestion becomes outdated")
    
    class Meta:
        ordering = ['-priority', '-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['priority', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.suggestion_type} - {self.title}"
    
    def is_valid(self):
        """Check if suggestion is still valid"""
        return timezone.now() < self.expires_at and not self.is_actioned


class MarketingPerformanceMetric(models.Model):
    """Track marketing performance and time spent"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='marketing_metrics')
    
    # Date
    metric_date = models.DateField()
    
    # Hours tracking
    total_hours = models.FloatField(default=0, help_text="Total hours worked")
    active_hours = models.FloatField(default=0, help_text="Hours spent on active tasks")
    
    # Performance indicators
    leads_contacted = models.IntegerField(default=0)
    deals_progressed = models.IntegerField(default=0)
    calls_made = models.IntegerField(default=0)
    meetings_held = models.IntegerField(default=0)
    
    # Efficiency
    conversion_rate = models.FloatField(default=0, help_text="Percentage")
    avg_deal_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    class Meta:
        unique_together = ['user', 'metric_date']
        ordering = ['-metric_date']
    
    def __str__(self):
        return f"{self.user.email} - {self.metric_date}"
```

## 2. Serializers (dashboard/serializers.py)

```python
from rest_framework import serializers
from .models import DashboardMetric, DashboardActivity, AISuggestion, MarketingPerformanceMetric
from django.contrib.auth import get_user_model

User = get_user_model()


class DashboardMetricSerializer(serializers.ModelSerializer):
    satisfaction_rate = serializers.FloatField(source='customer_satisfaction_rate')
    
    class Meta:
        model = DashboardMetric
        fields = [
            'total_leads', 'new_leads_this_month',
            'active_deals', 'deals_in_progress',
            'won_deals_total', 'lost_deals_total',
            'total_deal_value', 'satisfaction_rate',
            'last_calculated'
        ]
        read_only_fields = fields


class DashboardActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_initials = serializers.SerializerMethodField()
    avatar_bg_color = serializers.SerializerMethodField()
    
    class Meta:
        model = DashboardActivity
        fields = [
            'id', 'activity_type', 'title', 'description', 'action',
            'user_name', 'user_initials', 'avatar_bg_color',
            'lead_id', 'deal_id', 'task_id',
            'old_value', 'new_value', 'created_at'
        ]
        read_only_fields = fields
    
    def get_user_initials(self, obj):
        """Get user initials for avatar"""
        return obj.user.get_full_name()[:1].upper() if obj.user.get_full_name() else obj.user.username[:1]
    
    def get_avatar_bg_color(self, obj):
        """Generate consistent background color based on user"""
        colors = ['bg-yellow-400', 'bg-teal-600', 'bg-blue-500', 'bg-green-500', 'bg-pink-500']
        index = hash(obj.user.id) % len(colors)
        return colors[index]


class AISuggestionSerializer(serializers.ModelSerializer):
    icon_color = serializers.SerializerMethodField()
    is_valid = serializers.BooleanField(read_only=True)
    related_leads = serializers.SerializerMethodField()
    related_deals = serializers.SerializerMethodField()
    
    class Meta:
        model = AISuggestion
        fields = [
            'id', 'suggestion_type', 'priority', 'title', 'description',
            'confidence_score', 'metric_value', 'metric_change',
            'is_actioned', 'actioned_at', 'action_notes',
            'icon_color', 'is_valid', 'related_leads', 'related_deals',
            'created_at', 'expires_at'
        ]
        read_only_fields = ['id', 'created_at', 'expires_at', 'is_valid']
    
    def get_icon_color(self, obj):
        """Get icon color based on suggestion type"""
        color_map = {
            'follow_up': 'bg-yellow-400',
            'risk_alert': 'bg-red-500',
            'opportunity': 'bg-green-500',
            'performance': 'bg-blue-500',
            'close_date': 'bg-orange-500',
        }
        return color_map.get(obj.suggestion_type, 'bg-gray-400')
    
    def get_related_leads(self, obj):
        """Parse and return related lead IDs"""
        if not obj.lead_ids:
            return []
        return [int(x.strip()) for x in obj.lead_ids.split(',') if x.strip().isdigit()]
    
    def get_related_deals(self, obj):
        """Parse and return related deal IDs"""
        if not obj.deal_ids:
            return []
        return [int(x.strip()) for x in obj.deal_ids.split(',') if x.strip().isdigit()]


class MarketingPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketingPerformanceMetric
        fields = [
            'id', 'metric_date', 'total_hours', 'active_hours',
            'leads_contacted', 'deals_progressed', 'calls_made',
            'meetings_held', 'conversion_rate', 'avg_deal_value'
        ]
        read_only_fields = fields


class DashboardSummarySerializer(serializers.Serializer):
    """Comprehensive dashboard summary"""
    metrics = DashboardMetricSerializer()
    recent_activities = DashboardActivitySerializer(many=True)
    ai_suggestions = AISuggestionSerializer(many=True)
    top_performing_deals = serializers.SerializerMethodField()
    pending_tasks = serializers.SerializerMethodField()
    
    def get_top_performing_deals(self, obj):
        """Get top 3 performing deals"""
        return {}  # Populated by view
    
    def get_pending_tasks(self, obj):
        """Get pending tasks"""
        return {}  # Populated by view
```

## 3. Views (dashboard/views.py)

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q, Sum, Avg
from .models import DashboardMetric, DashboardActivity, AISuggestion, MarketingPerformanceMetric
from .serializers import (
    DashboardMetricSerializer,
    DashboardActivitySerializer,
    AISuggestionSerializer,
    MarketingPerformanceSerializer,
    DashboardSummarySerializer
)


class DashboardViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Users only see their own dashboard"""
        return DashboardMetric.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get comprehensive dashboard summary"""
        user = request.user
        
        # Get or create dashboard metric
        metric, _ = DashboardMetric.objects.get_or_create(user=user)
        metric.calculate_metrics()
        
        # Get recent activities
        activities = DashboardActivity.objects.filter(
            user=user
        ).order_by('-created_at')[:10]
        
        # Get active AI suggestions
        suggestions = AISuggestion.objects.filter(
            user=user,
            expires_at__gt=timezone.now(),
            is_actioned=False
        ).order_by('-priority', '-created_at')[:5]
        
        data = {
            'metrics': DashboardMetricSerializer(metric).data,
            'recent_activities': DashboardActivitySerializer(activities, many=True).data,
            'ai_suggestions': AISuggestionSerializer(suggestions, many=True).data,
            'dashboard_timestamp': timezone.now().isoformat()
        }
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def metrics(self, request):
        """Get dashboard metrics"""
        user = request.user
        metric, _ = DashboardMetric.objects.get_or_create(user=user)
        metric.calculate_metrics()
        
        serializer = DashboardMetricSerializer(metric)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def refresh_metrics(self, request):
        """Force refresh dashboard metrics"""
        user = request.user
        metric, _ = DashboardMetric.objects.get_or_create(user=user)
        metric.calculate_metrics()
        
        serializer = DashboardMetricSerializer(metric)
        return Response(serializer.data)


class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DashboardActivitySerializer
    
    def get_queryset(self):
        """Return activities for current user"""
        queryset = DashboardActivity.objects.filter(user=self.request.user)
        
        # Filter by type
        activity_type = self.request.query_params.get('type')
        if activity_type:
            queryset = queryset.filter(activity_type=activity_type)
        
        # Filter by date range
        days = self.request.query_params.get('days', 7)
        try:
            days = int(days)
            since_date = timezone.now() - timedelta(days=days)
            queryset = queryset.filter(created_at__gte=since_date)
        except ValueError:
            pass
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def log_activity(self, request):
        """Create a new activity log"""
        activity_type = request.data.get('activity_type')
        title = request.data.get('title')
        description = request.data.get('description', '')
        action = request.data.get('action', '')
        
        if not activity_type or not title:
            return Response(
                {'detail': 'activity_type and title are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        activity = DashboardActivity.objects.create(
            user=request.user,
            activity_type=activity_type,
            title=title,
            description=description,
            action=action,
            lead_id=request.data.get('lead_id'),
            deal_id=request.data.get('deal_id'),
            task_id=request.data.get('task_id'),
            old_value=request.data.get('old_value'),
            new_value=request.data.get('new_value'),
        )
        
        serializer = DashboardActivitySerializer(activity)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent activities"""
        limit = request.query_params.get('limit', 15)
        try:
            limit = int(limit)
        except ValueError:
            limit = 15
        
        activities = self.get_queryset()[:limit]
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get activity summary"""
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        today_activities = DashboardActivity.objects.filter(
            user=request.user,
            created_at__gte=today_start
        ).count()
        
        week_activities = DashboardActivity.objects.filter(
            user=request.user,
            created_at__gte=now - timedelta(days=7)
        ).count()
        
        activity_types = DashboardActivity.objects.filter(
            user=request.user,
            created_at__gte=now - timedelta(days=30)
        ).values('activity_type').annotate(count=Count('id'))
        
        return Response({
            'today_activities': today_activities,
            'week_activities': week_activities,
            'activity_types': activity_types
        })


class AISuggestionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AISuggestionSerializer
    
    def get_queryset(self):
        """Return suggestions for current user"""
        queryset = AISuggestion.objects.filter(user=self.request.user)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by type
        suggestion_type = self.request.query_params.get('type')
        if suggestion_type:
            queryset = queryset.filter(suggestion_type=suggestion_type)
        
        # Only active suggestions
        active_only = self.request.query_params.get('active_only', 'true')
        if active_only == 'true':
            queryset = queryset.filter(
                expires_at__gt=timezone.now(),
                is_actioned=False
            )
        
        return queryset.order_by('-priority', '-created_at')
    
    @action(detail=True, methods=['post'])
    def mark_actioned(self, request, pk=None):
        """Mark suggestion as actioned"""
        suggestion = self.get_object()
        suggestion.is_actioned = True
        suggestion.actioned_at = timezone.now()
        suggestion.action_notes = request.data.get('action_notes', '')
        suggestion.save()
        
        serializer = self.get_serializer(suggestion)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def create_suggestion(self, request):
        """Create a new AI suggestion (admin use)"""
        suggestion = AISuggestion.objects.create(
            user=request.user,
            suggestion_type=request.data.get('suggestion_type'),
            priority=request.data.get('priority', 'medium'),
            title=request.data.get('title'),
            description=request.data.get('description'),
            confidence_score=request.data.get('confidence_score', 0.5),
            lead_ids=request.data.get('lead_ids', ''),
            deal_ids=request.data.get('deal_ids', ''),
            metric_value=request.data.get('metric_value'),
            metric_change=request.data.get('metric_change'),
            expires_at=timezone.now() + timedelta(days=int(request.data.get('days', 7)))
        )
        
        serializer = self.get_serializer(suggestion)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active suggestions only"""
        suggestions = self.get_queryset()[:10]
        serializer = self.get_serializer(suggestions, many=True)
        return Response(serializer.data)


class MarketingPerformanceViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MarketingPerformanceSerializer
    
    def get_queryset(self):
        """Return performance metrics for current user"""
        queryset = MarketingPerformanceMetric.objects.filter(user=self.request.user)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(metric_date__gte=start_date)
        
        if end_date:
            queryset = queryset.filter(metric_date__lte=end_date)
        
        return queryset.order_by('-metric_date')
    
    @action(detail=False, methods=['get'])
    def current_month(self, request):
        """Get current month performance"""
        now = timezone.now()
        month_start = now.replace(day=1)
        
        metrics = MarketingPerformanceMetric.objects.filter(
            user=request.user,
            metric_date__gte=month_start.date()
        )
        
        aggregates = metrics.aggregate(
            total_hours=Sum('total_hours'),
            active_hours=Sum('active_hours'),
            leads_contacted=Sum('leads_contacted'),
            deals_progressed=Sum('deals_progressed'),
            calls_made=Sum('calls_made'),
            meetings_held=Sum('meetings_held'),
            avg_conversion_rate=Avg('conversion_rate'),
            avg_deal_value=Avg('avg_deal_value')
        )
        
        return Response(aggregates)
    
    @action(detail=False, methods=['get'])
    def trend(self, request):
        """Get performance trend data"""
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        metrics = MarketingPerformanceMetric.objects.filter(
            user=request.user,
            metric_date__gte=start_date.date()
        ).order_by('metric_date')
        
        data = {
            'dates': [],
            'total_hours': [],
            'active_hours': [],
            'leads_contacted': [],
            'deals_progressed': [],
        }
        
        for metric in metrics:
            data['dates'].append(metric.metric_date.isoformat())
            data['total_hours'].append(metric.total_hours)
            data['active_hours'].append(metric.active_hours)
            data['leads_contacted'].append(metric.leads_contacted)
            data['deals_progressed'].append(metric.deals_progressed)
        
        return Response(data)
    
    @action(detail=False, methods=['post'])
    def record_performance(self, request):
        """Record performance metrics for today"""
        today = timezone.now().date()
        
        metric, created = MarketingPerformanceMetric.objects.update_or_create(
            user=request.user,
            metric_date=today,
            defaults={
                'total_hours': request.data.get('total_hours', 0),
                'active_hours': request.data.get('active_hours', 0),
                'leads_contacted': request.data.get('leads_contacted', 0),
                'deals_progressed': request.data.get('deals_progressed', 0),
                'calls_made': request.data.get('calls_made', 0),
                'meetings_held': request.data.get('meetings_held', 0),
                'conversion_rate': request.data.get('conversion_rate', 0),
                'avg_deal_value': request.data.get('avg_deal_value', 0),
            }
        )
        
        serializer = self.get_serializer(metric)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=status_code)
```

## 4. URLs (dashboard/urls.py)

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DashboardViewSet, ActivityViewSet, AISuggestionViewSet, MarketingPerformanceViewSet

router = DefaultRouter()
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'activities', ActivityViewSet, basename='activity')
router.register(r'suggestions', AISuggestionViewSet, basename='suggestion')
router.register(r'performance', MarketingPerformanceViewSet, basename='performance')

urlpatterns = [
    path('', include(router.urls)),
]
```

## 5. Admin Configuration (dashboard/admin.py)

```python
from django.contrib import admin
from .models import DashboardMetric, DashboardActivity, AISuggestion, MarketingPerformanceMetric


@admin.register(DashboardMetric)
class DashboardMetricAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_leads', 'active_deals', 'customer_satisfaction_rate', 'last_calculated']
    list_filter = ['last_calculated']
    search_fields = ['user__email', 'user__first_name']
    readonly_fields = ['last_calculated']
    
    actions = ['recalculate_metrics']
    
    def recalculate_metrics(self, request, queryset):
        for metric in queryset:
            metric.calculate_metrics()
        self.message_user(request, f"Recalculated metrics for {queryset.count()} users.")
    recalculate_metrics.short_description = "Recalculate selected metrics"


@admin.register(DashboardActivity)
class DashboardActivityAdmin(admin.ModelAdmin):
    list_display = ['user', 'activity_type', 'title', 'created_at']
    list_filter = ['activity_type', 'created_at']
    search_fields = ['user__email', 'title', 'description']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('User & Type', {
            'fields': ('user', 'activity_type')
        }),
        ('Content', {
            'fields': ('title', 'description', 'action')
        }),
        ('Related Objects', {
            'fields': ('lead_id', 'deal_id', 'task_id'),
            'classes': ('collapse',)
        }),
        ('Changes', {
            'fields': ('old_value', 'new_value'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
        }),
    )


@admin.register(AISuggestion)
class AISuggestionAdmin(admin.ModelAdmin):
    list_display = ['user', 'suggestion_type', 'priority', 'title', 'confidence_score', 'is_actioned', 'created_at']
    list_filter = ['suggestion_type', 'priority', 'is_actioned', 'created_at']
    search_fields = ['user__email', 'title', 'description']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Suggestion Details', {
            'fields': ('user', 'suggestion_type', 'priority', 'title', 'description')
        }),
        ('Metrics', {
            'fields': ('confidence_score', 'metric_value', 'metric_change')
        }),
        ('Related Objects', {
            'fields': ('lead_ids', 'deal_ids'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_actioned', 'actioned_at', 'action_notes')
        }),
        ('Timeline', {
            'fields': ('created_at', 'expires_at')
        }),
    )


@admin.register(MarketingPerformanceMetric)
class MarketingPerformanceAdmin(admin.ModelAdmin):
    list_display = ['user', 'metric_date', 'total_hours', 'active_hours', 'leads_contacted', 'conversion_rate']
    list_filter = ['metric_date', 'user']
    search_fields = ['user__email']
    
    fieldsets = (
        ('User & Date', {
            'fields': ('user', 'metric_date')
        }),
        ('Hours Tracking', {
            'fields': ('total_hours', 'active_hours')
        }),
        ('Activity Metrics', {
            'fields': ('leads_contacted', 'deals_progressed', 'calls_made', 'meetings_held')
        }),
        ('Performance', {
            'fields': ('conversion_rate', 'avg_deal_value')
        }),
    )
```

## 6. Main Project URLs Configuration

Add to your main `urls.py`:

```python
from django.urls import path, include

urlpatterns = [
    # ... other patterns
    path('api/dashboard/', include('dashboard.urls')),
]
```

## 7. Settings Configuration

Ensure these settings in your `settings.py`:

```python
INSTALLED_APPS = [
    # ... other apps
    'rest_framework',
    'dashboard',
    'leads',  # Required for metrics
    'deals',  # Required for metrics
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

## 8. API Endpoints Reference

### Dashboard Summary
- `GET /api/dashboard/dashboard/summary/` - Get complete dashboard summary
- `GET /api/dashboard/dashboard/metrics/` - Get current metrics
- `POST /api/dashboard/dashboard/refresh_metrics/` - Force refresh metrics

### Activities
- `GET /api/dashboard/activities/` - List recent activities
- `GET /api/dashboard/activities/recent/?limit=15` - Get recent activities
- `GET /api/dashboard/activities/summary/` - Get activity summary
- `POST /api/dashboard/activities/log_activity/` - Log a new activity
- `GET /api/dashboard/activities/?type=lead_created&days=7` - Filter activities

### AI Suggestions
- `GET /api/dashboard/suggestions/` - List all suggestions
- `GET /api/dashboard/suggestions/active/` - Get active suggestions
- `POST /api/dashboard/suggestions/create_suggestion/` - Create new suggestion
- `POST /api/dashboard/suggestions/{id}/mark_actioned/` - Mark as actioned
- `GET /api/dashboard/suggestions/?priority=high&type=risk_alert` - Filter suggestions

### Marketing Performance
- `GET /api/dashboard/performance/` - List performance metrics
- `GET /api/dashboard/performance/current_month/` - Current month performance
- `GET /api/dashboard/performance/trend/?days=30` - Performance trend
- `POST /api/dashboard/performance/record_performance/` - Record today's metrics

## 9. Query Parameters

### Activities
- `?type=lead_created` - Filter by activity type
- `?days=7` - Get activities from last N days
- `?limit=15` - Limit results

### Suggestions
- `?priority=high` - Filter by priority (low, medium, high, critical)
- `?type=follow_up` - Filter by type
- `?active_only=true` - Only active suggestions

### Performance
- `?start_date=2026-02-01` - Filter from date
- `?end_date=2026-02-28` - Filter until date
- `?days=30` - Get trend for last N days

## 10. Signal Handlers for Automatic Activity Logging

Create `dashboard/signals.py`:

```python
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from leads.models import Lead
from deals.models import Deal
from tasks.models import Task
from .models import DashboardActivity


@receiver(post_save, sender=Lead)
def log_lead_activity(sender, instance, created, **kwargs):
    """Log lead creation/update"""
    activity_type = 'lead_created' if created else 'lead_updated'
    DashboardActivity.objects.create(
        user=instance.owner,
        activity_type=activity_type,
        title=f"Lead: {instance.company_name}",
        description=f"Lead created for {instance.company_name}",
        action=f"{'Created' if created else 'Updated'} lead '{instance.company_name}'",
        lead_id=instance.id
    )


@receiver(post_save, sender=Deal)
def log_deal_activity(sender, instance, created, **kwargs):
    """Log deal creation/update"""
    activity_type = 'deal_created' if created else 'deal_updated'
    DashboardActivity.objects.create(
        user=instance.owner,
        activity_type=activity_type,
        title=f"Deal: {instance.title}",
        description=f"Deal {instance.title} - {instance.stage}",
        action=f"{'Created' if created else 'Updated'} deal '{instance.title}'",
        deal_id=instance.id
    )


@receiver(post_delete, sender=Lead)
def log_lead_deletion(sender, instance, **kwargs):
    """Log lead deletion"""
    DashboardActivity.objects.create(
        user=instance.owner,
        activity_type='lead_deleted',
        title=f"Lead Deleted: {instance.company_name}",
        description=f"Lead {instance.company_name} was deleted",
        action=f"Deleted lead '{instance.company_name}'",
        lead_id=instance.id
    )
```

Add to `dashboard/apps.py`:

```python
from django.apps import AppConfig

class DashboardConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dashboard'
    
    def ready(self):
        import dashboard.signals
```

## 11. Database Migrations

```bash
# Create migrations
python manage.py makemigrations dashboard

# Apply migrations
python manage.py migrate dashboard
```

## 12. Testing Checklist

- [ ] Get dashboard summary
- [ ] Refresh metrics
- [ ] Log activity
- [ ] Get recent activities
- [ ] Get activity summary
- [ ] Create AI suggestion
- [ ] Mark suggestion as actioned
- [ ] Get active suggestions
- [ ] Record performance metrics
- [ ] Get current month performance
- [ ] Get performance trend
- [ ] Test signal-based activity logging
- [ ] Verify metrics calculation
- [ ] Test permission restrictions

## 13. Security Considerations

- ✅ JWT authentication required for all endpoints
- ✅ Users can only view their own dashboard data
- ✅ Activity logging is automatic via signals
- ✅ AI suggestions are filtered by expiry and status

## 14. Performance Optimizations

- DashboardMetric cached with OneToOne relation
- Database indexes on user + created_at
- Prefetch related data in queries
- Limit activity feed results
- Cache metrics calculation (recalculated on-demand)

## 15. Frontend Integration

```javascript
// API calls for dashboard
const API_BASE = 'http://localhost:8000/api/dashboard';

// Get dashboard summary
export const getDashboardSummary = async () => {
  const response = await axios.get(`${API_BASE}/dashboard/summary/`);
  return response.data;
};

// Get recent activities
export const getActivities = async (params = {}) => {
  const response = await axios.get(`${API_BASE}/activities/`, { params });
  return response.data;
};

// Get AI suggestions
export const getSuggestions = async (params = {}) => {
  const response = await axios.get(`${API_BASE}/suggestions/active/`, { params });
  return response.data;
};

// Log activity
export const logActivity = async (activity) => {
  const response = await axios.post(`${API_BASE}/activities/log_activity/`, activity);
  return response.data;
};

// Get marketing performance
export const getPerformance = async () => {
  const response = await axios.get(`${API_BASE}/performance/current_month/`);
  return response.data;
};
```

## Need Help?

- Django REST Framework: https://www.django-rest-framework.org/
- Django Signals: https://docs.djangoproject.com/en/stable/topics/signals/
- Database optimization: https://docs.djangoproject.com/en/stable/topics/db/optimization/
