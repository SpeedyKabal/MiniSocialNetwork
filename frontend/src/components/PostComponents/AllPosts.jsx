import { useState, useRef, useEffect } from "react";
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
import { ChevronRight, ChevronLeft } from "lucide-react";
import {
  formatTime,
  contentDisplay,
  convertLinksInsideMessages,
  adjustTextareaHeight,
} from "../../services/Utilities";
import Media from "./Media";

function AllPosts({ post, OnPostDeleted, showDetails = false }) {
  const currentUser = useUser();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language == "ar";
  const [updatePostcontent, setUpdatePostContent] = useState(post.content);
  const [isUpdate, setIsUpdate] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    adjustTextareaHeight(textareaRef);
  }, [updatePostcontent]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsUpdate(false);
      return;
    }
  };

  useEffect(() => {
    if (isUpdate) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUpdate]);

  const handleDeletePost = async (id) => {
    await api.delete("api/post/delete/", { data: { post_id: id } });
    if (OnPostDeleted) {
      OnPostDeleted();
    }
  };

  const handleEditPost = async (id) => {
    const formdata = new FormData();
    formdata.append("content", updatePostcontent);
    formdata.append("id", id);

    await api
      .put("api/post/update/", formdata)
      .then((res) => {
        if (res.status === 200) setIsUpdate(false);
      })
      .catch((err) => console.log(err));
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
                <h3 className="font-semibold text-gray-900 text-sm lg:text-lg">
                  {post.author.last_name} {post.author.first_name}
                </h3>
                <p className="text-sm text-gray-500 lg:text-md">
                  {post.job} · {formatTime(post.created_at, i18n.language)}
                </p>
              </div>
            </div>
            {currentUser.id == post.author.id && showDetails && (
              <PostDropdown
                onEdit={() => setIsUpdate(true)}
                onDelete={() => handleDeletePost(post.id)}
              />
            )}
          </div>
          <Media urlFile={post.mediaFiles} />
          {showDetails ? (
            isUpdate ? (
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  name="updateContent"
                  value={updatePostcontent}
                  onChange={(e) => setUpdatePostContent(e.target.value)}
                  className="resize-none text-xl w-full px-1 py-2 lg:px-4 lg:py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:placeholder:text-xl"
                ></textarea>
                <button
                  onClick={() => handleEditPost(post.id)}
                  className="text-blue-500 hover:bg-green-500 rounded-lg absolute top-1/2 right-0 transform -translate-x-1/2 -translate-y-1/2 "
                >
                  <ChevronRight size={35} strokeWidth={3} absoluteStrokeWidth />
                </button>
              </div>
            ) : (
              <p
                className="text-gray-800 mb-4 whitespace-pre-line text-xl leading-relaxed ml-2"
                dir={contentDisplay(post.content) ? "rtl" : "ltr"}
              >
                {convertLinksInsideMessages(post.content)}
              </p>
            )
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

          <hr
            className={`w-[50%] text-blue-500  ${
              contentDisplay(post.content) ? "ml-auto" : ""
            }`}
            style={{
              float: contentDisplay(post.content) ? "right" : "none",
              background: "linear-gradient(to right, red, blue, red)",
              height: "2px",
              border: "none",
            }}
          />

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
