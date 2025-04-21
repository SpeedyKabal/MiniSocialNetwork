import os, random, string, time, subprocess, re
from django.core.cache import cache
from backend.settings import EMAIL_HOST_USER
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
from rest_framework import generics, status
from itertools import chain
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.db.models import Q
from django.core.mail import send_mail
from django.utils.dateparse import parse_datetime
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .serializers import UserSerializers, PostSerializers, ReactionSerializers, CommentSerializers, MessageSerializers, UserSerializersForLastMessage,EmployeeSerializers,EmployeeProfilePicture, UserUpdateSerializer, EmployeeUpdateSerializers, UserSerializersForِCurrentUser, NoificationSerializers
from .models import Post, Reaction, Comment, Message, Employee, File, Notification

import logging

# Create your views here.
logger = logging.getLogger(__name__)


#User Views
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
    serializer_class = UserSerializersForِCurrentUser
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


#Post Views
class PostListCreate(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializers
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Post.objects.all().order_by('-created_at')[:5]
    
    
    def perform_create(self, serializer):
        author = self.request.user
        content = self.request.data.get('content')
        serializer.save(author=author, content=content)
        

class PostListPrevious(generics.ListAPIView):
    serializer_class = PostSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        date = self.request.query_params.get('date')
        if date:
            try:
                date_obj = parse_datetime(date)
                if date_obj:
                    return Post.objects.filter(created_at__lt=date_obj).order_by('-created_at')[:5]
            except ValueError:
                return Post.objects.none()
        return Post.objects.none()


class PostCreate(generics.RetrieveAPIView):
    serializer_class = PostSerializers
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        post_id = self.kwargs.get('pk')
        try:
            post = Post.objects.get(pk=post_id)
            return post
        except Post.DoesNotExist:
            return Response({"detail" : "Post Doesn't Exist"}, status=status.HTTP_404_NOT_FOUND)
        
        
class PostUpdate(generics.UpdateAPIView):
    serializer_class = PostSerializers
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        id = self.request.data.get('id')
        try:
            return Post.objects.get(pk=id, author=self.request.user)
        except Post.DoesNotExist:
            return Response("Post Doesn't Exist", status=status.HTTP_404_NOT_FOUND)
        


    def perform_update(self, serializer):
        content = self.request.data.get('content')
        serializer.save(author=self.request.user, content=content)
    

class PostDelete(generics.DestroyAPIView):
    serializer_class = PostSerializers
    permission_classes = [IsAuthenticated]


    def delete(self, request, *args, **kwargs):
        postID = request.data.get("post_id")
        try:
            postInstance = Post.objects.get(pk=postID)
            if postInstance.author == self.request.user:
                postInstance.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
        except Post.DoesNotExist:
            return Response("Post Doesn't Existe", status=status.HTTP_404_NOT_FOUND)


#File Views
class FileUploadPost(generics.CreateAPIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        post_id = request.data.get("post")  # Get the associated post ID
        file = request.FILES.get("file")   # Get the uploaded file
        try:
            post = Post.objects.get(pk=post_id)
            # Save the file and associate it with the post
            fileCreated = File.objects.create(file=file, post=post)
            return Response({"id": fileCreated.id }, status=status.HTTP_201_CREATED)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
        
        
class FileUploadMessage(generics.CreateAPIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        messageid = request.data.get("message_id")  # Get the associated post ID
        file = request.FILES.get("file")   # Get the uploaded file
        if file.size > 100 * 1024 * 1024 and not file.content_type.startswith('video'):
            return Response({"error": "File size exceeds 100MB limit"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            message = Message.objects.get(pk=messageid)
            # Save the file and associate it with the post
            fileCreated = File.objects.create(file=file, message=message)
            return Response({"id": fileCreated.id }, status=status.HTTP_201_CREATED)
        except Post.DoesNotExist:
            return Response({"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND)
        
        
class ProcessVideoView(APIView):
    
    def get_video_duration(self, input_path):
        """Get video duration using FFprobe."""
        command = [
            "ffprobe", "-i", input_path, "-show_entries", "format=duration",
            "-v", "quiet", "-of", "csv=p=0"
        ]
        result = subprocess.run(command, stdout=subprocess.PIPE, text=True)
        try:
            return int(float(result.stdout.strip()))  # Duration in seconds
        except ValueError:
            return None
    
    
    def post(self, request, file_id, fileLoopid):
        try:
            instance = File.objects.get(id=file_id)
            # Trigger async processing via Channels
            channel_layer = get_channel_layer()
            if instance.post:
                base_path = f"media/PostFiles/Videos/{instance.post.id}/{instance.id}/"
            elif instance.message:
                base_path = f"media/messageFiles/Videos/{instance.message.id}/{instance.id}/"
            else:
                return  # If neither, do nothing
            
            os.makedirs(base_path, exist_ok=True)  # Ensure the directory exists

            # Input and output paths
            input_path = instance.file.path  # The uploaded video file
            output_path = os.path.join(base_path, "output.m3u8")  # HLS playlist
            
            duration = self.get_video_duration(input_path)

            # FFmpeg command for HLS conversion
            command = [
                "ffmpeg", "-y", "-i", input_path, "-preset", "ultrafast",
                "-c:v", "libx264", "-b:v", "1000k",
                "-c:a", "aac", "-b:a", "128k",
                "-hls_time", "10",
                "-threads", "4",
                "-strict", "-2",
                "-hls_playlist_type", "vod",
                "-progress", "pipe:1",
                "-loglevel", "verbose",
                "-hls_segment_filename", os.path.join(base_path, "segment_%03d.ts").replace("\\", "/"),
                output_path.replace("\\", "/")
            ]

            try:
                with subprocess.Popen(command, stderr=subprocess.PIPE, text=True) as process:
                    start_time = time.time()
                    if duration:
                        timeout = duration / 2 if duration > 60 else duration
                    else:
                        timeout = 600 #5 Minutes

                    while True:
                        if process.poll() is not None :
                            break  # Process finished

                        line = process.stderr.readline()
                        if not line:
                            continue  # No output yet

                        with open("output.txt", "a") as f:
                            f.write(line + "\n")

                        time_match = re.search(r'time=([\d:]+)', line)
                        progress_match = re.search(r'progress=(\w+)', line)

                        if time_match and duration:
                            # Convert time string to seconds
                            time_str = time_match.group(1)
                            total_seconds = sum(int(x) * 60 ** i for i, x in enumerate(reversed(time_str.split(':'))))
                            progress = (total_seconds / duration) * 100 if duration > 0 else 0
                            
                            async_to_sync(channel_layer.group_send)(
                                    'chat_online',
                                    {
                                        'type': 'send_ffmpeg_progress',
                                        'progress': progress,
                                        'fileLoopID' : fileLoopid,
                                    }
                                )

                        if time.time() - start_time > timeout:
                            print("FFmpeg process timed out! Terminating...")
                            process.kill()
                            process.wait()
                            raise TimeoutError("FFmpeg processing took too long.")

                # Update file HLS path
                File.objects.filter(id=instance.id).update(hsl_path=f"{instance.post.id if instance.post else instance.message.id}/{instance.id}/output.m3u8")

                # Remove original file after conversion
                os.remove(input_path)

            except subprocess.CalledProcessError as e:
                print(f"FFmpeg error: {e}")
            except TimeoutError as e:
                print(e)
            return Response({"message": "Processing started", "file_id": file_id}, status=status.HTTP_202_ACCEPTED)
        except File.DoesNotExist:
            return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)

# Helper function to process video (used by the consumer)

        
#Reactions Views
class CreateReactionView(generics.CreateAPIView):
    serializer_class = ReactionSerializers
    permission_classes = [IsAuthenticated]
    
    
    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user, post_id =self.request.data.get('post'), reaction = self.request.data.get('reaction'))
        except:
            return("Something Went Wrong!!")
         
        
class UpdateReactionView(generics.UpdateAPIView):
    serializer_class = ReactionSerializers
    permission_classes = [IsAuthenticated]

    def get_object(self):
        post_id = self.request.data.get('post')
        user = self.request.user
        try:
            return Reaction.objects.get(post_id=post_id, user=user)
        except Reaction.DoesNotExist:
            return ""

    def perform_update(self, serializer):
        serializer.save()


class ListReactionsView(generics.ListAPIView):
    serializer_class = ReactionSerializers
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        post_id = self.request.GET.get('post_id')
        if post_id:
            return Reaction.objects.filter(post_id=post_id)
        else:
            return Reaction.objects.none()


class DeleteReactionView(generics.DestroyAPIView):
    serializer_class = ReactionSerializers
    permission_classes = [IsAuthenticated]


    def delete(self, request, *args, **kwargs):
        postID = request.data.get('post_id')
        user = self.request.user
        try:
            reaction = Reaction.objects.get(post_id=postID, user=user)
            reaction.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Reaction.DoesNotExist:
            return Response({"detail" : "Reation Doesn't Exist"}, status=status.HTTP_404_NOT_FOUND)


#Comments Viwes
class CreateCommentView(generics.CreateAPIView):
    serializer_class = CommentSerializers
    permission_classes = [IsAuthenticated]


    def perform_create(self, serializer):
        postID = self.request.data.get("post")
        content = self.request.data.get("content")
        try:
            post = Post.objects.get(pk=postID)
            serializer.save(user=self.request.user, post = post, content = content)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Post.DoesNotExist:
            return Response({"detail" : "Post Not Found"}, status=status.HTTP_404_NOT_FOUND)
        

class UpdateCommentView(generics.UpdateAPIView):
    serializer_class = CommentSerializers
    permission_classes = [IsAuthenticated]

    def get_object(self):
        commentid = self.request.data.get('id')
        try:
            return Comment.objects.get(pk=commentid)
        except Comment.DoesNotExist:
            return ""

    def perform_update(self, serializer):
        serializer.save()


class ListCommentsView(generics.ListAPIView):
    serializer_class = CommentSerializers
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        try:
            post_id = self.request.GET.get('post_id')
            if post_id:
                return Comment.objects.filter(post_id=post_id)
        except Post.DoesNotExist:
            return Response({'details':'Post Not Found'}, status=status.HTTP_404_NOT_FOUND)
        

class DeleteCommentView(generics.DestroyAPIView):
    serializer_class = CommentSerializers
    permission_classes = [IsAuthenticated]


    def delete(self, request, *args, **kwargs):
        commentID = request.data.get('id')
        user = self.request.user
        try:
            comment = Comment.objects.get(pk=commentID, user=user)
            comment.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Comment.DoesNotExist:
            return Response({"detail" : "Comment Doesn't Exist"}, status=status.HTTP_404_NOT_FOUND)


#Messages Views
class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializers
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        sender = self.request.user
        reciever = self.request.data.get("reciever_id")
        content = self.request.data.get("message")
        if serializer.is_valid():
            serializer.save(sender=sender, reciever_id = reciever,message = content)
            return Response(status=status.HTTP_204_NO_CONTENT)
   
        
class ListMessageView(generics.ListAPIView):
    serializer_class = MessageSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            senderID = self.request.GET.get('sender')
            recieverID = self.request.user
            last_message_date = self.request.GET.get('last_message_date')
            unread_ids = self.request.GET.getlist('unread_ids[]')
            if senderID and recieverID:
                unread_messages = Message.objects.filter(reciever=recieverID, sender_id=senderID, is_read=False)
                for message in unread_messages:
                    message.is_read = True
                    message.save()
                
                unread_messages_query = Message.objects.filter(id__in=unread_ids) if unread_ids else Message.objects.none()
                
                if last_message_date:
                    last_messages_query = Message.objects.filter((Q(sender_id = senderID, reciever=recieverID) | Q(sender =recieverID, reciever_id = senderID)) & Q(date_created__gt=last_message_date))
                else:
                    last_messages_query = Message.objects.filter(Q(sender_id = senderID, reciever=recieverID) | Q(sender=recieverID, reciever_id = senderID))

                base_query = list(chain(last_messages_query, unread_messages_query))
                
                final_query = sorted(set(base_query), key=lambda x: x.date_created)
                
                return final_query 
        except Message.DoesNotExist:
            return Response({'details':'Message Not Found'}, status=status.HTTP_404_NOT_FOUND)
 
        
class UnreadMessageCountView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        user = self.request.user
        unread_count = Message.objects.filter(reciever=user, is_read=False).count()
        return Response({'unread_count': unread_count}, status=status.HTTP_200_OK)


class PreviousMessagesView(generics.ListAPIView):
    serializer_class = MessageSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            message_id = self.request.GET.get('message_id')
            sender_id = self.request.GET.get('sender_id')
            receiver_id = self.request.GET.get('receiver_id')

            if message_id and sender_id and receiver_id:
                messages_query = Message.objects.filter(id__lt=message_id).filter(Q(sender_id=sender_id, reciever_id=receiver_id) | 
                    Q(sender_id=receiver_id, reciever_id=sender_id)).order_by('-id')[:10]
                return messages_query
                    
                
            return Message.objects.none()
            
        except Message.DoesNotExist:
            return Message.objects.none()


#Employees Views
class UpdateEmployeeView(generics.UpdateAPIView):
    serializer_class = EmployeeUpdateSerializers
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        return Employee.objects.get(user=user)

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            # Log the validation errors
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ActualEmployeeView(generics.RetrieveAPIView):
    serializer_class = EmployeeSerializers
    permission_classes = [IsAuthenticated]


    def get_object(self):
        user_username = self.kwargs.get('username')
        user = User.objects.get(username=user_username)
        currentProfile = Employee.objects.get(user=user)
        return currentProfile 
    

class UpdateProfilePictureView(generics.UpdateAPIView):
    serializer_class = EmployeeProfilePicture
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        try:
            return self.request.user.employee   
        except Employee.DoesNotExist:
            Response ("Employee Doen't Existe")
    
    
    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  
    
def get_positions(request):
    positions = [
        {'value': position[0], 'label': position[1]} for position in Employee.POSITIONS
    ]
    return JsonResponse(positions, safe=False)


def get_genders(request):
    genders = [
        {'value': gender[0], 'label': gender[1]} for gender in Employee.GENDER
    ]
    return JsonResponse(genders, safe=False)


class ListNotificationsView(generics.ListAPIView):
    serializer_class = NoificationSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.exclude(user=user)
