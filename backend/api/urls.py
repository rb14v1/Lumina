from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PromptViewSet,
    RegisterView,
    CategoryListView,
    MicrosoftLoginView,
    PromoteAdminView,
    CurrentUserView,
    BookmarkToggleView,
    save_copied_prompt,
    check_pending_feedback,
    submit_copy_feedback,
)
 
router = DefaultRouter()
router.register(r'prompts', PromptViewSet, basename='prompt')
 
urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('auth/promote-admin/', PromoteAdminView.as_view(), name='promote-admin'),
    path('sso-login/', MicrosoftLoginView.as_view(), name='company-sso'),
    path('auth/user/', CurrentUserView.as_view(), name='current-user'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('prompts/<int:pk>/upvote/', PromptViewSet.as_view({'post': 'upvote'}), name='prompt-upvote'),
    path('prompts/<int:pk>/downvote/', PromptViewSet.as_view({'post': 'downvote'}), name='prompt-downvote'),
    path('prompts/<int:pk>/bookmark/', BookmarkToggleView.as_view(), name='prompt-bookmark'),
    path('prompts/<int:pk>/history/', PromptViewSet.as_view({'get': 'history'}), name='prompt-history'),
    path("copy/save/", save_copied_prompt, name="save_copied_prompt"),
    path("copy/check/", check_pending_feedback, name="check_pending_feedback"),
    path("copy/submit/", submit_copy_feedback, name="submit_copy_feedback"),
    path("feedback/pending/", check_pending_feedback, name="check_pending_feedback_legacy"),
]
 
 