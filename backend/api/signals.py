import os, subprocess, re
from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Employee, File
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync



@receiver(post_save, sender=User)
def created_employee(sender, instance, created, **kwargs):
    if created:
        Employee.objects.create(user=instance,gender="Male", position="None", phone="0660000000", adress="Unspecified")
        

@receiver(pre_save, sender=Employee)
def update_last_seen(sender, instance, **kwargs):
    if instance.pk:
        previous = Employee.objects.get(pk=instance.pk)
        if previous.isOnline and not instance.isOnline:
            instance.last_seen = timezone.now()


def get_video_duration(input_path):
    """Get video duration using FFprobe."""
    command = [
        "ffprobe", "-i", input_path, "-show_entries", "format=duration",
        "-v", "quiet", "-of", "csv=p=0"
    ]
    result = subprocess.run(command, stdout=subprocess.PIPE, text=True)
    try:
        return float(result.stdout.strip())  # Duration in seconds
    except ValueError:
        return None
    

@receiver(post_save, sender=File)
def convert_video_to_hls(sender, instance, created, **kwargs):
    if created:
        if not instance.file.name.lower().endswith((".mp4", ".mov", ".avi", ".mkv", ".flv", ".wmv", ".webm", ".mpeg", ".mpg", ".3gp", ".3g2", ".m4v")):
            return # Skip if the file is not a video

        # Determine the save path based on whether it's a post or a message
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

        # FFmpeg command for HLS conversion
        command = [
            "ffmpeg","-y", "-i", input_path, "-preset", "ultrafast",
            "-c:v", "libx264", "-b:v", "1000k", 
            "-c:a", "aac", "-b:a", "128k",
            "-hls_time", "10",  # Reduce segment duration for faster processing
            "-threads", "4",
            "-strict", "-2",
            "-hls_playlist_type", "vod",
            "-progress", "pipe:1",
            "-loglevel", "verbose",
            "-hls_segment_filename", os.path.join(base_path, "segment_%03d.ts").replace("\\", "/"),
            output_path.replace("\\", "/")
        ]

        try:
            subprocess.run(command, check=True)
            File.objects.filter(id=instance.id).update(hsl_path=f"{instance.post.id if instance.post else instance.message.id}/{instance.id}/output.m3u8")
            os.remove(input_path)
        except subprocess.CalledProcessError as e:
            print(f"FFmpeg error: {e}")