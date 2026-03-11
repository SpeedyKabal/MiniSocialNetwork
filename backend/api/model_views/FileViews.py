from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import File, Message, Post
from api.model_serializers.FileSerializers import File
from api.tasks import process_video


# File-related views
class FileUploadPost(generics.CreateAPIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        post_id = request.data.get("post")   # Associated post ID
        file = request.FILES.get("file")     # Uploaded file
        try:
            post = Post.objects.get(pk=post_id)
            fileCreated = File.objects.create(file=file, post=post)
            return Response({"id": fileCreated.id}, status=status.HTTP_201_CREATED)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)


class FileUploadMessage(generics.CreateAPIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        messageid = request.data.get("message_id")
        file = request.FILES.get("file")
        if file.size > 100 * 1024 * 1024 and not file.content_type.startswith("video"):
            return Response(
                {"error": "File size exceeds 100MB limit"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            message = Message.objects.get(pk=messageid)
            fileCreated = File.objects.create(file=file, message=message)
            return Response({"id": fileCreated.id}, status=status.HTTP_201_CREATED)
        except Message.DoesNotExist:
            return Response({"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND)


class ProcessVideoView(APIView):
    """
    Accepts a video file ID and dispatches a Celery task to convert it to
    HLS format in the background.  Returns immediately with HTTP 202.
    When the conversion is done the worker creates a Notification row to
    inform the uploader that the video is ready to play.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, file_id, fileLoopid):
        try:
            File.objects.get(id=file_id)  # Validate the file exists
        except File.DoesNotExist:
            return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)

        # Dispatch the heavy work to Celery – runs completely in the background
        process_video.delay(file_id, request.user.id)

        return Response(
            {"message": "Video processing has been queued.", "file_id": file_id},
            status=status.HTTP_202_ACCEPTED,
        )
