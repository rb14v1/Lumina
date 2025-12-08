from rest_framework import viewsets, permissions, generics, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.db.models import Q, F
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.http import Http404
from django.db import transaction
from rest_framework.permissions import IsAuthenticated
from .models import Vote, Bookmark, PromptVersion, Prompt, CATEGORY_CHOICES, CopiedPromptFeedback
from .serializers import PromptSerializer, PromptVersionSerializer, UserSerializer
import os
import jwt
import requests
from jwt.algorithms import RSAAlgorithm
from rest_framework.authtoken.models import Token

class IsAdminOrOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
 
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user
 
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer
 
class CategoryListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
   
    def get(self, request, *args, **kwargs):
        predefined_categories = [choice[0] for choice in CATEGORY_CHOICES]
        user_categories = list(
            request.user.prompts.all()
            .values_list('category', flat=True)
            .distinct()
        )
        all_categories = sorted(list(set(predefined_categories + user_categories)))
        return Response(all_categories)

class MicrosoftLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # 1. Get the token sent from React
        auth_header = request.data.get('access_token') 
        if not auth_header:
            return Response({'error': 'No token provided'}, status=400)

        # 2. Config (Move these to .env settings in real life!)
        TENANT_ID = os.getenv('TENANT_ID'),
        CLIENT_ID = os.getenv('CLIENT_ID'),
        
        # 3. Verify the Token with Microsoft
        # We fetch Microsoft's public keys to validate the signature
        jwks_url = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"
        
        try:
            # Decode the token header to find which key was used
            unverified_header = jwt.get_unverified_header(auth_header)
            rsa_key = self.get_rsa_key(jwks_url, unverified_header['kid'])
            
            # Decode the actual token
            decoded_token = jwt.decode(
                auth_header,
                rsa_key,
                algorithms=["RS256"],
                audience=CLIENT_ID # Ensures token is meant for YOUR app
                # issuer=... (Optional: add issuer check for extra security)
            )
            
            # 4. Extract User Info
            email = decoded_token.get('preferred_username') or decoded_token.get('email')
            name = decoded_token.get('name')

            if not email:
                return Response({'error': 'Invalid token: Email missing'}, status=400)

            # 5. Sync with Django DB
            # Check if user exists, if not, create them (Auto-Registration)
            user, created = User.objects.get_or_create(username=email, defaults={
                'email': email,
                'first_name': name
            })

            # 6. Generate Django Token for the session
            # If using DRF Token Auth:
            token, _ = Token.objects.get_or_create(user=user)
            
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'is_staff': user.is_staff
            })

        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token expired'}, status=401)
        except Exception as e:
            print(f"SSO Error: {e}")
            return Response({'error': 'Invalid token'}, status=401)

    # Helper to find the right encryption key
    def get_rsa_key(self, jwks_url, kid):
        jwks = requests.get(jwks_url).json()
        for key in jwks['keys']:
            if key['kid'] == kid:
                return RSAAlgorithm.from_jwk(key)
        raise Exception("Public key not found")
    

class PromoteAdminView(APIView):
    permission_classes = [permissions.IsAdminUser]
   
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        if not username:
            return Response({'error': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)
        user_to_promote = get_object_or_404(User, username=username)
        if user_to_promote.is_staff:
            return Response({'message': f'User "{username}" is already an admin.'}, status=status.HTTP_400_BAD_REQUEST)
        user_to_promote.is_staff = True
        user_to_promote.save()
        return Response({'message': f'Successfully promoted user "{username}" to admin.'})
 
class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
 
    def get(self, request, *args, **kwargs):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
        })
 
