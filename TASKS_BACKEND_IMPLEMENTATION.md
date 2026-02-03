# Django Backend for Tasks Module

## Step-by-Step Implementation Guide

### Step 1: Create Django App (if not exists)

```bash
cd crmbackend
python manage.py startapp tasks
```

### Step 2: Add to INSTALLED_APPS

```python
# crmbackend/settings.py

INSTALLED_APPS = [
    # ... existing apps
    'tasks',
]
```

---

## Step 3: Create Models

Create `tasks/models.py`:

```python
from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class Task(models.Model):
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]
    
    STAGE_CHOICES = [
        ('To Do', 'To Do'),
        ('In Progress', 'In Progress'),
        ('Review', 'Review'),
        ('Done', 'Done'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    client = models.CharField(max_length=255, default='Internal')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    due_date = models.DateField(null=True, blank=True)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='To Do')
    
    # Assignees
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_tasks'
    )
    
    # Generic relation to link to Leads, Contacts, Deals
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    related_to = GenericForeignKey('content_type', 'object_id')
    
    # Cover image
    image = models.ImageField(upload_to='task_images/', null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_tasks'
    )
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return self.title
    
    @property
    def priority_color(self):
        colors = {
            'Critical': 'bg-purple-100 text-purple-600',
            'High': 'bg-red-100 text-red-600',
            'Medium': 'bg-blue-100 text-blue-600',
            'Low': 'bg-gray-100 text-gray-600',
        }
        return colors.get(self.priority, 'bg-gray-100 text-gray-600')
    
    @property
    def is_overdue(self):
        if self.due_date and self.stage != 'Done':
            from django.utils import timezone
            return self.due_date < timezone.now().date()
        return False


class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.author.email} on {self.task.title}"


class TaskAttachment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='task_attachments/')
    file_name = models.CharField(max_length=255)
    file_size = models.CharField(max_length=50)  # e.g., "1.5 MB"
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.file_name
```

---

## Step 4: Create Serializers

Create `tasks/serializers.py`:

```python
from rest_framework import serializers
from .models import Task, TaskComment, TaskAttachment
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    initials = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'initials']
    
    def get_initials(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name[0]}{obj.last_name[0]}".upper()
        return obj.email[:2].upper()


class TaskCommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskComment
        fields = ['id', 'text', 'author', 'date', 'initials', 'created_at']
        read_only_fields = ['created_at']
    
    def get_author(self, obj):
        return obj.author.first_name or obj.author.email.split('@')[0]
    
    def get_initials(self, obj):
        if obj.author.first_name and obj.author.last_name:
            return f"{obj.author.first_name[0]}{obj.author.last_name[0]}".upper()
        return obj.author.email[:2].upper()
    
    def get_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')


class TaskAttachmentSerializer(serializers.ModelSerializer):
    size = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    data = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskAttachment
        fields = ['id', 'file', 'file_name', 'size', 'date', 'type', 'data', 'created_at']
        read_only_fields = ['created_at']
    
    def get_size(self, obj):
        return obj.file_size
    
    def get_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')
    
    def get_type(self, obj):
        import mimetypes
        return mimetypes.guess_type(obj.file.name)[0] or 'application/octet-stream'
    
    def get_data(self, obj):
        # Return file URL instead of base64 (for performance)
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None


class TaskSerializer(serializers.ModelSerializer):
    assignee = serializers.SerializerMethodField()
    activity = serializers.SerializerMethodField()
    commentsList = TaskCommentSerializer(source='comments', many=True, read_only=True)
    attachmentsList = TaskAttachmentSerializer(source='attachments', many=True, read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'client', 'priority', 
            'due_date', 'stage', 'assignee', 'image', 
            'priority_color', 'is_overdue', 'activity',
            'commentsList', 'attachmentsList',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'priority_color', 'is_overdue']
    
    def get_assignee(self, obj):
        if obj.assigned_to:
            initials = obj.assigned_to.first_name[:1] + obj.assigned_to.last_name[:1] if obj.assigned_to.first_name else obj.assigned_to.email[:2]
            return [{
                'initials': initials.upper(),
                'color': 'bg-purple-500'
            }]
        return []
    
    def get_activity(self, obj):
        return {
            'comments': obj.comments.count(),
            'attachments': obj.attachments.count(),
            'commentsList': TaskCommentSerializer(obj.comments.all(), many=True).data,
            'attachmentsList': TaskAttachmentSerializer(
                obj.attachments.all(), 
                many=True, 
                context=self.context
            ).data,
        }


class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    assigneeInitials = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'client', 'priority',
            'due_date', 'stage', 'assigneeInitials', 'image'
        ]
    
    def create(self, validated_data):
        validated_data.pop('assigneeInitials', None)
        validated_data['created_by'] = self.context['request'].user
        validated_data['assigned_to'] = self.context['request'].user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        validated_data.pop('assigneeInitials', None)
        return super().update(instance, validated_data)
```

---

## Step 5: Create Views

