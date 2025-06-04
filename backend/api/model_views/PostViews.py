# Post-related views

from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from rest_framework.response import Response
from api.serializers import PostSerializers
from api.models import Post
from django.utils.dateparse import parse_datetime

class PostListCreate(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializers
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Post.objects.all().order_by('-created_at')[:5]
    
    
    def perform_create(self, serializer):
        author = self.request.user
        content = self.request.data.get('content')
        serializer.save(author=author, content=content)
        

class PostListPrevious(generics.ListAPIView):
    serializer_class = PostSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        date = self.request.query_params.get('date')
        if date:
            try:
                date_obj = parse_datetime(date)
                if date_obj:
                    return Post.objects.filter(created_at__lt=date_obj).order_by('-created_at')[:5]
            except ValueError:
                return Post.objects.none()
        return Post.objects.none()

class PostCreate(generics.RetrieveAPIView):
    serializer_class = PostSerializers
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        post_id = self.kwargs.get('pk')
        try:
            post = Post.objects.get(pk=post_id)
            return post
        except Post.DoesNotExist:
            return Response({"detail" : "Post Doesn't Exist"}, status=status.HTTP_404_NOT_FOUND)
      

class PostUpdate(generics.UpdateAPIView):
    serializer_class = PostSerializers
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        id = self.request.data.get('id')
        try:
            return Post.objects.get(pk=id, author=self.request.user)
        except Post.DoesNotExist:
            return Response("Post Doesn't Exist", status=status.HTTP_404_NOT_FOUND)
        

    def perform_update(self, serializer):
        content = self.request.data.get('content')
        serializer.save(author=self.request.user, content=content)
    

class PostDelete(generics.DestroyAPIView):
    serializer_class = PostSerializers
    permission_classes = [IsAuthenticated]


    def delete(self, request, *args, **kwargs):
        postID = request.data.get("post_id")
        try:
            postInstance = Post.objects.get(pk=postID)
            if postInstance.author == self.request.user:
                postInstance.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
        except Post.DoesNotExist:
            return Response("Post Doesn't Existe", status=status.HTTP_404_NOT_FOUND)
