import random, string
from django.core.cache import cache
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import generics, status
from backend.settings import EMAIL_HOST_USER
from api.model_serializers.UserSerializers import UserSerializers, UserSerializersForLastMessage, UserUpdateSerializer, UserSerializersForCurrentUser

# User-related views

class CustomTokenObtainPairView(TokenObtainPairView):
    #Make user login with username or email
    def post(self, request, *args, **kwargs):
        User = get_user_model()
        username = request.data.get('username')

        # Check if user exists and get actual username if email was provided
        try:
            user = User.objects.get(Q(username=username) | Q(email=username))
            # If email was used to login, replace with actual username
            if '@' in username:
                request.data['username'] = user.username
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Try to authenticate and get token
        try:
            return super().post(request, *args, **kwargs)
        except TokenError as e:
            return Response(
                {'error': 'Invalid password'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializers
    permission_classes = [AllowAny]
    
    def perform_update(self, serializer):
        serializer.save()


class SendResetCodeView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        
        try:
            user = User.objects.get(email=email)
            
            # Generate random 6 character code
            reset_code = ''.join(random.choices(string.digits, k=6))
            
            # Store code in cache with 10 minute expiry
            cache.set(f'reset_code_{email}', reset_code, timeout=600)
            
            # Send email
            send_mail(
                'Hopital Social Network - Password Reset Code',
                f'Hi,\nWe received a request to reset your password on Hopital Social Network.\n\nYour password reset code is: **{reset_code}**\n\nThis code will expire in 10 minutes.\nIf you did not request this password reset, please ignore this email.\nThis is an automated message, please do not reply to this email.\n\nBest regards,\nHopital Social Network IT-Team',
                EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
            
            return Response({'message': 'Reset code sent to email'}, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({'error': 'No user found with this email'}, status=status.HTTP_404_NOT_FOUND)


class VerifyResetCodeView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        submitted_code = request.data.get('code')
        new_password = request.data.get('new_password')
        
        stored_code = cache.get(f'reset_code_{email}')
        
        if not stored_code:
            return Response({'error': 'Reset code expired'}, status=status.HTTP_400_BAD_REQUEST)
            
        if submitted_code != stored_code:
            return Response({'error': 'Invalid reset code'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            
            # Clear the reset code from cache
            cache.delete(f'reset_code_{email}')
            
            return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class UpdateUserView(generics.UpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        user_id = self.kwargs.get('pk')  # Assuming 'pk' is used in the URL pattern
        return User.objects.get(pk=user_id)
    
    
    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    

class GetUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializersForCurrentUser
    permission_classes = [IsAuthenticated]

    def get_object(self):
        currentUser = User.objects.get(pk=self.request.user.pk)
        return currentUser
    

class GetAllUserView(generics.ListAPIView):
    serializer_class = UserSerializersForLastMessage
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.exclude(pk=self.request.user.pk)
        return queryset

    def get_serializer_context(self):
        return {'request': self.request}

