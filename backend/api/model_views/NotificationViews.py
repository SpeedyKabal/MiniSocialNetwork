from api.models import Notification
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from api.model_serializers.NotificationSerializers import NotificationSerializers


class ListNotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.exclude(user=user)
