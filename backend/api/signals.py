import time
import os, subprocess, re
import sys
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
        return int(float(result.stdout.strip()))  # Duration in seconds
    except ValueError:
        return None
    

@receiver(post_save, sender=File)
def convert_video_to_hls(sender, instance, created, **kwargs):
    if created:
        if not instance.file.name.lower().endswith((".mp4", ".mov", ".avi", ".mkv", ".flv", ".wmv", ".webm", ".mpeg", ".mpg", ".3gp", ".3g2", ".m4v")):
            return # Skip if the file is not a video
        
        channel_layer = get_channel_layer()

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
        
        duration = get_video_duration(input_path)

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
                    timeout = duration / 2 if duration > 60 else duration   # 5 minutes timeout
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
                        
                        # Here you would send the progress to the consumer
                        # Assuming you have some way to get the consumer for this context
                        # This is a placeholder since we don't have the full context:
                        # consumer.send_ffmpeg_progress(progress)
                        print(f"Processing Time: {time_match.group(1)}, Progress: {progress}%")
                        async_to_sync(channel_layer.group_send)(
                                'chat_online',  
                                {
                                    'type': 'send_ffmpeg_progress',
                                    'progress': progress,
                                }
                            )

                    if progress_match:
                        print(f"Progress Status: {progress_match.group(1)}")

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