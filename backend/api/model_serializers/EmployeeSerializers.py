from rest_framework import serializers
from api.models import Post, Reaction, Comment, Employee
from .UserSerializers import UserSerializers

class EmployeeSerializers(serializers.ModelSerializer):
    user = UserSerializers(read_only=True)
    position = serializers.ChoiceField(choices=Employee.POSITIONS)
    gender = serializers.ChoiceField(choices=Employee.GENDER)
    
    post_count = serializers.SerializerMethodField()
    reaction_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()

    def get_post_count(self, obj):
        return Post.objects.filter(author=obj.user).count()

    def get_reaction_count(self, obj):
        return Reaction.objects.filter(user=obj.user).count()

    def get_comment_count(self, obj):
        return Comment.objects.filter(user=obj.user).count()
    
    
    class Meta:
        model = Employee
        fields = ["id","user","gender","phone", "adress", "position","recruitmentDate", "birthday", "profile_pic","cover_pic", "last_seen", "isOnline", "post_count", "reaction_count", "comment_count"]
        extra_kwargs = {"user":{"read_only":True}}
        

class EmployeeUpdateSerializers(serializers.ModelSerializer):
    position = serializers.ChoiceField(choices=Employee.POSITIONS)
    gender = serializers.ChoiceField(choices=Employee.GENDER)
    
    
    class Meta:
        model = Employee
        fields = ["gender","phone", "adress", "position","recruitmentDate", "birthday", "profile_pic","cover_pic"]
    
    
    def update(self, instance, validated_data):
        instance.gender = validated_data.get("gender", instance.gender)
        instance.position = validated_data.get("position", instance.position)
        instance.birthday = validated_data.get("birthday", instance.birthday)
        instance.recruitmentDate = validated_data.get("recruitmentDate", instance.recruitmentDate)
        instance.profile_pic = validated_data.get("profile_pic", instance.profile_pic)
        instance.cover_pic = validated_data.get("cover_pic", instance.cover_pic)
        instance.phone = validated_data.get("phone", instance.phone)
        instance.adress = validated_data.get("adress", instance.adress)
        instance.save()
        return instance
        

class EmployeeProfilePicture(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ["profile_pic"]
        
