import os, re, subprocess, time

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import File, Message, Post
from api.model_serializers.FileSerializers import File


# File-related views
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
                "-threads", "2",
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
