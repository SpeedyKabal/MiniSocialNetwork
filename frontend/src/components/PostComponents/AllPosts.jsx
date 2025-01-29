import { useState } from "react";
import api from "../../api";
import Reactions from "./Reactions";
import Comments from "./Comments";
import { Link } from "react-router-dom";
import "yet-another-react-lightbox/styles.css";
import "media-chrome";
import { useTranslation } from "react-i18next";
import "../../styles/mediaChrome.css";
import { useUser } from "../../Contexts/Usercontext";
import PostDropdown from "./PostDropdown";
import {
  formatTime,
  contentDisplay,
  convertLinksInsideMessages,
} from "../../services/Utilities";
import Media from "./Media";

function AllPosts({ post, OnPostDeleted, showDetails = false }) {
  const currentUser = useUser();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language == "ar";

  const handleDeletePost = async (id) => {
    await api.delete("api/post/delete/", { data: { post_id: id } });
    if (OnPostDeleted) {
      OnPostDeleted();
    }
  };

  const handleEditPost = async (id) => {
    alert("This Feature Will be added soon !");
  };

  return (
    <div className="lg:w-2/3 mx-auto">
      <div key={post.id} className="bg-white rounded-lg drop-shadow-lg mb-6">
        <div className="p-1 lg:p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={post.author.profile_pic}
                alt={post.author.first_name}
                className="size-10 lg:size-15  rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900 text-md lg:text-lg">
                  {post.author.last_name} {post.author.first_name}
                </h3>
                <p className="text-sm text-gray-500 text-sm lg:text-md">
                  {post.job} · {formatTime(post.created_at, i18n.language)}
                </p>
              </div>
            </div>
            {currentUser.id == post.author.id && (
              <PostDropdown
                onEdit={() => handleEditPost(post.id)}
                onDelete={() => handleDeletePost(post.id)}
              />
            )}
          </div>

          <Media urlFile={post.mediaFiles} />

          {showDetails ? (
            <p
              className="text-gray-800 mb-4 whitespace-pre-line text-xl leading-relaxed ml-2"
              dir={contentDisplay(post.content) ? "rtl" : "ltr"}
            >
              {convertLinksInsideMessages(post.content)}
            </p>
          ) : (
            <Link to={`/post/${post.id}`} className="w-full">
              <p
                className="text-gray-800 mb-4 whitespace-pre-line text-xl leading-relaxed ml-2"
                dir={contentDisplay(post.content) ? "rtl" : "ltr"}
              >
                {convertLinksInsideMessages(post.content)}
              </p>
            </Link>
          )}

          {showDetails ? (
            <>
              <Reactions post_id={post.id} />
              <Comments post_id={post.id} />
            </>
          ) : (
            <div className="flex items-center space-x-4 text-gray-500 text-sm">
              <div className="flex items-center space-x-2 hover:text-blue-600">
                <span className="text-lg">👍👎 {post.reactions}</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-blue-600">
                <span className="text-lg">💬 {post.comments}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllPosts;
