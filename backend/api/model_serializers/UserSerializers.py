from django.contrib.auth.models import User
from rest_framework import serializers
from api.models import Employee, Message


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
        fields = ["id","username", "first_name", "last_name","last_message", "profile_pic", "isOnline"]
    
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
        fields = ["id", "first_name", "last_name", "username"]
        
        
class UserSerializersForCurrentUser(serializers.ModelSerializer):
    profile_pic = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ["id","username", "first_name", "last_name", "profile_pic"]
      
        
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
    

class SimpleUserSerializers(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id","username", "first_name", "last_name"]
      