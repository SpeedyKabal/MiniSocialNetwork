# Reaction-related views

from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from rest_framework.response import Response
from api.serializers import ReactionSerializers
from api.models import Reaction

class CreateReactionView(generics.CreateAPIView):
    serializer_class = ReactionSerializers
    permission_classes = [IsAuthenticated]
    
    
    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user, post_id =self.request.data.get('post'), reaction = self.request.data.get('reaction'))
        except:
            return("Something Went Wrong!!")
         

class UpdateReactionView(generics.UpdateAPIView):
    serializer_class = ReactionSerializers
    permission_classes = [IsAuthenticated]

    def get_object(self):
        post_id = self.request.data.get('post')
        user = self.request.user
        try:
            return Reaction.objects.get(post_id=post_id, user=user)
        except Reaction.DoesNotExist:
            return ""

    def perform_update(self, serializer):
        serializer.save()


class ListReactionsView(generics.ListAPIView):
    serializer_class = ReactionSerializers
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        post_id = self.request.GET.get('post_id')
        if post_id:
            return Reaction.objects.filter(post_id=post_id)
        else:
            return Reaction.objects.none()


class DeleteReactionView(generics.DestroyAPIView):
    serializer_class = ReactionSerializers
    permission_classes = [IsAuthenticated]


    def delete(self, request, *args, **kwargs):
        postID = request.data.get('post_id')
        user = self.request.user
        try:
            reaction = Reaction.objects.get(post_id=postID, user=user)
            reaction.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Reaction.DoesNotExist:
            return Response({"detail" : "Reation Doesn't Exist"}, status=status.HTTP_404_NOT_FOUND)
