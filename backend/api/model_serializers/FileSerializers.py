from rest_framework import serializers
from api.models import File


class FileSerializer(serializers.ModelSerializer):
    hslURL = serializers.SerializerMethodField()
    
    class Meta:
        model = File
        fields = ['id','file','hslURL']
        
        
    def get_hslURL(self, obj):
        request = self.context.get("request")
        if obj.post:
            if obj.hsl_path:
                if request:
                    return request.build_absolute_uri(f"/media/PostFiles/Videos/{obj.post.id}/{obj.id}/output.m3u8")
                else:
                    return f"/media/PostFiles/Videos/{obj.post.id}/{obj.id}/output.m3u8"
        else:
            if obj.hsl_path:
                if request:
                    return request.build_absolute_uri(f"/media/messageFiles/Videos/{obj.message.id}/{obj.id}/output.m3u8")
                else:
                    return f"/media/messageFiles/Videos/{obj.message.id}/{obj.id}/output.m3u8"
        return None