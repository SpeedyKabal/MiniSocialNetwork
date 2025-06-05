from rest_framework import serializers
from api.models import Comment
from .UserSerializers import UserSerializers
from api.models import Employee


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
    