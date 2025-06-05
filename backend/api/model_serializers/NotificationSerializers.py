from rest_framework import serializers
from .PostSerializers import SimplePostSerializers
from .UserSerializers import SimpleUserSerializers
from api.models import Notification


class NotificationSerializers(serializers.ModelSerializer):
    user = SimpleUserSerializers(read_only=True)
    post = SimplePostSerializers(read_only=True)
    is_read =SimpleUserSerializers(many=True, read_only=True)
    
    class Meta:
        model = Notification
        fields = ["id","user","post" ,"message","timeCreated","is_read"]
        read_only_fields = ['id', 'user', 'post', 'timeCreated', "is_read"]
