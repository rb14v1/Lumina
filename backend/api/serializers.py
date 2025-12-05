from rest_framework import serializers
from django.db.models import Sum
from .models import (Prompt, PromptVersion, TASK_TYPE_CHOICES,
    OUTPUT_FORMAT_CHOICES,)
from django.contrib.auth.models import User
 
 
class PromptSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    vote_count = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    dislike_count = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
   
    class Meta:
        model = Prompt
        fields = [
            'id',
            'user',
            'user_username',
            'title',
            'prompt_description',
            'prompt_text',
            'guidance',          
            'task_type',
            'output_format',
            'category',
            'is_public',
            'status',
            'vote',  
            'vote_count',
            'like_count',  
            'dislike_count',
            'copy_count',  
            'user_vote',
            'is_bookmarked',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'user',
            'user_username',
            'created_at',
            'updated_at',
            'status',
            'vote',
            'is_bookmarked',    
            'vote_count',
            'user_vote',
            'like_count',    
            'dislike_count',
            'copy_count',
        ]
   
    def get_vote_count(self, obj):
        agg = obj.votes.aggregate(total=Sum('value'))
        return agg['total'] or 0
 
    def get_user_vote(self, obj):
        request = self.context.get('request', None)
        if not request or not request.user or not request.user.is_authenticated:
            return 0
        v = obj.votes.filter(user=request.user).first()
        return v.value if v else 0
   
    def get_like_count(self, obj):
        return obj.votes.filter(value=1).count()
 
    def get_dislike_count(self, obj):
        return obj.votes.filter(value=-1).count()
   
    def get_is_bookmarked(self, obj):
        request = self.context.get('request', None)
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return obj.bookmarks.filter(user=request.user).exists()
    def get_like_count(self, obj):
        return obj.votes.filter(value=1).count()
 
 
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'is_staff', 'is_superuser']
        extra_kwargs = {
            'password': {'write_only': True},
            'is_staff': {'read_only': True},
            'is_superuser': {'read_only': True}
        }
 
    def create(self, validated_data):
       
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user
 
 
class PromptVersionSerializer(serializers.ModelSerializer):
    edited_by_username = serializers.ReadOnlyField(source='edited_by.username')
    task_type_label = serializers.SerializerMethodField()
    output_format_label = serializers.SerializerMethodField()
 
    class Meta:
        model = PromptVersion
        fields = [
            "id",
            "prompt",
            "title",
            "prompt_text",
            "prompt_description",
            "guidance",
            "task_type",
            "output_format",
            "category",
            "edited_by_username",
            "version_created_at",
            "task_type_label",
            "output_format_label",
        ]
 
    def get_task_type_label(self, obj):
        return dict(TASK_TYPE_CHOICES).get(obj.task_type, obj.task_type)
 
    def get_output_format_label(self, obj):
        return dict(OUTPUT_FORMAT_CHOICES).get(obj.output_format, obj.output_format)
 
 