import { useEffect, useState } from "react";
import { useUser } from "../../Contexts/Usercontext";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { IoSettingsOutline } from "react-icons/io5";
import api from "../../api";
import { formatTime, contentDisplay } from "../../services/Utilities";

function Comments({ post_id }) {
  const currentUser = useUser();
  const { t, i18n } = useTranslation();
  const [comment, setComment] = useState(""); // this hold the comment by the user to submit to the post
  const [comments, setComments] = useState([]); // this hold all comments by all users to the post
  const [commentSettingMenu, setCommentSettingMenu] = useState(0); // this will open DropDownList to either Update or Delete a comment
  const [deleteModel, setDeleteModel] = useState(false); // This Model will Show when Clicked on Delete Comment
  const [updateContent, setUpdateContent] = useState(""); // this hold the updated comment by the user to submit to the post
  const [updateContentid, setUpdateContentid] = useState(null); // this hold the id comment that user want to update

  const isArabic = i18n.language == "ar";

  useEffect(() => {
    fetchComments();
  }, []);

  const openCloseDeleteModel = () => {
    setDeleteModel(!deleteModel);
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
      <div className="flex justify-center mb-4">
        <span className={`text-sky-900 text-3xl`}>{t("post.comments")}</span>
      </div>

      {isArabic ? (
        <form
          onSubmit={handleComment}
          className="flex flex-row-reverse w-full"
        >
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="أكتب تعليقك هنا"
            className="w-full text-right h-[3rem] px-3 py-1 mx-2 text-2xl rounded-lg outline-1 outline-blue-400 outline"
          />
          <button
            type="submit"
            className="text-blue-500 hover:bg-blue-200"
          >
            <ChevronLeft size={50} />
          </button>
        </form>
      ) : (
        <form onSubmit={handleComment} className="flex w-full">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("post.commentplaceholder")}
            className="w-full h-[3rem] px-3 py-1 mx-2 text-2xl rounded-lg outline-1 outline-blue-400 outline"
          />
          <button
            type="submit"
            className="text-blue-500 hover:bg-blue-200"
          >
            <ChevronRight size={50} strokeWidth={3} absoluteStrokeWidth />
          </button>
        </form>
      )}

      {comments.length > 0 ? (
        comments.map((ele) => (
          <div className="flex my-4" key={ele.id}>
            <div className="px-2">
              <img className="rounded-full size-20" src={ele.profile_pic} />
            </div>
            <div className="flex flex-col justify-center gap-2 w-[90%]">
              <span className={`text-sky-900 text-2xl font-bold`}>
                {ele.user.last_name} {ele.user.first_name}
              </span>
              <div className="flex justify-between bg-blue-300/50 ring-2 ring-sky-300 rounded-xl py-2 px-2 mr-3">
                {updateContentid !== ele.id ? (
                  <div
                    className="text-sky-900 text-xl flex items-center font-semibold px-2 mx-2 w-full"
                    dir={contentDisplay(ele.content) ? "rtl" : "ltr"}
                  >
                    {ele.content}
                  </div>
                ) : (
                  <div className="relative w-full mx-2">
                    <input
                      value={updateContent}
                      type="text"
                      className="w-full h-[3rem] px-3 py-1 mx-2 text-2xl rounded-lg outline-1 outline-blue-400 outline bg-green-200/80"
                      onChange={(e) => setUpdateContent(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdatingCommment(ele.id);
                      }}
                      className="text-blue-500 absolute top-0 right-0"
                    >
                      <ChevronRight size={50} strokeWidth={3} absoluteStrokeWidth />
                    </button>
                  </div>
                )}

                <div className="flex items-center">
                  <span className={`text-sky-900 p-2 mr-2 whitespace-nowrap`}>
                    {formatTime(ele.timeCreated, i18n.language)}
                  </span>
                  {currentUser?.id === ele.user.id && (
                    <div className="relative">
                      <button
                        onClick={() => {
                          toggleDropDownList(ele.id);
                        }}
                        className={`text-sky-900 text-3xl duration-300 px-2 mx-2 transition ease-in-out delay-150 hover:text-blue-500 hover:rotate-45`}
                      >
                        <IoSettingsOutline />
                      </button>

                      {commentSettingMenu === ele.id && (
                        <ul className="mt-2 w-48 bg-slate-200 rounded-md drop-shadow-lg z-10 absolute top-7 left-4">
                          <li
                            className="px-4 py-2 hover:bg-blue-200 cursor-pointer"
                            onClick={() => {
                              setUpdateContentid(ele.id);
                              setUpdateContent(ele.content);
                              toggleDropDownList(ele.id);
                            }}
                          >
                            {t("post.update")}
                          </li>
                          <li
                            className="px-4 py-2 hover:bg-red-300 cursor-pointer"
                            onClick={openCloseDeleteModel}
                          >
                            {t("post.delete")}
                          </li>
                          {deleteModel && (
                            <li className="fixed inset-0 bg-black/75 bg-opacity-50 flex justify-center items-center z-20">
                              <div className="bg-white">
                                {/* <!-- Modal Header --> */}
                                <div className="bg-indigo-500 text-white px-4 py-2 flex justify-between">
                                  <h2 className=" text-2xl font-semibold">
                                    {t("post.deletecomment")}
                                  </h2>
                                </div>
                                {/* <!-- Modal Body --> */}
                                <div className="p-6 text-2xl">
                                  <p>{t("post.deleteconf")}</p>
                                </div>
                                {/* <!-- Modal Footer --> */}
                                <div className="border-t px-4 py-2 flex justify-end space-x-4">
                                  <button
                                    onClick={() => {
                                      toggleDropDownList(0);
                                      openCloseDeleteModel();
                                    }}
                                    className="px-5 py-2 bg-slate-500 hover:bg-slate-400 text-white text-xl  rounded-md w-full sm:w-auto"
                                  >
                                    {t("post.cancel")}
                                  </button>
                                  <button
                                    onClick={() => {
                                      toggleDropDownList(0);
                                      handleDeleteCommment(ele.id);
                                      openCloseDeleteModel();
                                    }}
                                    className="px-5 py-2 bg-indigo-500 hover:bg-indigo-300 text-white text-xl  rounded-md w-full sm:w-auto"
                                  >
                                    {t("post.delete")}
                                  </button>
                                </div>
                              </div>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-sky-900 text-3xl text-center my-4">
          {t("post.firstcomment")}
        </div>
      )}
    </div>
  );
}

export default Comments;
