from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from . import views
urlpatterns = [
    #Post API LINK
    path("post/<int:pk>/", views.PostCreate.as_view(), name="create_post"),
    path("post/delete/", views.PostDelete.as_view(), name="delete_post"),
    path("post/", views.PostListCreate.as_view(), name="load_posts"),
    path("post/previous/", views.PostListPrevious.as_view(), name="load_previous_posts"),
    path("post/update/", views.PostUpdate.as_view(), name="update_post"),
    
    #File Uploading
    path("post/upload-file/", views.FileUploadPost.as_view(), name="upload_file_2_post"),
    path("message/upload-file/", views.FileUploadMessage.as_view(), name="upload_file_2_message"),

    #Get Current User Information API LINK
    path("token/", views.CustomTokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("currentuser/", views.GetUserView.as_view(), name="getUser"),
    
    
    #Reactions API LINKS
    path("post/reaction/", views.ListReactionsView.as_view(), name="retrieve_reactions"),
    path("post/reaction/create/", views.CreateReactionView.as_view(), name="create_reactions"),
    path("post/reaction/update/", views.UpdateReactionView.as_view(), name="update_reactions"),
    path("post/reaction/destroy/", views.DeleteReactionView.as_view(), name="delete_reactions"),
    
    #Comments API LINKS
    path("post/comments/", views.ListCommentsView.as_view(), name="retrieve_comments"),
    path("post/comment/create/", views.CreateCommentView.as_view(), name="create_comment"),
    path("post/comment/update/", views.UpdateCommentView.as_view(), name="update_comment"),
    path("post/comment/destroy/", views.DeleteCommentView.as_view(), name="delete_comment"),

    
    #Get All User Information API LINK
    path("allusers/", views.GetAllUserView.as_view(), name="getAllUser"),
    path("updateuserinfos/<int:pk>/", views.UpdateUserView.as_view(), name="UpdateUser"),
    path("sendresetcode/", views.SendResetCodeView.as_view(), name="SendResetCode"),
    path("verifyresetcode/", views.VerifyResetCodeView.as_view(), name="VerifyResetCode"),
    
    #Get Employee Information API LINK
    path("profile/<str:username>/", views.ActualEmployeeView.as_view(), name="getMyProfile"),
    path("myprofile/getpositions/", views.get_positions, name="getMyProfilePositions"),
    path("myprofile/getgender/", views.get_genders, name="getMyProfileGender"),
    path("myprofile/updateProfilePicture/", views.UpdateProfilePictureView.as_view(), name="UpdateProfilePicture"),
    path("myprofile/updateemployee/", views.UpdateEmployeeView.as_view(), name="UpdateEmployee"),
    
    #Message API LINKS
    path("message/create/", views.SendMessageView.as_view(), name="Send_Message"),
    path("message/fetsh/", views.ListMessageView.as_view(), name="Fetsh_Messages"),
    path("message/unreadcounter/", views.UnreadMessageCountView.as_view(), name="Unread_Messages"),
    path("message/previous/", views.PreviousMessagesView.as_view(), name="Previous_Messages"),

]