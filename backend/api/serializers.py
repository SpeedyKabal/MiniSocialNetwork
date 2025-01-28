from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Post, Reaction, Comment, Message, Employee, File


#ORM Object Relational Mapping
#User Serializers
class UserSerializers(serializers.ModelSerializer):
    password_confirmation = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name" , "password", "password_confirmation"]
        extra_kwargs = {"password" : {"write_only":True}}


    def validate(self, data):
        if data.get('password') != data.get('password_confirmation'):
            raise serializers.ValidationError("The passwords do not match.")
        return data


    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password_confirmation')
        user = User.objects.create_user(password=password, **validated_data)
        return user
       
    
class UserUpdateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        
    
    def update(self, instance, validated_data):
        # Ensure fields are updated only if they are present in validated_data
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        
        instance.save()
        return instance 
   

class UserSerializersForLastMessage(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    profile_pic = serializers.SerializerMethodField()
    isOnline = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name","last_message", "profile_pic", "isOnline"]
    
    def get_last_message(self, obj):
        user = self.context['request'].user
        last_sent_message = Message.objects.filter(sender=obj, reciever=user).order_by('-date_created').first()
        last_received_message = Message.objects.filter(sender=user, reciever=obj).order_by('-date_created').first()
          
        last_message = None
        if last_sent_message and last_received_message:
            last_message = last_sent_message if last_sent_message.date_created > last_received_message.date_created else last_received_message
        elif last_sent_message:
            last_message = last_sent_message
        elif last_received_message:
            last_message = last_received_message
        

        if last_message:
            return {
                'is_read': last_message.is_read,
                'sender' : last_message.sender_id,
                'message': last_message.message[:30],
                'date_created': last_message.date_created,
            }

        return None
    
    
    def get_profile_pic(self, obj):
        try:
            employeeProfilePicture = Employee.objects.get(user=obj)

            # Access the request object from the serializer context
            request = self.context.get('request')
            # If request is available, build the absolute URL
            if request is not None:
                return request.build_absolute_uri(employeeProfilePicture.profile_pic.url)
            # If request is unavailable, return the relative URL as fallback
            return employeeProfilePicture.profile_pic.url
        except Employee.DoesNotExist:
            return None  # Handle case where Employee doesn't exist for the user
        
    def get_isOnline(self, obj):
        try:
            employeeStatus = Employee.objects.get(user=obj)

            # Access the request object from the serializer context
            request = self.context.get('request')
            # If request is available, send Employee status
            if request is not None:
                return employeeStatus.isOnline
        except Employee.DoesNotExist:
            return ("Employee Does not Existe")  # Handle case where Employee doesn't exist for the user
        

class UserSerializersForMessages(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name"]
        
        
class UserSerializersForِCurrentUser(serializers.ModelSerializer):
    profile_pic = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "profile_pic"]
      
        
    def get_profile_pic(self, obj):
        try:
            profilePicture = Employee.objects.get(user=obj)

            # Access the request object from the serializer context
            request = self.context.get('request')
            # If request is available, send Employee status
            if request is not None:
                return request.build_absolute_uri(profilePicture.profile_pic.url)
            
            return profilePicture.profile_pic.url
        except Employee.DoesNotExist:
            return ("Employee Does not Existe")  # Handle case where Employee doesn't exist for the user
    

#File Serializers
class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['file']
        
            
#Post Serializers
class PostSerializers(serializers.ModelSerializer):
    author = UserSerializersForِCurrentUser(read_only=True)
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
        

#Reactions Serializers
class ReactionSerializers(serializers.ModelSerializer):
    user = UserSerializers(read_only=True)
    class Meta:
        model = Reaction
        fields = ["id","user","reaction","post"]
        read_only_fields = ['id', 'user', 'post']
        extra_kwargs = {"user":{"read_only":True}}


#Comments Serializers
class CommentSerializers(serializers.ModelSerializer):
    profile_pic = serializers.SerializerMethodField()
    user = UserSerializers(read_only=True)
    
    class Meta:
        model = Comment
        fields = ["id","user","content","post", "timeCreated", "profile_pic"]
        read_only_fields = ['id', 'user', 'post']
        extra_kwargs = {"user":{"read_only":True}}
        
        
    def get_profile_pic(self, obj):
        try:
            employeeProfilePicture = Employee.objects.get(user=obj.user)

            # Access the request object from the serializer context
            request = self.context.get('request')
            # If request is available, build the absolute URL
            if request is not None:
                return request.build_absolute_uri(employeeProfilePicture.profile_pic.url)
            # If request is unavailable, return the relative URL as fallback
            return employeeProfilePicture.profile_pic.url
        except Employee.DoesNotExist:
            return None  # Handle case where Employee doesn't exist for the user
    

#Message Serializers
class MessageSerializers(serializers.ModelSerializer):
    sender = UserSerializersForMessages(read_only=True)
    reciever = UserSerializersForMessages(read_only=True)
    mediaFiles = FileSerializer(many=True, read_only=True, source='messageFiles')
    
    
    class Meta:
        model = Message
        fields = ["id","sender","message","reciever","date_created","is_read","message_del", "mediaFiles"]
        read_only_fields = ['id', 'sender', 'reciever', 'date_created']
        
        
    def get_mediaFiles(self, obj):
        try:
            files = File.objects.filter(message=obj)
            request = self.context.get('request')
            if request is not None:
                return files
            
            return files
        except File.DoesNotExist:
            return ("File Does not Existe")
        
        
        
#Employee Serializers
class EmployeeSerializers(serializers.ModelSerializer):
    user = UserSerializers(read_only=True)
    position = serializers.ChoiceField(choices=Employee.POSITIONS)
    gender = serializers.ChoiceField(choices=Employee.GENDER)
    
    
    class Meta:
        model = Employee
        fields = ["id","user","gender","phone", "adress", "position","recruitmentDate", "birthday", "profile_pic"]
        extra_kwargs = {"user":{"read_only":True}}
        

class EmployeeUpdateSerializers(serializers.ModelSerializer):
    position = serializers.ChoiceField(choices=Employee.POSITIONS)
    gender = serializers.ChoiceField(choices=Employee.GENDER)
    
    
    class Meta:
        model = Employee
        fields = ["gender","phone", "adress", "position","recruitmentDate", "birthday"]
        
        
class EmployeeProfilePicture(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ["profile_pic"]
