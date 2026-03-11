import os
import subprocess
import time

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from celery import shared_task
from django.contrib.auth.models import User



# ── Get duration via ffprobe ──────────────────────────────────────────────
def get_video_duration(path):
    cmd = [
        "ffprobe", "-i", path,
        "-show_entries", "format=duration",
        "-v", "quiet", "-of", "csv=p=0",
    ]
    try:
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        return int(float(result.stdout.strip()))
    except FileNotFoundError:
        raise RuntimeError(
            f"ffprobe not found"
        )
    except ValueError:
        return None  # Duration unreadable – use timeout fallback


@shared_task(bind=True, name="api.tasks.process_video")
def process_video(self, file_id, user_id):
    """
    Celery background task:
    1. Converts the uploaded video to HLS format with FFmpeg.
    2. Updates the File.hsl_path field.
    3. Removes the original upload.
    4. Creates a Notification row so the uploader knows the video is ready.
    """
    # Local imports avoid circular-import issues at module load time
    from api.models import File, Notification

    # ── Fetch the File record ─────────────────────────────────────────────────
    try:
        instance = File.objects.get(id=file_id)
    except File.DoesNotExist:
        return {"error": f"File {file_id} not found"}

    # ── Determine output directory ────────────────────────────────────────────
    if instance.post:
        base_path = os.path.join(
            "media", "PostFiles", "Videos",
            str(instance.post.id), str(instance.id),
        )
        owner_id = instance.post.id
    elif instance.message:
        base_path = os.path.join(
            "media", "messageFiles", "Videos",
            str(instance.message.id), str(instance.id),
        )
        owner_id = instance.message.id
    else:
        return {"error": "File is not linked to a post or message"}

    os.makedirs(base_path, exist_ok=True)

    input_path = instance.file.path
    output_path = os.path.join(base_path, "output.m3u8")

    duration = get_video_duration(input_path)

    # ── Build FFmpeg command ──────────────────────────────────────────────────
    num_threads = os.cpu_count() or 1
    ffmpeg_threads = max(1, num_threads // 2)

    segment_filename = os.path.join(base_path, "segment_%03d.ts").replace("\\", "/")
    output_path_fwd = output_path.replace("\\", "/")

    command = [
        "ffmpeg", "-y", "-i", input_path,
        "-preset", "ultrafast",
        "-c:v", "libx264", "-b:v", "1000k",
        "-c:a", "aac", "-b:a", "128k",
        "-hls_time", "10",
        "-threads", str(ffmpeg_threads),
        "-strict", "-2",
        "-hls_playlist_type", "vod",
        "-hls_segment_filename", segment_filename,
        output_path_fwd,
    ]

    # ── Run FFmpeg ────────────────────────────────────────────────────────────
    timeout = (duration / 2 if duration > 60 else duration) if duration else 600

    if not os.path.exists(input_path):
        return {"error": f"Input file not found at {input_path}"}

    try:
        result = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=timeout
        )
        if result.returncode != 0:
            # Return only the last 1000 chars of stderr to avoid massive error messages
            error_details = result.stderr.strip()[-1000:] if result.stderr else "No output"
            return {"error": f"FFmpeg exited with code {result.returncode}", "details": error_details}
    except FileNotFoundError:
        raise RuntimeError("ffmpeg not found")
    except subprocess.TimeoutExpired:
        return {"error": "FFmpeg processing timed out"}

    # ── Update HLS path on the File record ────────────────────────────────────
    hls_relative = f"{owner_id}/{instance.id}/output.m3u8"
    File.objects.filter(id=instance.id).update(hsl_path=hls_relative)

    # ── Remove original upload ────────────────────────────────────────────────
    # try:
    #     channel_layer = get_channel_layer()
    #     # message.id is used to compute the room name (same logic as the frontend)
    #     sender_id   = instance.message.sender_id
    #     receiver_id = instance.message.reciever_id
    #     room_name   = (
    #         f"{sender_id}{receiver_id}"
    #         if sender_id > receiver_id
    #         else f"{receiver_id}{sender_id}"
    #     )
    #     async_to_sync(channel_layer.group_send)(
    #         f"chat_{room_name}",
    #         {
    #             "type": "video_ready",
    #             "message_id": instance.message.id,
    #             "file_id": file_id,
    #         },
    #     )
        
    # except OSError:
    #     pass  # Non-fatal

    # ── Create notification ───────────────────────────────────────────────────
    try:
        user = User.objects.get(id=user_id)
        Notification.objects.create(
            user=user,
            post=instance.post,  # nullable – will be None for message-linked files
            message=f"Your video (file #{file_id}) has been processed and is ready to play.",
        )
        os.remove(input_path)
    except Exception as exc:
        # Notification failure must not break the task result
        print(f"[process_video] Could not create notification: {exc}")

    return {"status": "done", "file_id": file_id, "hls_path": hls_relative}
