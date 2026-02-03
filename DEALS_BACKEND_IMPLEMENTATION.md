# Deals Django Backend Implementation Guide

## Overview
This guide provides the complete backend implementation for the Deals module using Django REST Framework.

## 1. Models (deals/models.py)

```python
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Deal(models.Model):
    STAGE_CHOICES = [
        ('Clients', 'Clients'),
        ('Orders', 'Orders'),
        ('Tasks', 'Tasks'),
        ('Due Date', 'Due Date'),
        ('Revenue', 'Revenue'),
        ('Status', 'Status'),
    ]
    
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Won', 'Won'),
        ('Lost', 'Lost'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    client = models.CharField(max_length=255, blank=True, null=True)
    
    # Pipeline & Status
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='Clients')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    
    # Financial Information
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Deal value/revenue")
    
    # Timeline
    due_date = models.DateField(blank=True, null=True)
    
    # Assignment
    assignee_initials = models.CharField(max_length=10, blank=True, null=True)
    
    # Ownership & Timestamps
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deals')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.client or 'No Client'}"
    
    def get_activity_counts(self):
        """Return counts of comments and attachments"""
        return {
            'comments': self.comments.count(),
            'attachments': self.attachments.count(),
        }


class DealComment(models.Model):
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment on {self.deal.title} by {self.created_by.username}"


class DealAttachment(models.Model):
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='deal_attachments/')
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField(help_text="File size in bytes")
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.file_name} - {self.deal.title}"
    
    def save(self, *args, **kwargs):
        if self.file and not self.file_name:
            self.file_name = self.file.name
        if self.file and not self.file_size:
            self.file_size = self.file.size
        super().save(*args, **kwargs)
```

## 2. Serializers (deals/serializers.py)

```python
from rest_framework import serializers
from .models import Deal, DealComment, DealAttachment
from django.contrib.auth import get_user_model

User = get_user_model()


class DealCommentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = DealComment
        fields = ['id', 'deal', 'text', 'created_by', 'created_by_name', 
                  'created_by_username', 'created_at']
        read_only_fields = ['id', 'deal', 'created_by', 'created_at']


class DealAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = DealAttachment
        fields = ['id', 'deal', 'file', 'file_url', 'file_name', 'file_size', 
                  'uploaded_by', 'uploaded_by_name', 'uploaded_at']
        read_only_fields = ['id', 'deal', 'uploaded_by', 'uploaded_at', 'file_size']
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def validate_file(self, value):
        """Validate file size (max 5MB)"""
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size exceeds 5MB limit.")
        return value


class DealSerializer(serializers.ModelSerializer):
    activity = serializers.SerializerMethodField()
    comments_list = DealCommentSerializer(source='comments', many=True, read_only=True)
    attachments_list = DealAttachmentSerializer(source='attachments', many=True, read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    
    class Meta:
        model = Deal
        fields = ['id', 'title', 'description', 'client', 'stage', 'status', 
                  'amount', 'due_date', 'assignee_initials', 'owner', 'owner_name',
                  'activity', 'comments_list', 'attachments_list',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    def get_activity(self, obj):
        """Return activity counts and lists"""
        return {
            'comments': obj.comments.count(),
            'attachments': obj.attachments.count(),
            'commentsList': DealCommentSerializer(obj.comments.all(), many=True).data,
            'attachmentsList': DealAttachmentSerializer(
                obj.attachments.all(), 
                many=True, 
                context=self.context
            ).data,
        }
    
    def validate_stage(self, value):
        """Validate stage transitions"""
        if self.instance:
            # Prevent moving deals out of 'Status' stage
            if self.instance.stage == 'Status' and value != 'Status':
                raise serializers.ValidationError(
                    "Closed deals cannot be moved back to the pipeline."
                )
            
            # Only allow moving to 'Status' from 'Revenue'
            if value == 'Status' and self.instance.stage != 'Revenue':
                raise serializers.ValidationError(
                    "Deals can only be closed from the 'Revenue' stage."
                )
        
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        # If moving to Status stage, status must be Won or Lost
        if data.get('stage') == 'Status':
            status = data.get('status', self.instance.status if self.instance else 'Open')
            if status not in ['Won', 'Lost']:
                raise serializers.ValidationError({
                    'status': 'Status must be "Won" or "Lost" when in Status stage.'
                })
        
        return data


class DealListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    activity = serializers.SerializerMethodField()
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    
    class Meta:
        model = Deal
        fields = ['id', 'title', 'description', 'client', 'stage', 'status', 
                  'amount', 'due_date', 'assignee_initials', 'owner_name',
                  'activity', 'created_at', 'updated_at']
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    def get_activity(self, obj):
        """Return only counts for list view performance"""
        return obj.get_activity_counts()
```

