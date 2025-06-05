from django.urls import path
from .model_views import UserViews, EmployeeViews, MessageViews, PostViews
from .model_views import FileViews, CommentViews, ReactionViews, NotificationViews
from . import views

urlpatterns = [
    #User API endpoints
    path("token/", UserViews.CustomTokenObtainPairView.as_view(), name="get_token"),
    path("currentuser/", UserViews.GetUserView.as_view(), name="getUser"),
    path("allusers/", UserViews.GetAllUserView.as_view(), name="getAllUser"),
    path("updateuserinfos/<int:pk>/", UserViews.UpdateUserView.as_view(), name="UpdateUser"),
    path("sendresetcode/", UserViews.SendResetCodeView.as_view(), name="SendResetCode"),
    path("verifyresetcode/", UserViews.VerifyResetCodeView.as_view(), name="VerifyResetCode"),

    #Employee API endpoints
    path("profile/<str:username>/", EmployeeViews.ActualEmployeeView.as_view(), name="getMyProfile"),
    path("myprofile/getpositions/", EmployeeViews.get_positions, name="getMyProfilePositions"),
    path("myprofile/getgender/", EmployeeViews.get_genders, name="getMyProfileGender"),
    path("myprofile/updateProfilePicture/", EmployeeViews.UpdateProfilePictureView.as_view(), name="UpdateProfilePicture"),
    path("myprofile/updateemployee/", EmployeeViews.UpdateEmployeeView.as_view(), name="UpdateEmployee"),

    #Post API endpoints
    path("post/<int:pk>/", PostViews.PostCreate.as_view(), name="create_post"),
    path("post/delete/", PostViews.PostDelete.as_view(), name="delete_post"),
    path("post/", PostViews.PostListCreate.as_view(), name="load_posts"),
    path("post/previous/", PostViews.PostListPrevious.as_view(), name="load_previous_posts"),
    path("post/update/", PostViews.PostUpdate.as_view(), name="update_post"),

    #File API endpoints
    path("post/upload-file/", FileViews.FileUploadPost.as_view(), name="upload_file_2_post"),
    path("message/upload-file/", FileViews.FileUploadMessage.as_view(), name="upload_file_2_message"),
    path("post/process-video/<int:file_id>/<str:fileLoopid>/", FileViews.ProcessVideoView.as_view(), name="process-video"),

    #Reaction API endpoints
    path("post/reaction/", ReactionViews.ListReactionsView.as_view(), name="retrieve_reactions"),
    path("post/reaction/create/", ReactionViews.CreateReactionView.as_view(), name="create_reactions"),
    path("post/reaction/update/", ReactionViews.UpdateReactionView.as_view(), name="update_reactions"),
    path("post/reaction/destroy/", ReactionViews.DeleteReactionView.as_view(), name="delete_reactions"),

    #Comment API endpoints
    path("post/comments/", CommentViews.ListCommentsView.as_view(), name="retrieve_comments"),
    path("post/comment/create/", CommentViews.CreateCommentView.as_view(), name="create_comment"),
    path("post/comment/update/", CommentViews.UpdateCommentView.as_view(), name="update_comment"),
    path("post/comment/destroy/", CommentViews.DeleteCommentView.as_view(), name="delete_comment"),

    #Message API endpoints
    path("message/create/", MessageViews.SendMessageView.as_view(), name="Send_Message"),
    path("message/fetsh/", MessageViews.ListMessageView.as_view(), name="Fetsh_Messages"),
    path("message/unreadcounter/", MessageViews.UnreadMessageCountView.as_view(), name="Unread_Messages"),
    path("message/previous/", MessageViews.PreviousMessagesView.as_view(), name="Previous_Messages"),

    #Notification API endpoint
    path("notifications/", NotificationViews.ListNotificationsView.as_view(), name="List_Notifications"),

    #Weather API endpoint
    path("weather/", views.WeatherView.as_view(), name="weather"),
]