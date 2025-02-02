from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Employee
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
