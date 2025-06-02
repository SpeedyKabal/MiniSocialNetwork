from django.db.models.signals import post_save, pre_save, pre_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Employee, File, Post, Notification
from django.utils import timezone
import os
from .models import Message
import shutil
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
            
            
@receiver(pre_delete, sender=File)
def delete_file_from_storage(sender, instance, **kwargs):
    if instance.file:
        if os.path.isfile(instance.file.path):
            print(instance.file.path)
            os.remove(instance.file.path)
        
        # If this is a video file with HLS streaming files
        if instance.hsl_path:
            if instance.post:
                parent_dir = os.path.join('PostFiles', 'Videos', str(instance.post.id))
            elif instance.message:
                parent_dir = os.path.join('messageFiles', 'Videos', str(instance.message.id))
            else:
                return
            
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(instance.file.path)))
            abs_parent_dir = os.path.join(base_dir, parent_dir)
            if os.path.exists(abs_parent_dir):
                shutil.rmtree(abs_parent_dir)
                
                
                
@receiver(post_save, sender=User)
def send_welcome_message(sender, instance, created, **kwargs):
    if created:
        admin_user = User.objects.get(id=1)
        Message.objects.create(
            sender=admin_user,
            reciever=instance,
            message="مرحبًا بكم في تطبيقنا الخاص بالتواصل الاجتماعي داخل المستشفى!\r\n\r\nنحن هنا لنقدم لكم تجربة تواصل آمنة وفعّالة، تتيح لكم تبادل المعلومات والملفات بسهولة وسرية تامة، بعيدًا عن نطاق الإنترنت. سواء كنت طبيبًا، ممرضًا، أو موظفًا إداريًا، يوفر لك هذا التطبيق بيئة آمنة لتبادل المعرفة والتعاون في تحسين الرعاية الصحية.\r\n\r\nنحن نهدف إلى تسهيل التواصل بين جميع أفراد الطاقم الطبي والإداري داخل المستشفى بطريقة مريحة، حيث يمكنك إرسال واستقبال الرسائل والملفات الحساسة بشكل مشفر وآمن، مما يضمن سرية المعلومات وحمايتها.\r\n\r\nنتمنى لكم تجربة مثمرة وموفقة، ونتطلع إلى أن يسهم هذا التطبيق في تعزيز العمل الجماعي وتحقيق أفضل النتائج لمرضاكم.\r\n\r\nإذا كانت لديك أي أسئلة أو احتياجات، لا تتردد في التواصل معنا."
        )
        

@receiver(post_save, sender=Post)
def addNotification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.author,
            post=instance,
            message=f"{instance.author.last_name} {instance.author.first_name} Posted a New Post: {instance.content[:30]}...",
        )
        

        
@receiver(pre_save, sender=Employee)
def update_last_seen(sender, instance, **kwargs):
    if instance.pk:
        previous = Employee.objects.get(pk=instance.pk)
        
        # Handle status changes
        if previous.isOnline != instance.isOnline:
            channel_layer = get_channel_layer()
            
            # Update last_seen when going offline
            if not instance.isOnline:
                instance.last_seen = timezone.now()
            
            # Send WebSocket message about status change
            async_to_sync(channel_layer.group_send)(
                'chat_online',
                {
                    'type': 'UserConnected',
                    'command': 'Online',
                    'user': instance.user.id,
                    'message': 'isOnline' if instance.isOnline else 'isOffline'
                }
            )