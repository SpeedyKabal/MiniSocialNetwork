# Message-related views

from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from rest_framework.response import Response
from api.serializers import MessageSerializers
from api.models import Message
from itertools import chain
from django.db.models import Q

class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializers
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        sender = self.request.user
        reciever = self.request.data.get("reciever_id")
        content = self.request.data.get("message")
        if serializer.is_valid():
            serializer.save(sender=sender, reciever_id = reciever,message = content)
            return Response(status=status.HTTP_204_NO_CONTENT)

class ListMessageView(generics.ListAPIView):
    serializer_class = MessageSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            senderID = self.request.GET.get('sender')
            recieverID = self.request.user
            last_message_date = self.request.GET.get('last_message_date')
            unread_ids = self.request.GET.getlist('unread_ids[]')
            if senderID and recieverID:
                unread_messages = Message.objects.filter(reciever=recieverID, sender_id=senderID, is_read=False)
                for message in unread_messages:
                    message.is_read = True
                    message.save()
                unread_messages_query = Message.objects.filter(id__in=unread_ids) if unread_ids else Message.objects.none()
                if last_message_date:
                    last_messages_query = Message.objects.filter((Q(sender_id = senderID, reciever=recieverID) | Q(sender =recieverID, reciever_id = senderID)) & Q(date_created__gt=last_message_date))
                else:
                    last_messages_query = Message.objects.filter(Q(sender_id = senderID, reciever=recieverID) | Q(sender=recieverID, reciever_id = senderID))
                base_query = list(chain(last_messages_query, unread_messages_query))
                final_query = sorted(set(base_query), key=lambda x: x.date_created)
                return final_query 
        except Message.DoesNotExist:
            return Response({'details':'Message Not Found'}, status=status.HTTP_404_NOT_FOUND)


class UnreadMessageCountView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        user = self.request.user
        unread_count = Message.objects.filter(reciever=user, is_read=False).count()
        return Response({'unread_count': unread_count}, status=status.HTTP_200_OK)


class PreviousMessagesView(generics.ListAPIView):
    serializer_class = MessageSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            message_id = self.request.GET.get('message_id')
            sender_id = self.request.GET.get('sender_id')
            receiver_id = self.request.GET.get('receiver_id')
            if message_id and sender_id and receiver_id:
                messages_query = Message.objects.filter(id__lt=message_id).filter(Q(sender_id=sender_id, reciever_id=receiver_id) | 
                    Q(sender_id=receiver_id, reciever_id=sender_id)).order_by('-id')[:10]
                return messages_query
            return Message.objects.none()
        except Message.DoesNotExist:
            return Message.objects.none()