## 3. Views (deals/views.py)

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q
from .models import Deal, DealComment, DealAttachment
from .serializers import (
    DealSerializer, 
    DealListSerializer,
    DealCommentSerializer, 
    DealAttachmentSerializer
)


class DealViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        """Return deals owned by the current user"""
        queryset = Deal.objects.filter(owner=self.request.user)
        
        # Filter by stage
        stage = self.request.query_params.get('stage')
        if stage:
            queryset = queryset.filter(stage=stage)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            if status_filter == 'Active':
                queryset = queryset.exclude(status__in=['Won', 'Lost'])
            else:
                queryset = queryset.filter(status=status_filter)
        
        # Search by title, client, or description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(client__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset.select_related('owner').prefetch_related(
            'comments', 'attachments'
        )
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return DealListSerializer
        return DealSerializer
    
    def perform_create(self, serializer):
        """Set the owner to the current user"""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add a comment to a deal"""
        deal = self.get_object()
        
        # Only pass text data, set deal and created_by in save()
        serializer = DealCommentSerializer(data={
            'text': request.data.get('text', '')
        })
        
        if serializer.is_valid():
            serializer.save(deal=deal, created_by=request.user)
            
            # Return updated deal with all comments
            deal_serializer = DealSerializer(deal, context={'request': request})
            return Response(deal_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_attachment(self, request, pk=None):
        """Add an attachment to a deal"""
        deal = self.get_object()
        file = request.FILES.get('file')
        
        if not file:
            return Response(
                {'file': 'No file provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Only pass file data, set deal and uploaded_by in save()
        serializer = DealAttachmentSerializer(
            data={'file': file},
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save(deal=deal, uploaded_by=request.user)
            
            # Return updated deal with all attachments
            deal_serializer = DealSerializer(deal, context={'request': request})
            return Response(deal_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'], url_path='attachments/(?P<attachment_id>[^/.]+)')
    def delete_attachment(self, request, pk=None, attachment_id=None):
        """Delete a specific attachment from a deal"""
        deal = self.get_object()
        
        try:
            attachment = DealAttachment.objects.get(id=attachment_id, deal=deal)
            attachment.file.delete()  # Delete file from storage
            attachment.delete()
            
            # Return updated deal
            deal_serializer = DealSerializer(deal, context={'request': request})
            return Response(deal_serializer.data, status=status.HTTP_200_OK)
        
        except DealAttachment.DoesNotExist:
            return Response(
                {'detail': 'Attachment not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'])
    def update_stage(self, request, pk=None):
        """Update deal stage with validation"""
        deal = self.get_object()
        new_stage = request.data.get('stage')
        
        if not new_stage:
            return Response(
                {'stage': 'This field is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(deal, data={'stage': new_stage}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'])
    def close_deal(self, request, pk=None):
        """Close a deal with Won/Lost status"""
        deal = self.get_object()
        outcome = request.data.get('status')
        
        if outcome not in ['Won', 'Lost']:
            return Response(
                {'status': 'Status must be "Won" or "Lost".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate that deal is in Revenue stage
        if deal.stage != 'Revenue':
            return Response(
                {'detail': 'Deals can only be closed from the Revenue stage.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(
            deal,
            data={'stage': 'Status', 'status': outcome},
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

## 4. URLs (deals/urls.py)

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DealViewSet

router = DefaultRouter()
router.register(r'deals', DealViewSet, basename='deal')

urlpatterns = [
    path('', include(router.urls)),
]
```

## 5. Admin Configuration (deals/admin.py)

```python
from django.contrib import admin
from .models import Deal, DealComment, DealAttachment


class DealCommentInline(admin.TabularInline):
    model = DealComment
    extra = 0
    readonly_fields = ['created_by', 'created_at']


class DealAttachmentInline(admin.TabularInline):
    model = DealAttachment
    extra = 0
    readonly_fields = ['uploaded_by', 'uploaded_at', 'file_size']


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ['title', 'client', 'stage', 'status', 'amount', 'due_date', 
                    'owner', 'created_at']
    list_filter = ['stage', 'status', 'created_at']
    search_fields = ['title', 'client', 'description']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [DealCommentInline, DealAttachmentInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'client')
        }),
        ('Pipeline', {
            'fields': ('stage', 'status')
        }),
        ('Financial', {
            'fields': ('amount', 'due_date')
        }),
        ('Assignment', {
            'fields': ('assignee_initials', 'owner')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DealComment)
class DealCommentAdmin(admin.ModelAdmin):
    list_display = ['deal', 'created_by', 'created_at', 'text_preview']
    list_filter = ['created_at']
    search_fields = ['text', 'deal__title']
    readonly_fields = ['created_by', 'created_at']
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Text Preview'


@admin.register(DealAttachment)
class DealAttachmentAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'deal', 'file_size', 'uploaded_by', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['file_name', 'deal__title']
    readonly_fields = ['uploaded_by', 'uploaded_at', 'file_size']
```

## 6. Main Project URLs Configuration

Add to your main `urls.py`:

```python
from django.urls import path, include

urlpatterns = [
    # ... other patterns
    path('api/', include('deals.urls')),
]
```

## 7. Settings Configuration

Ensure these settings in your `settings.py`:

```python
INSTALLED_APPS = [
    # ... other apps
    'rest_framework',
    'deals',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# File Upload Settings
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
```

## 8. API Endpoints Reference

### Deal Operations
- `GET /api/deals/` - List all deals
- `POST /api/deals/` - Create a new deal
- `GET /api/deals/{id}/` - Retrieve a specific deal
- `PUT /api/deals/{id}/` - Update a deal (full update)
- `PATCH /api/deals/{id}/` - Partial update a deal
- `DELETE /api/deals/{id}/` - Delete a deal

### Deal Actions
- `POST /api/deals/{id}/add_comment/` - Add a comment
- `POST /api/deals/{id}/add_attachment/` - Add an attachment
- `DELETE /api/deals/{id}/attachments/{attachment_id}/` - Delete an attachment
- `PATCH /api/deals/{id}/update_stage/` - Update deal stage
- `PATCH /api/deals/{id}/close_deal/` - Close deal (Won/Lost)

### Query Parameters
- `?stage=Clients` - Filter by stage
- `?status=Won` - Filter by status
- `?status=Active` - Filter active deals (not Won or Lost)
- `?search=keyword` - Search by title, client, or description

## 9. Testing Examples

### Create Deal
```bash
curl -X POST http://localhost:8000/api/deals/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Enterprise Deal",
    "description": "Large contract opportunity",
    "client": "Acme Corp",
    "stage": "Clients",
    "status": "Open",
    "amount": "50000.00",
    "due_date": "2026-03-15",
    "assignee_initials": "JD"
  }'
```

### Update Deal Stage
```bash
curl -X PATCH http://localhost:8000/api/deals/1/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "Orders"
  }'
```

### Close Deal
```bash
curl -X PATCH http://localhost:8000/api/deals/1/close_deal/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Won"
  }'
```

### Add Comment
```bash
curl -X POST http://localhost:8000/api/deals/1/add_comment/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Client confirmed the proposal"
  }'
```

### Add Attachment
```bash
curl -X POST http://localhost:8000/api/deals/1/add_attachment/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/contract.pdf"
```

## 10. Field Mapping Reference

| Frontend Field | Backend Field | Type | Notes |
|---------------|---------------|------|-------|
| title | title | String | Required |
| desc | description | Text | Optional |
| client | client | String | Optional |
| stage | stage | String | Pipeline position |
| status | status | String | Open/Won/Lost |
| revenue | amount | Decimal | Deal value |
| dueDate | due_date | Date | Optional |
| assigneeInitials | assignee_initials | String | Optional |

## 11. Business Rules Implementation

### Stage Transition Rules
1. **Locked Status**: Deals in 'Status' stage cannot be moved back to pipeline
2. **Closure Restriction**: Deals can only move to 'Status' from 'Revenue' stage
3. **Status Requirement**: Deals in 'Status' stage must have status 'Won' or 'Lost'

### File Upload Rules
- Maximum file size: 5MB
- Files stored in `media/deal_attachments/`
- File deletion removes both database record and file from storage

## 12. Database Migrations

```bash
# Create migrations
python manage.py makemigrations deals

# Apply migrations
python manage.py migrate deals

# Create superuser (if needed)
python manage.py createsuperuser
```

## 13. Testing Checklist

- [ ] Create deal with all fields
- [ ] Update deal stage through pipeline
- [ ] Try to move deal from Status back to pipeline (should fail)
- [ ] Try to move deal to Status from non-Revenue stage (should fail)
- [ ] Move deal from Revenue to Status with Won/Lost
- [ ] Add comments to deal
- [ ] Upload attachments (< 5MB)
- [ ] Try to upload large file (> 5MB, should fail)
- [ ] Delete attachment
- [ ] Filter deals by stage
- [ ] Filter deals by status
- [ ] Search deals by keyword
- [ ] Delete deal

## 14. Security Considerations

- ✅ JWT authentication required for all endpoints
- ✅ Users can only access their own deals
- ✅ File upload size validation
- ✅ Stage transition validation
- ✅ Proper error handling and validation messages

## 15. Performance Optimizations

- Use `select_related('owner')` to reduce database queries
- Use `prefetch_related('comments', 'attachments')` for related data
- Lightweight `DealListSerializer` for list views
- Activity counts cached in serializer method

## Need Help?

- Django REST Framework docs: https://www.django-rest-framework.org/
- Django file uploads: https://docs.djangoproject.com/en/stable/topics/http/file-uploads/
- JWT authentication: https://django-rest-framework-simplejwt.readthedocs.io/
