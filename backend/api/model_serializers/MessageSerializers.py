from rest_framework import serializers
from api.models import Message
from .UserSerializers import UserSerializersForMessages
from .FileSerializers import FileSerializer


class MessageSerializers(serializers.ModelSerializer):
    sender = UserSerializersForMessages(read_only=True)
    reciever = UserSerializersForMessages(read_only=True)
    mediaFiles = FileSerializer(many=True, read_only=True, source='messageFiles')
    
    
    class Meta:
        model = Message
        fields = ["id","sender","message","reciever","date_created","is_read","message_del", "mediaFiles"]
        read_only_fields = ['id', 'sender', 'reciever', 'date_created']
        
        