Create `tasks/views.py`:

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import Task, TaskComment, TaskAttachment
from .serializers import (
    TaskSerializer, 
    TaskCreateUpdateSerializer,
    TaskCommentSerializer,
    TaskAttachmentSerializer
)


class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        # Users see only their tasks or tasks assigned to them
        user = self.request.user
        return Task.objects.filter(created_by=user) | Task.objects.filter(assigned_to=user)
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TaskCreateUpdateSerializer
        return TaskSerializer
    
    @extend_schema(tags=['Tasks'])
    def list(self, request):
        """Get all tasks for the authenticated user"""
        queryset = self.get_queryset()
        
        # Filter by stage (for tabs)
        stage = request.query_params.get('stage')
        if stage:
            queryset = queryset.filter(stage=stage)
        
        # Filter by priority
        priority = request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Search
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search) | \
                       queryset.filter(description__icontains=search) | \
                       queryset.filter(client__icontains=search)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @extend_schema(tags=['Tasks'])
    def create(self, request):
        """Create a new task"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Return full task data
        task = Task.objects.get(id=serializer.data['id'])
        response_serializer = TaskSerializer(task, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @extend_schema(tags=['Tasks'])
    def update(self, request, pk=None):
        """Update a task"""
        task = self.get_object()
        serializer = self.get_serializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Return full task data
        response_serializer = TaskSerializer(task, context={'request': request})
        return Response(response_serializer.data)
    
    @extend_schema(tags=['Tasks'])
    def destroy(self, request, pk=None):
        """Delete a task"""
        task = self.get_object()
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @extend_schema(tags=['Tasks'], methods=['POST'])
    @action(detail=True, methods=['post'])
    def comments(self, request, pk=None):
        """Add a comment to a task"""
        task = self.get_object()
        
        comment = TaskComment.objects.create(
            task=task,
            author=request.user,
            text=request.data.get('text', '')
        )
        
        serializer = TaskCommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @extend_schema(tags=['Tasks'], methods=['POST'])
    @action(detail=True, methods=['post'])
    def attachments(self, request, pk=None):
        """Add an attachment to a task"""
        task = self.get_object()
        
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'detail': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate file size
        file_size = file.size / 1024  # KB
        if file_size > 1024:
            size_str = f"{file_size / 1024:.1f} MB"
        else:
            size_str = f"{file_size:.1f} KB"
        
        attachment = TaskAttachment.objects.create(
            task=task,
            file=file,
            file_name=file.name,
            file_size=size_str,
            uploaded_by=request.user
        )
        
        serializer = TaskAttachmentSerializer(attachment, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @extend_schema(tags=['Tasks'], methods=['DELETE'])
    @action(detail=True, methods=['delete'], url_path='attachments/(?P<attachment_id>[^/.]+)')
    def delete_attachment(self, request, pk=None, attachment_id=None):
        """Delete an attachment"""
        task = self.get_object()
        
        try:
            attachment = task.attachments.get(id=attachment_id)
            attachment.file.delete()  # Delete file from storage
            attachment.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TaskAttachment.DoesNotExist:
            return Response(
                {'detail': 'Attachment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
```

---

## Step 6: Create URLs

Create `tasks/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
]
```

---

## Step 7: Update Main URLs

Update `crmbackend/urls.py`:

```python
from django.urls import path, include

urlpatterns = [
    # ... existing paths
    path('api/', include('tasks.urls')),  # Tasks API
]
```

---

## Step 8: Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## Step 9: Configure Media Files

Update `crmbackend/settings.py`:

```python
import os

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# For file uploads
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
```

Update main `urls.py`:

```python
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... your patterns
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

---

## API Endpoints Available

Once deployed, you'll have these endpoints:

```
GET    /api/tasks/                    # List all tasks
POST   /api/tasks/                    # Create task
GET    /api/tasks/{id}/               # Get task details
PUT    /api/tasks/{id}/               # Update task
PATCH  /api/tasks/{id}/               # Partial update
DELETE /api/tasks/{id}/               # Delete task

POST   /api/tasks/{id}/comments/      # Add comment
POST   /api/tasks/{id}/attachments/   # Add attachment
DELETE /api/tasks/{id}/attachments/{attachment_id}/  # Delete attachment
```

**Query Parameters:**
- `?stage=To Do` - Filter by stage
- `?priority=High` - Filter by priority
- `?search=design` - Search tasks

---

## Test with cURL

```bash
# Get all tasks
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8000/api/tasks/

# Create task
curl -X POST \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design Homepage",
    "description": "Create new landing page design",
    "client": "Acme Corp",
    "priority": "High",
    "due_date": "2026-02-15",
    "stage": "To Do"
  }' \
  http://localhost:8000/api/tasks/

# Update task stage (for drag-drop)
curl -X PATCH \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stage": "In Progress"}' \
  http://localhost:8000/api/tasks/1/
```

---

## Next: Update Frontend to Use API

Replace localStorage calls in `Tasks.jsx` with API calls. Would you like me to show you how?
