from django.db import models
from django.conf import settings
from django.db.models import UniqueConstraint
 
TASK_TYPE_CHOICES = [
    ('create_content', 'Create Content'),
    ('create_code', 'Create Code'),
    ('research', 'Research'),
    ('deep_research', 'Deep Research / Analysis'),
    ('plan_organize', 'Plan & Organize'),
    ('ideate', 'Ideate / Brainstorm'),
    ('summarize', 'Summarize / Review'),
    ('explain', 'Explain / Teach'),
    ('optimize', 'Optimize / Improve'),
]
 
OUTPUT_FORMAT_CHOICES = [
    ('text', 'Text'),
    ('code', 'Code'),
    ('chart_graph', 'Chart / Graph'),
    ('checklist_table', 'Checklist / Table'),
    ('template_framework', 'Template / Framework'),
    ('image_visual', 'Image / Visual'),
    ('slide_report', 'Slide / Report'),
]
 
CATEGORY_CHOICES = [
    ('marketing', 'Marketing'),
    ('sales', 'Sales'),
    ('engineering', 'Engineering'),
    ('design', 'Design'),
    ('product_management', 'Product Management'),
    ('hr', 'Human Resources'),
    ('finance', 'Finance'),
    ('support', 'Support'),
    ('content_comms', 'Communications'),
    ('learning', 'Learning & Development'),
]
 
STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('approved', 'Approved'),
    ('rejected', 'Rejected'),
]
 
class Prompt(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="prompts",
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255, blank=False, null=False)
    prompt_description = models.TextField(blank=True, null=True)
    prompt_text = models.TextField(blank=False, null=False)
    guidance = models.TextField(blank=True, null=True)

    task_type = models.CharField(
        max_length=50,
        choices=TASK_TYPE_CHOICES,
        blank=True,
        null=True
    )
    output_format = models.CharField(
        max_length=50,
        choices=OUTPUT_FORMAT_CHOICES,
        blank=True,
        null=True
    )
    category = models.CharField(max_length=50, blank=False)

    is_public = models.BooleanField(default=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True
    )

    vote = models.IntegerField(default=0)
    like_count = models.IntegerField(default=0)
    dislike_count = models.IntegerField(default=0)
    copy_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title if self.title else f'Prompt {self.id}'
 
class Vote(models.Model):
    VOTE_UP = 1
    VOTE_DOWN = -1  
    VOTE_CHOICES = (
        (VOTE_UP, "Upvote"),
        (VOTE_DOWN, "Downvote"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="votes")
    prompt = models.ForeignKey("Prompt", on_delete=models.CASCADE, related_name="votes")
    value = models.SmallIntegerField(choices=VOTE_CHOICES)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            UniqueConstraint(fields=["user", "prompt"], name="unique_user_prompt_vote")
        ]

    def __str__(self):
        return f"user={self.user_id} prompt={self.prompt_id} value={self.value}"
 
class Bookmark(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookmarks")
    prompt = models.ForeignKey("Prompt", on_delete=models.CASCADE, related_name="bookmarks")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            UniqueConstraint(fields=["user", "prompt"], name="unique_user_prompt_bookmark")
        ]

    def __str__(self):
        return f"user={self.user_id} prompt={self.prompt_id}"
 
class PromptVersion(models.Model):
    prompt = models.ForeignKey(
        Prompt,
        on_delete=models.CASCADE,
        related_name="versions"
    )
    edited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    version_created_at = models.DateTimeField(auto_now_add=True)

    title = models.CharField(max_length=255)
    prompt_description = models.TextField(blank=True, null=True)
    prompt_text = models.TextField()
    guidance = models.TextField(blank=True, null=True)

    task_type = models.CharField(max_length=50, choices=TASK_TYPE_CHOICES)
    output_format = models.CharField(max_length=50, choices=OUTPUT_FORMAT_CHOICES)
    category = models.CharField(max_length=50)

    class Meta:
        ordering = ['-version_created_at']
 
    def __str__(self):
        return f"{self.prompt.title} (Version @ {self.version_created_at.strftime('%Y-%m-%d %H:%M')})"
 
class CopiedPromptFeedback(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("submitted", "Submitted"),
        ("skipped", "Skipped"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    prompt = models.ForeignKey("Prompt", on_delete=models.CASCADE, related_name="feedbacks")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    rating = models.IntegerField(default=0, null=True, blank=True)
    feedback_text = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.prompt} - {self.rating} stars"
