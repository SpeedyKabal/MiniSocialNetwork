from rest_framework import serializers
from api.models import File
from api.models import Post, Reaction, Comment, Employee
from .UserSerializers import UserSerializersForCurrentUser, SimpleUserSerializers
from .FileSerializers import FileSerializer



class PostSerializers(serializers.ModelSerializer):
    author = UserSerializersForCurrentUser(read_only=True)
    job = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    mediaFiles = FileSerializer(many=True, read_only=True, source='postFiles')
    
    class Meta:
        model = Post
        fields = ["id","content","created_at","author","job", "reactions", "comments", "mediaFiles"]
        extra_kwargs = {"author":{"read_only":True}}
    
    def create(self, validated_data):
        post = super().create(validated_data)
        return post
    
    def update(self, instance, validated_data):
        post = super().update(instance, validated_data)
        return post

    

    def get_job(self, obj):
        try:
            job = Employee.objects.get(user=obj.author)
            request = self.context.get('request')
            # If request is available, send Employee status
            if request is not None:
                return job.position
            
            return job.position
        except Employee.DoesNotExist:
            return ("Employee Does not Existe")  # Handle case where Employee doesn't exist for the user
    
    
    def get_reactions(self, obj):
        try:
            reactions = Reaction.objects.filter(post=obj).count()
            request = self.context.get('request')
            # If request is available, send Employee status
            if request is not None:
                return reactions
            
            return reactions
        except Employee.DoesNotExist:
            return ("Employee Does not Existe")  # Handle case where Employee doesn't exist for the user
    
    
    def get_comments(self, obj):
        try:
            comments = Comment.objects.filter(post=obj).count()
            request = self.context.get('request')
            # If request is available, send Employee status
            if request is not None:
                return comments
            
            return comments
        except Employee.DoesNotExist:
            return ("Employee Does not Existe")  # Handle case where Employee doesn't exist for the user
        
    
    def get_mediaFiles(self, obj):
        try:
            files = File.objects.filter(post=obj)
            request = self.context.get('request')
            if request is not None:
                return files
            
            return files
        except File.DoesNotExist:
            return ("File Does not Existe")


class SimplePostSerializers(serializers.ModelSerializer):
    author = SimpleUserSerializers(read_only=True)
    
    class Meta:
        model = Post
        fields = ["id","content","created_at","author"]
        extra_kwargs = {"author":{"read_only":True}}
    
    