class PromptViewSet(viewsets.ModelViewSet):
    serializer_class = PromptSerializer
    queryset = Prompt.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdminOrOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'task_type', 'output_format', 'status']
    search_fields = ['title', 'prompt_description', 'prompt_text']

    def get_queryset(self):
        user = self.request.user
        params = self.request.query_params

        # ----- base queryset (your existing logic, just stored in qs) -----
        if user.is_staff:
            if params.get('mine') == '1':
                qs = Prompt.objects.filter(user=user).order_by('-copy_count', '-created_at')

            else:
                username = params.get('username')
                if username:
                    qs = Prompt.objects.filter(user__username=username).order_by('-copy_count', '-created_at')
                else:
                    qs = Prompt.objects.filter(is_public=True).order_by('-copy_count', '-created_at')
        else:
            if params.get('mine') == '1':
                qs = Prompt.objects.filter(user=user).order_by('-copy_count', '-created_at')
            else:
                username = params.get('username')
                if username:
                    qs = Prompt.objects.filter(
                        status='approved',
                        is_public=True
                    ).order_by('-copy_count', '-created_at')
                else:
                    qs = Prompt.objects.filter(
                        status='approved',
                        is_public=True
                    ).order_by('-copy_count', '-created_at')

        # ----- NEW: limit + offset (for lazy loading) -----
        limit = params.get('limit')
        offset = params.get('offset')

        try:
            offset_int = int(offset) if offset is not None else 0
            if offset_int < 0:
                offset_int = 0
        except ValueError:
            offset_int = 0

        if limit is not None:
            try:
                limit_int = int(limit)
                if limit_int > 0:
                    return qs[offset_int: offset_int + limit_int]
            except ValueError:
                pass  # if invalid limit, just ignore and return full qs

        # default behaviour (no limit)
        return qs

    def _auto_approve_if_private(self, serializer):
        is_public = serializer.validated_data.get("is_public", True)

        if not is_public:
            serializer.validated_data["status"] = "approved"
        else:
            serializer.validated_data["status"] = "pending"


    def get_object(self):
        try:
            return super().get_object()
        except Http404:
            lookup_field = self.lookup_field or 'pk'
            lookup = self.kwargs.get(lookup_field)
            Model = self.queryset.model
            try:
                obj = Model.objects.get(pk=lookup)
            except Model.DoesNotExist:
                raise Http404
 
            user = self.request.user
            if user.is_authenticated and (user.is_staff or getattr(obj, 'user', None) == user):
                return obj
            raise Http404
 
    def perform_create(self, serializer):
        self._auto_approve_if_private(serializer)
        prompt = serializer.save(user=self.request.user)
        if prompt.status == 'approved':
            PromptVersion.objects.create(
                prompt=prompt,
                edited_by=self.request.user if self.request.user.is_authenticated else None,
                title=prompt.title,
                prompt_description=prompt.prompt_description,
                prompt_text=prompt.prompt_text,
                guidance=prompt.guidance,
                task_type=prompt.task_type,
                output_format=prompt.output_format,
                category=prompt.category
            )
   
    def perform_update(self, serializer):
        prompt_before_edit = self.get_object()
        self._auto_approve_if_private(serializer)
        if prompt_before_edit.status == 'approved':
            PromptVersion.objects.create(
                prompt=prompt_before_edit,
                edited_by=self.request.user,
                title=prompt_before_edit.title,
                prompt_description=prompt_before_edit.prompt_description,
                prompt_text=prompt_before_edit.prompt_text,
                guidance=prompt_before_edit.guidance,
                task_type=prompt_before_edit.task_type,
                output_format=prompt_before_edit.output_format,
                category=prompt_before_edit.category
            )
        if not self.request.user.is_staff:
            serializer.save(status='pending')
        else:
            serializer.save()
 
    def create(self, request, *args, **kwargs):
        existing_id = request.data.get('id') or request.data.get('pk')
        if existing_id:
            try:
                prompt = Prompt.objects.get(pk=existing_id)
            except Prompt.DoesNotExist:
                return super().create(request, *args, **kwargs)
            self.check_object_permissions(request, prompt)
 
            serializer = self.get_serializer(prompt, data=request.data)
            serializer.is_valid(raise_exception=True)
 
            prompt_before_edit = prompt
            if prompt_before_edit.status == 'approved':
                PromptVersion.objects.create(
                    prompt=prompt_before_edit,
                    edited_by=request.user,
                    title=prompt_before_edit.title,
                    prompt_description=prompt_before_edit.prompt_description,
                    prompt_text=prompt_before_edit.prompt_text,
                    guidance=prompt_before_edit.guidance,
                    task_type=prompt_before_edit.task_type,
                    output_format=prompt_before_edit.output_format,
                    category=prompt_before_edit.category
                )
 
            if not request.user.is_staff:
                serializer.save(status='pending')
            else:
                serializer.save()
 
            return Response(serializer.data, status=status.HTTP_200_OK)
        return super().create(request, *args, **kwargs)
 
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        prompt = self.get_object()
        if prompt.status == 'approved':
            return Response({'detail': 'Prompt is already approved.'}, status=status.HTTP_400_BAD_REQUEST)
        prompt.status = 'approved'
        prompt.save()
        return Response(PromptSerializer(prompt).data)
 
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        prompt = self.get_object()
        if prompt.status == 'rejected':
            return Response({'detail': 'Prompt is already rejected.'}, status=status.HTTP_400_BAD_REQUEST)
        prompt.status = 'rejected'
        prompt.save()
        return Response(PromptSerializer(prompt).data)
 
    def _handle_vote(self, request, pk, value_to_set):
        prompt = self.get_object()
        user = request.user
 
        with transaction.atomic():
            existing = Vote.objects.filter(user=user, prompt=prompt).first()
 
            if existing is None:
                Vote.objects.create(user=user, prompt=prompt, value=value_to_set)
            else:
                if existing.value == value_to_set:
                    existing.delete()
                else:
                    existing.value = value_to_set
                    existing.save()
            prompt.refresh_from_db()
           
            likes = prompt.votes.filter(value=1).count()
            dislikes = prompt.votes.filter(value=-1).count()
 
            prompt.like_count = likes
            prompt.dislike_count = dislikes
            prompt.vote = likes - dislikes
           
            prompt.save(update_fields=['like_count', 'dislike_count', 'vote'])
 
        serializer = PromptSerializer(prompt, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
 
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def upvote(self, request, pk=None):
        return self._handle_vote(request, pk, value_to_set=1)
 
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def downvote(self, request, pk=None):
        return self._handle_vote(request, pk, value_to_set=-1)
   
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def copy(self, request, pk=None):
        prompt = self.get_object()
       
        prompt.copy_count = F('copy_count') + 1
        prompt.save()
       
        prompt.refresh_from_db()
       
        return Response({'copy_count': prompt.copy_count}, status=status.HTTP_200_OK)
 
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def history(self, request, pk=None):
        prompt = self.get_object()
        if not request.user.is_staff and prompt.user != request.user:
            return Response(
                {'detail': 'You do not have permission to view this history.'},
                status=status.HTTP_403_FORBIDDEN
            )
        versions = prompt.versions.all()
        serializer = PromptVersionSerializer(versions, many=True)
        return Response(serializer.data)
   
    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrOwner], url_path='revert/(?P<version_id>\\d+)')
    def revert(self, request, pk=None, version_id=None):
       
        prompt = self.get_object()
        version = get_object_or_404(PromptVersion, pk=version_id)
 
        if version.prompt != prompt:
            return Response(
                {'error': 'Version does not belong to this prompt.'},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        if prompt.status == 'approved':
            PromptVersion.objects.create(
                prompt=prompt,
                edited_by=request.user,
                title=prompt.title,
                prompt_description=prompt.prompt_description,
                prompt_text=prompt.prompt_text,
                guidance=prompt.guidance,
                task_type=prompt.task_type,
                output_format=prompt.output_format,
                category=prompt.category
            )
       
        prompt.title = version.title
        prompt.prompt_description = version.prompt_description
        prompt.prompt_text = version.prompt_text
        prompt.guidance = version.guidance
        prompt.task_type = version.task_type
        prompt.output_format = version.output_format
        prompt.category = version.category
       
        if not request.user.is_staff:
            prompt.status = 'pending'
       
        prompt.save()
       
        serializer = self.get_serializer(prompt)
        return Response(serializer.data, status=status.HTTP_200_OK)
 
 
class BookmarkToggleView(APIView):
    permission_classes = [IsAuthenticated]
 
    def post(self, request, pk, *args, **kwargs):
        prompt = get_object_or_404(Prompt, pk=pk)
        user = request.user
        existing = prompt.bookmarks.filter(user=user).first()
        if existing is None:
            Bookmark.objects.create(user=user, prompt=prompt)
        else:
            existing.delete()
 
        serializer = PromptSerializer(prompt, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
 
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_copied_prompt(request):
    prompt_id = request.data.get("prompt_id")
 
    if not prompt_id:
        return Response({"error": "prompt_id is required"}, status=400)
 
    prompt = get_object_or_404(Prompt, id=prompt_id)
 
    CopiedPromptFeedback.objects.filter(
        user=request.user,
        status="pending"
    ).delete()
 
    CopiedPromptFeedback.objects.create(
        user=request.user,
        prompt=prompt,
        status="pending"
    )
 
    return Response({
        "message": "Pending copy feedback created",
        "prompt_id": prompt.id
    })
 
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_pending_feedback(request):
    pending = CopiedPromptFeedback.objects.filter(
        user=request.user,
        status="pending"
    ).order_by("-created_at").first()
 
    if not pending:
        return Response({"pending": False})
 
    return Response({
        "pending": True,
        "prompt_id": pending.prompt.id,
        "prompt_title": pending.prompt.title
    })
 
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_copy_feedback(request):
    prompt_id = request.data.get("prompt_id")
    status_value = request.data.get("status") # 'submitted' or 'skipped'
    rating_value = request.data.get("rating") # Integer 1-5
    feedback_text = request.data.get("feedback", "")

    if not prompt_id or not status_value:
        return Response({"error": "prompt_id and status required"}, status=400)

    feedback = CopiedPromptFeedback.objects.filter(
        user=request.user,
        prompt_id=prompt_id,
        status="pending"
    ).first()

    if not feedback:
        return Response({"error": "No pending feedback found"}, status=404)

    feedback.status = status_value
    
    # Only save rating if it was actually submitted (not skipped)
    if status_value == "submitted" and rating_value:
        feedback.rating = int(rating_value)
    
    feedback.feedback_text = feedback_text
    feedback.save()

    return Response({"message": "Feedback saved"})