from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from rest_framework.response import Response
from api.model_serializers.CommentSerializers import CommentSerializers
from api.models import Post, Comment

# Comment-related views

class CreateCommentView(generics.CreateAPIView):
    serializer_class = CommentSerializers
    permission_classes = [IsAuthenticated]


    def perform_create(self, serializer):
        postID = self.request.data.get("post")
        content = self.request.data.get("content")
        try:
            post = Post.objects.get(pk=postID)
            serializer.save(user=self.request.user, post = post, content = content)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Post.DoesNotExist:
            return Response({"detail" : "Post Not Found"}, status=status.HTTP_404_NOT_FOUND)
        
        
class UpdateCommentView(generics.UpdateAPIView):
    serializer_class = CommentSerializers
    permission_classes = [IsAuthenticated]

    def get_object(self):
        commentid = self.request.data.get('id')
        try:
            return Comment.objects.get(pk=commentid)
        except Comment.DoesNotExist:
            return ""

    def perform_update(self, serializer):
        serializer.save()


class ListCommentsView(generics.ListAPIView):
    serializer_class = CommentSerializers
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        try:
            post_id = self.request.GET.get('post_id')
            if post_id:
                return Comment.objects.filter(post_id=post_id)
        except Post.DoesNotExist:
            return Response({'details':'Post Not Found'}, status=status.HTTP_404_NOT_FOUND)
        

class DeleteCommentView(generics.DestroyAPIView):
    serializer_class = CommentSerializers
    permission_classes = [IsAuthenticated]


    def delete(self, request, *args, **kwargs):
        commentID = request.data.get('id')
        user = self.request.user
        try:
            comment = Comment.objects.get(pk=commentID, user=user)
            comment.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Comment.DoesNotExist:
            return Response({"detail" : "Comment Doesn't Exist"}, status=status.HTTP_404_NOT_FOUND)
