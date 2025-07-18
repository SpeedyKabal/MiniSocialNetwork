import { useEffect, useState, useRef } from "react";
import { useUser } from "../../Contexts/Usercontext";
import { ChevronRight, ChevronLeft, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../../api";
import {
  formatTime,
  contentDisplay,
  adjustTextareaHeight,
} from "../../services/Utilities";

function Comments({ post_id }) {
  const currentUser = useUser();
  const { t, i18n } = useTranslation();
  const [comment, setComment] = useState(""); // this hold the comment by the user to submit to the post
  const [comments, setComments] = useState([]); // this hold all comments by all users to the post
  const [commentSettingMenu, setCommentSettingMenu] = useState(0); // this will open DropDownList to either Update or Delete a comment
  const [deleteModel, setDeleteModel] = useState(null); // This Model will Show when Clicked on Delete Comment
  const [updateContent, setUpdateContent] = useState(""); // this hold the updated comment by the user to submit to the post
  const [updateContentid, setUpdateContentid] = useState(null); // this hold the id comment that user want to update
  const textareaRef = useRef(null);
  const textareaRefUpdate = useRef(null);

  const isArabic = i18n.language == "ar" ? true : false;

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    adjustTextareaHeight(textareaRef);
  }, [comment]);

  useEffect(() => {
    adjustTextareaHeight(textareaRefUpdate);
  }, [updateContent]);

  const openCloseDeleteModel = (idNumber) => {
    setDeleteModel(deleteModel === idNumber ? null : idNumber);
  };

  const fetchComments = async () => {
    const res = await api
      .get(`/api/post/comments/?post_id=${post_id}`)
      .catch((err) => alert(err));
    if (res.data) setComments(res.data);
  };

  const toggleDropDownList = (idNumber) => {
    setCommentSettingMenu(commentSettingMenu === idNumber ? 0 : idNumber);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    const commentData = new FormData();
    commentData.append("content", comment);
    commentData.append("post", post_id);
    await api
      .post("/api/post/comment/create/", commentData)
      .catch((err) => console.log(err));
    setComment("");
    fetchComments();
  };

  const handleUpdatingCommment = async (idNumber) => {
    if (updateContent.trim() === "") {
      console.error("Comment cannot be Empty!");
      return;
    }

    let prevComment = comments.filter((ele) => ele.id == idNumber);

    if (updateContent == prevComment[0].content) {
      setUpdateContentid(null);
      setUpdateContent("");
      return;
    }
    const commentData = new FormData();
    commentData.append("id", idNumber);
    commentData.append("content", updateContent);

    await api
      .patch("/api/post/comment/update/", commentData)
      .catch((err) => alert(err));
    setUpdateContentid(null);
    setUpdateContent("");
    fetchComments();
  };

  const handleDeleteCommment = async (CommentId) => {
    await api.delete("/api/post/comment/destroy/", {
      data: { id: CommentId },
    });
    fetchComments();
  };

  return (
    <div>
      <div className="flex justify-center mb-1">
        <span className={`text-sky-900 text-lg`}>{t("post.comments")}</span>
      </div>
      <form
        onSubmit={handleComment}
        className={`flex relative w-full ${isArabic ? "flex-row-reverse" : ""
          }`}
      >
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`${isArabic
            ? "اكتب تعليقك هنا..."
            : i18n.language == "en"
              ? "Write your comment here..."
              : "Ecrivez votre commentaire ici..."
            }`}
          className={`w-full h-[2rem] px-2 py-1 mx-1 text-lg rounded-lg outline-1 outline-blue-400 outline ${isArabic ? "text-right" : "text-left"}`}
          dir={isArabic ? "rtl" : "ltr"}
        />
        <button type="submit" className={`absolute top-0 text-blue-500 hover:bg-blue-200 ${isArabic ? "left-0" : "right-0"}`}>
          {isArabic ? (
            <ChevronLeft size={32} strokeWidth={3} absoluteStrokeWidth />
          ) : (
            <ChevronRight size={32} strokeWidth={3} absoluteStrokeWidth />
          )}
        </button>
      </form>

      {comments.length > 0 ? (
        comments.map((ele) => (
          <div className="flex my-4 relative" key={ele.id}>
            <div className="px-2">
              <img
                className="rounded-full size-10 lg:size-15"
                src={ele.profile_pic}
              />
            </div>
            <div className="flex flex-col justify-center gap-2 w-[90%]">
              <span className="text-sky-900 text-md lg:text-lg font-bold">
                {ele.user.last_name} {ele.user.first_name}
              </span>
              <div className="flex justify-between items-center bg-blue-300/50 ring-2 ring-sky-300 rounded-xl py-1 px-2">
                {updateContentid !== ele.id ? (
                  <div
                    className="text-sky-900 whitespace-pre-line text-sm lg:text-lg flex items-center font-semibold px-2 max-w-full overflow-hidden"
                    dir={contentDisplay(ele.content) ? "rtl" : "ltr"}
                  >
                    {ele.content}
                  </div>
                ) : (
                  <div className="relative w-full mx-2">
                    <textarea
                      name=""
                      id=""
                      rows={1}
                      onChange={(e) => setUpdateContent(e.target.value)}
                      ref={textareaRefUpdate}
                      value={updateContent}
                      className="resize-none w-full px-1 py-2 lg:px-4 lg:py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:placeholder:text-lg"
                    ></textarea>
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdatingCommment(ele.id);
                      }}
                      className="text-blue-500 hover:bg-blue-200 rounded-lg absolute top-0 right-0 translate-x-2"
                    >
                      <ChevronRight
                        size={40}
                        strokeWidth={2}
                        absoluteStrokeWidth
                      />
                    </button>
                  </div>
                )}

                <div className="relative">
                  {currentUser?.id === ele.user.id && (
                    <>
                      <button
                        onClick={() => {
                          toggleDropDownList(ele.id);
                        }}
                        className="text-sky-900 cursor-pointer duration-300 transition ease-in-out delay-150 hover:text-blue-500 hover:rotate-90"
                      >
                        <Settings />
                      </button>

                      {commentSettingMenu === ele.id && (
                        <ul className="mt-2 w-32 bg-slate-200 rounded-lg drop-shadow-lg z-10 absolute top-5 right-0 lg:left-0">
                          <li
                            className="px-2 py-2 hover:bg-blue-200 cursor-pointer"
                            onClick={() => {
                              setUpdateContentid(ele.id);
                              setUpdateContent(ele.content);
                              toggleDropDownList(ele.id);
                            }}
                          >
                            {t("post.update")}
                          </li>
                          <li
                            className="px-2 py-2 hover:bg-red-300 cursor-pointer"
                            onClick={() => openCloseDeleteModel(ele.id)}
                          >
                            {t("post.delete")}
                          </li>
                        </ul>
                      )}
                    </>
                  )}
                </div>
              </div>
              <p className="text-sky-900 text-end mr-2 whitespace-nowrap text-sm lg:text-md">
                {formatTime(ele.timeCreated, i18n.language)}
              </p>
            </div>
            {deleteModel === ele.id && (
              <li className="absolute inset-0 bg-black/75 bg-opacity-50 flex justify-center items-center z-20 rounded-lg">
                <div className="bg-white">
                  {/* <!-- Modal Header --> */}
                  <div className="bg-indigo-500 text-white px-4 py-2 flex justify-between">
                    <h2 className="text-md lg:text-lg font-semibold">
                      {t("post.deletecomment")}
                    </h2>
                  </div>
                  {/* <!-- Modal Body --> */}
                  <div className="p-6 text-md lg:text-lg">
                    <p>{t("post.deleteconf")}</p>
                  </div>
                  {/* <!-- Modal Footer --> */}
                  <div className="border-t px-4 py-2 flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        toggleDropDownList(0);
                        openCloseDeleteModel(ele.id);
                      }}
                      className="px-3 py-2 bg-slate-500 hover:bg-slate-400 text-white text-md lg:text-lg  rounded-md w-full sm:w-auto"
                    >
                      {t("post.cancel")}
                    </button>
                    <button
                      onClick={() => {
                        toggleDropDownList(0);
                        handleDeleteCommment(ele.id);
                        openCloseDeleteModel(ele.id);
                      }}
                      className="px-3 py-2 bg-indigo-500 hover:bg-indigo-300 text-white text-md lg:text-lg  rounded-md w-full sm:w-auto"
                    >
                      {t("post.delete")}
                    </button>
                  </div>
                </div>
              </li>
            )}
          </div>
        ))
      ) : (
        <div className="text-sky-900 text-xl sm:text-md text-center my-4">
          {t("post.firstcomment")}
        </div>
      )}
    </div>
  );
}

export default Comments;
