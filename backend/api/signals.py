import os, subprocess
from django.conf import settings
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Employee, File
from django.utils import timezone



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


@receiver(post_save, sender=File)
def convert_video_to_hls(sender, instance,created, **kwargs):
    if created:
        if not instance.file.name.lower().endswith((".mp4", ".mov", ".avi", ".mkv", ".flv", ".wmv", ".webm", ".mpeg", ".mpg", ".3gp", ".3g2", ".m4v")):
            return # Skip if the file is not a video

        # Determine the save path based on whether it's a post or a message
        if instance.post:
            base_path = f"media/PostFiles/Videos/{instance.post.id}"
        elif instance.message:
            base_path = f"media/messageFiles/Videos/{instance.message.id}"
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
            "-hls_segment_filename", os.path.join(base_path, "segment_%03d.ts").replace("\\", "/"),
            output_path.replace("\\", "/")
        ]


        try:
            subprocess.run(command, check=True)
            File.objects.filter(id=instance.id).update(hsl_path="/output.m3u8")
        except subprocess.CalledProcessError as e:
            print(f"FFmpeg error: {e}")