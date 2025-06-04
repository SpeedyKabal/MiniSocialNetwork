from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from .model_views.UserViews import (
    CustomTokenObtainPairView, CreateUserView, SendResetCodeView, VerifyResetCodeView, UpdateUserView, GetUserView, GetAllUserView
)
from .model_views.EmployeeViews import (
    UpdateEmployeeView, ActualEmployeeView, UpdateProfilePictureView, get_positions, get_genders
)
from .model_views.MessageViews import (
    SendMessageView, ListMessageView, UnreadMessageCountView, PreviousMessagesView
)
from .model_views.PostViews import (
    PostListCreate, PostListPrevious, PostCreate, PostUpdate, PostDelete
)
from .model_views.FileViews import (
    FileUploadPost, FileUploadMessage, ProcessVideoView
)
from .model_views.CommentViews import (
    CreateCommentView, UpdateCommentView, ListCommentsView, DeleteCommentView
)
from .model_views.ReactionViews import (
    CreateReactionView, UpdateReactionView, ListReactionsView, DeleteReactionView
)
from . import views

urlpatterns = [
    #User API endpoints
    path("token/", CustomTokenObtainPairView.as_view(), name="get_token"),
    path("currentuser/", GetUserView.as_view(), name="getUser"),
    path("allusers/", GetAllUserView.as_view(), name="getAllUser"),
    path("updateuserinfos/<int:pk>/", UpdateUserView.as_view(), name="UpdateUser"),
    path("sendresetcode/", SendResetCodeView.as_view(), name="SendResetCode"),
    path("verifyresetcode/", VerifyResetCodeView.as_view(), name="VerifyResetCode"),

    #Employee API endpoints
    path("profile/<str:username>/", ActualEmployeeView.as_view(), name="getMyProfile"),
    path("myprofile/getpositions/", get_positions, name="getMyProfilePositions"),
    path("myprofile/getgender/", get_genders, name="getMyProfileGender"),
    path("myprofile/updateProfilePicture/", UpdateProfilePictureView.as_view(), name="UpdateProfilePicture"),
    path("myprofile/updateemployee/", UpdateEmployeeView.as_view(), name="UpdateEmployee"),

    #Post API endpoints
    path("post/<int:pk>/", PostCreate.as_view(), name="create_post"),
    path("post/delete/", PostDelete.as_view(), name="delete_post"),
    path("post/", PostListCreate.as_view(), name="load_posts"),
    path("post/previous/", PostListPrevious.as_view(), name="load_previous_posts"),
    path("post/update/", PostUpdate.as_view(), name="update_post"),

    #File API endpoints
    path("post/upload-file/", FileUploadPost.as_view(), name="upload_file_2_post"),
    path("message/upload-file/", FileUploadMessage.as_view(), name="upload_file_2_message"),
    path("post/process-video/<int:file_id>/<str:fileLoopid>/", ProcessVideoView.as_view(), name="process-video"),

    #Reaction API endpoints
    path("post/reaction/", ListReactionsView.as_view(), name="retrieve_reactions"),
    path("post/reaction/create/", CreateReactionView.as_view(), name="create_reactions"),
    path("post/reaction/update/", UpdateReactionView.as_view(), name="update_reactions"),
    path("post/reaction/destroy/", DeleteReactionView.as_view(), name="delete_reactions"),

    #Comment API endpoints
    path("post/comments/", ListCommentsView.as_view(), name="retrieve_comments"),
    path("post/comment/create/", CreateCommentView.as_view(), name="create_comment"),
    path("post/comment/update/", UpdateCommentView.as_view(), name="update_comment"),
    path("post/comment/destroy/", DeleteCommentView.as_view(), name="delete_comment"),

    #Message API endpoints
    path("message/create/", SendMessageView.as_view(), name="Send_Message"),
    path("message/fetsh/", ListMessageView.as_view(), name="Fetsh_Messages"),
    path("message/unreadcounter/", UnreadMessageCountView.as_view(), name="Unread_Messages"),
    path("message/previous/", PreviousMessagesView.as_view(), name="Previous_Messages"),

    #Notification API endpoint
    path("notifications/", views.ListNotificationsView.as_view(), name="List_Notifications"),

    #Weather API endpoint
    path("weather/", views.WeatherView.as_view(), name="weather"),
]