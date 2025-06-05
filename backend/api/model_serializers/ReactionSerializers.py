from rest_framework import serializers
from api.models import Reaction
from .UserSerializers import UserSerializers


class ReactionSerializers(serializers.ModelSerializer):
    user = UserSerializers(read_only=True)
    class Meta:
        model = Reaction
        fields = ["id","user","reaction","post"]
        read_only_fields = ['id', 'user', 'post']
        extra_kwargs = {"user":{"read_only":True}}
