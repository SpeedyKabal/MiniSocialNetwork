from django.contrib import admin
from .models import Post, Message, File, Employee, Reaction, Comment

# Register your models here.
class PostAdmin(admin.ModelAdmin):
    list_filter = ["created_at", "author"]
    list_display = ["resumePostcontent","created_at","getUserFullName"]

    def getUserFullName(self, obj):
        return f"{obj.author.last_name} {obj.author.first_name}"
    
    def resumePostcontent(self, obj):
        if len(obj.content) > 30:
            return f"{obj.content[0:30]} ..."
        else:
            return obj.content
    
    
    getUserFullName.short_description = "Author"
    resumePostcontent.short_description = "Content"


class EmployeeAdmin(admin.ModelAdmin):
    list_filter = ['gender','user__date_joined', 'user__last_login']
    list_display = ['get_username','get_first_name','get_last_name','gender', 'isOnline']

    def get_username(self, obj):
        return obj.user.username
    

    def get_first_name(self, obj):
        return obj.user.first_name
    

    def get_last_name(self, obj):
        return obj.user.last_name
    
    
    get_username.short_description = "Username"
    get_first_name.short_description = "First Name"
    get_last_name.short_description = "Last Name"


class MessageAdmin(admin.ModelAdmin):
    list_filter = ['is_read','date_created', 'sender','reciever']
    list_display = ['get_sender','get_message','get_reciever', 'date_created' ,'is_read']

    def get_sender(self, obj):
        return f"{obj.sender.first_name} {obj.sender.last_name}"
    

    def get_reciever(self, obj):
        return f"{obj.reciever.first_name} {obj.reciever.last_name}"
    
    def get_message(self, obj):
        words = obj.message.split()
        result = ' '.join(words[:3])
        return result

    get_sender.short_description = "Sender"
    get_reciever.short_description = "Reciecver"
    get_message.short_description = "Message"


class FileAdmin(admin.ModelAdmin):
    list_filter = ['post', 'message']
    list_display = ['id','file', 'post']


class ReactionAdmin(admin.ModelAdmin):
    list_filter = ["timeCreated", "reaction", "user"]
    list_display = ['getUserFullName', "reaction","post_id","timeCreated"]

    def getUserFullName(self, obj):
        return f"{obj.user.last_name} {obj.user.first_name}"


    getUserFullName.short_description = "Reactive"


class CommentAdmin(admin.ModelAdmin):
    list_filter = ["user", "post", "timeCreated"]
    list_display = ["getUserFullName","post_id","timeCreated","content"]

    def getUserFullName(self, obj):
        return f"{obj.user.last_name} {obj.user.first_name}"
    

    getUserFullName.short_description = "Commenter"



admin.site.register(Employee, EmployeeAdmin)
admin.site.register(Message, MessageAdmin)
admin.site.register(File, FileAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Reaction, ReactionAdmin)
admin.site.register(Comment, CommentAdmin)

