import React, { useEffect, useState } from "react";
import api from "../api";
import { BiSolidLike, BiSolidDislike } from "react-icons/bi";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import classNames from "classnames";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "media-chrome";
import { useTranslation } from "react-i18next";
import "../styles/mediaChrome.css";
import { useUser } from "../Contexts/Usercontext";
import { formatTime, contentDisplay } from "../services/Utilities";

function Post({ post, OnPostDeleted }) {
  const currentUser = useUser();
  const [reactions, setReactions] = useState({ Likes: 0, Dislikes: 0 }); // This count All reaction by all users to the post
  const [userReactions, setUserReactions] = useState(null); // This Hold The Reaction of Actual user to the post
  const [comment, setComment] = useState(""); // this hold the comment by the user to submit to the post
  const [comments, setComments] = useState([]); // this hold all comments by all users to the post
  const [commentSettingMenu, setCommentSettingMenu] = useState(0); // this will open DropDownList to either Update or Delete a comment
  const [postSettingMenu, setPostSettingMenu] = useState(false); // this will open DropDownList to either Update or Delete a post

  const [deleteModel, setDeleteModel] = useState(false); // This Model will Show when Clicked on Delete Comment
  const [updateContent, setUpdateContent] = useState(""); // this hold the updated comment by the user to submit to the post
  const [updateContentid, setUpdateContentid] = useState(null); // this hold the id comment that user want to update
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language == "ar";

  useEffect(() => {
    fetchReactions();
    fetchComments();
  }, []);

  const openCloseDeleteModel = () => {
    setDeleteModel(!deleteModel);
  };

  const toggleDropDownList = (idNumber) => {
    setCommentSettingMenu(commentSettingMenu === idNumber ? 0 : idNumber);
  };

  const fetchReactions = async () => {
    try {
      const response = await api.get(`/api/post/reaction/?post_id=${post.id}`);
      const data = response.data;
      // Calculate likes and dislikes from fetched reactions
      const LikesCounter = data.filter((ele) => ele.reaction == "Like").length;
      const DislikesCounter = data.filter(
        (ele) => ele.reaction == "Dislike"
      ).length;
      // Update state with the fetched reactions
      setReactions({ Likes: LikesCounter, Dislikes: DislikesCounter });

      const userReaction = data.filter(
        (ele) => ele.user.id === currentUser?.id
      );
      if (userReaction.length > 0) {
        setUserReactions(userReaction[0].reaction);
      }
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  const fetchComments = async () => {
    const res = await api
      .get(`/api/post/comments/?post_id=${post.id}`)
      .catch((err) => alert(err));
    if (res.data) setComments(res.dat);
  };

  const handleDeletePost = async (id) => {
    await api.delete("api/post/delete/", { data: { post_id: id } });
    if (OnPostDeleted) {
      OnPostDeleted();
    }
  };

  const handleReaction = async (reactionType) => {
    let updateReaction = { ...reactions };
    let newUserReaction = reactionType;

    if (userReactions == reactionType) {
      // User click on the Same Reaction , Delete Reaction
      await api
        .delete("/api/post/reaction/destroy/", { data: { post_id: post.id } })
        .catch((err) => alert(err));
      newUserReaction = null;
      if (reactionType == "Like") {
        updateReaction.Likes -= 1;
      } else {
        updateReaction.Dislikes -= 1;
      }
    } else {
      if (userReactions) {
        //User click on a different Reaction , Update Reaction
        await api
          .patch("/api/post/reaction/update/", {
            post: post.id,
            reaction: reactionType,
          })
          .catch((err) => alert(err));
        if (userReactions == "like") {
          updateReaction.likes--;
          updateReaction.Dislikes++;
        } else {
          updateReaction.Dislikes--;
          updateReaction.Likes++;
        }
      } else {
        //User first time make Reaction , Create Reaction
        if (reactionType == "Like") {
          updateReaction.Likes += 1;
        } else if (reactionType == "Dislike") {
          updateReaction.Dislikes += 1;
        }
        const postData = new FormData();
        postData.append("post", post.id);
        postData.append("reaction", reactionType);

        await api
          .post("api/post/reaction/create/", postData)
          .catch((err) => alert(err));
      }
    }
    setReactions(updateReaction);
    setUserReactions(newUserReaction);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    const commentData = new FormData();
    commentData.append("content", comment);
    commentData.append("post", post.id);
    await api
      .post("/api/post/comment/create/", commentData)
      .catch((err) => console.log(err));
    setComment("");
    fetchComments();
  };

  const handleUpdatingCommment = async (idNumber) => {
    if (updateContent.trim() === "") {
      alert("Comment cannot be Empty!");
      // setUpdateContentid(null);
      // setUpdateContent("");
      // fetchComments();
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
    await api.delete("/api/post/comment/destroy/", { data: { id: CommentId } });
    fetchComments();
  };

  return (
    <div className="w-full lg:w-1/2 max-w-[800px] flex flex-col justify-between bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl my-6 drop-shadow-lg">
      <div className="flex justify-between">
        <p
          className="text-slate-100 px-6 my-6 text-2xl font-serif font-semibold whitespace-pre-line"
          dir={contentDisplay(post.content) ? "rtl" : "ltr"}
        >
          {post.content}
        </p>
        {post.author.id === currentUser?.id && (
          <div className="relative px-5 my-6">
            <button
              className="text-3xl text-indigo-400 transition-transform duration-200 active:scale-95"
              onClick={() => setPostSettingMenu(!postSettingMenu)}
            >
              <IoSettingsOutline />
            </button>
            {postSettingMenu === true && (
              <ul className="text-2xl absolute top-8 left-8 bg-slate-100 rounded-xl drop-shadow-lg z-10 overflow-hidden">
                <li
                  className="px-4 py-2 text-slate-700 hover:bg-indigo-100 transition-colors duration-200 cursor-pointer"
                  onClick={() => setPostSettingMenu(!postSettingMenu)}
                >
                  Update
                </li>
                <li
                  className="px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    handleDeletePost(post.id);
                    setPostSettingMenu(!postSettingMenu);
                  }}
                >
                  Delete
                </li>
              </ul>
            )}
          </div>
        )}
      </div>

      {post.image && (
        <div className="gallery flex justify-center max-h-[400px] px-4">
          <img
            src={post.image}
            alt="PostImage"
            className="object-cover cursor-pointer rounded-xl"
            onClick={() => setIsLightboxOpen(true)}
          />
          {isLightboxOpen && (
            <Lightbox
              open={isLightboxOpen}
              close={() => setIsLightboxOpen(false)}
              slides={[{ src: post.image }]}
              plugins={[Fullscreen, Zoom]}
              showZoomControls
              zoom={{
                maxZoomPixelRatio: 10,
                zoomInMultiplier: 1,
                doubleTapDelay: 500,
                doubleClickDelay: 500,
                doubleClickMaxStops: 5,
                wheelZoomDistanceFactor: 50,
                pinchZoomDistanceFactor: 50,
                scrollToZoom: true,
              }}
            />
          )}
        </div>
      )}
      {post.video && (
        <media-controller breakpointsm className="mx-4 rounded-xl overflow-hidden">
          <video
            slot="media"
            src={post.video}
            preload="metadata"
            crossOrigin=""
            className="mx-auto"
          ></video>
          <div
            className="text-5xl bg-black/25 text-center w-full text-white"
            slot="top-chrome"
          >
            CSAPP
          </div>
          <media-loading-indicator slot="centered-chrome"></media-loading-indicator>
          <media-control-bar>
            <media-play-button></media-play-button>
            <media-time-display showduration></media-time-display>
            <media-mute-button></media-mute-button>
            <media-volume-range></media-volume-range>
            <media-seek-backward-button seekoffset="10"></media-seek-backward-button>
            <media-time-range></media-time-range>
            <media-seek-forward-button seekoffset="10"></media-seek-forward-button>
            <media-playback-rate-button rates="0.5 1 1.5 2 2.5 3 5"></media-playback-rate-button>
            <media-fullscreen-button></media-fullscreen-button>
          </media-control-bar>
        </media-controller>
      )}
      {post.audio && (
        <media-controller audio className="mx-4 rounded-xl overflow-hidden">
          <audio slot="media" src={post.audio}></audio>
          <media-control-bar>
            <media-play-button></media-play-button>
            <media-time-display showduration></media-time-display>
            <media-time-range></media-time-range>
            <media-playback-rate-button></media-playback-rate-button>
            <media-mute-button></media-mute-button>
            <media-volume-range></media-volume-range>
          </media-control-bar>
        </media-controller>
      )}
      <div
        className={classNames("flex justify-between px-6 mt-4", {
          "flex-row-reverse": isArabic,
        })}
      >
        <p className="text-slate-400">
          {formatTime(post.created_at, i18n.language)}
        </p>
        <p className="text-slate-400">
          {isArabic
            ? `${post.author.last_name} ${post.author.first_name} : ${t(
              "post.postedBy"
            )}`
            : `${t("post.postedBy")} : ${post.author.last_name} ${post.author.first_name
            }`}
        </p>
      </div>
      <div className="post-actions flex justify-between px-6 py-3 border-t border-slate-700 mt-4">
        <button
          onClick={() => handleReaction("Like")}
          className={classNames("flex items-center gap-2 text-3xl transition-colors duration-200", {
            "text-emerald-400": userReactions == "Like",
            "text-slate-400 hover:text-emerald-400": userReactions != "Like",
          })}
        >
          <BiSolidLike /> <div>{reactions.Likes}</div>
        </button>
        <span className="text-slate-400 text-2xl">{t(post.comments)}</span>
        <button
          onClick={() => handleReaction("Dislike")}
          className={classNames("flex items-center gap-2 text-3xl transition-colors duration-200", {
            "text-rose-400": userReactions == "Dislike",
            "text-slate-400 hover:text-rose-400": userReactions != "Dislike",
          })}
        >
          <BiSolidDislike />
          <a href="#">{reactions.Dislikes}</a>
        </button>
      </div>
      {isArabic ? (
        <form
          onSubmit={handleComment}
          className="flex flex-row-reverse w-full relative px-4 pb-4"
        >
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="أكتب تعليقك هنا"
            className="w-full text-right h-[40px] px-4 py-2 text-2xl rounded-xl bg-slate-700 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="text-indigo-400 text-5xl absolute top-[-2px] left-4 pb-1 transition-transform active:scale-95"
          >
            <IoIosArrowBack />
          </button>
        </form>
      ) : (
        <form onSubmit={handleComment} className="flex w-full relative px-4 pb-4">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("post.commentplaceholder")}
            className="w-full h-[40px] px-4 py-2 text-2xl rounded-xl bg-slate-700 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="text-indigo-400 text-5xl absolute top-[-2px] right-4 pb-1 transition-transform active:scale-95"
          >
            <IoIosArrowForward />
          </button>
        </form>
      )}

      {comments.length > 0 ? (
        comments.map((ele) => (
          <div className="flex my-4 px-4" key={ele.id}>
            <div className="px-2">
              <img className="rounded-full size-20" src={ele.profile_pic} />
            </div>
            <div className="flex flex-col justify-center gap-2 w-[90%]">
              <span className="text-white text-2xl font-bold">
                {ele.user.last_name} {ele.user.first_name}
              </span>
              <div className="flex items-start justify-between bg-slate-700 rounded-xl py-3 px-4 mr-3">
                {updateContentid !== ele.id ? (
                  <span className="text-slate-100 text-xl font-semibold">
                    {ele.content}
                  </span>
                ) : (
                  <div className="relative w-full">
                    <input
                      value={updateContent}
                      type="text"
                      className="text-slate-900 text-xl font-semibold px-4 w-full h-12 rounded-xl"
                      onChange={(e) => setUpdateContent(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdatingCommment(ele.id);
                      }}
                      className="text-indigo-400 text-5xl absolute top-0 right-2 transition-transform active:scale-95"
                    >
                      <IoIosArrowForward />
                    </button>
                  </div>
                )}

                <div className="flex items-center">
                  <span className="text-right mr-2 text-slate-400">
                    {formatTime(ele.timeCreated, i18n.language)}
                  </span>
                  {currentUser?.id === ele.user.id && (
                    <div className="relative">
                      <button
                        onClick={() => {
                          toggleDropDownList(ele.id);
                        }}
                        className="text-slate-400 text-3xl transition-transform duration-200 px-2 active:scale-95"
                      >
                        <IoSettingsOutline />
                      </button>

                      {commentSettingMenu === ele.id && (
                        <ul className="mt-2 w-48 bg-slate-100 rounded-xl drop-shadow-lg z-10 absolute top-7 left-4 overflow-hidden">
                          <li
                            className="px-4 py-2 text-slate-700 hover:bg-indigo-100 transition-colors duration-200 cursor-pointer"
                            onClick={() => {
                              setUpdateContentid(ele.id);
                              setUpdateContent(ele.content);
                              toggleDropDownList(ele.id);
                            }}
                          >
                            {t("post.update")}
                          </li>
                          <li
                            className="px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                            onClick={openCloseDeleteModel}
                          >
                            {t("post.delete")}
                          </li>
                          {deleteModel === true && (
                            <li className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
                              <div className="bg-white rounded-2xl overflow-hidden">
                                {/* <!-- Modal Header --> */}
                                <div className="bg-indigo-500 text-white px-6 py-3">
                                  <h2 className="text-2xl font-semibold">
                                    {t("post.deletecomment")}
                                  </h2>
                                </div>
                                {/* <!-- Modal Body --> */}
                                <div className="p-6 text-2xl text-slate-700">
                                  <p>{t("post.deleteconf")}</p>
                                </div>
                                {/* <!-- Modal Footer --> */}
                                <div className="border-t px-6 py-3 flex justify-end gap-4">
                                  <button
                                    onClick={() => {
                                      toggleDropDownList(0);
                                      openCloseDeleteModel();
                                    }}
                                    className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xl rounded-xl transition-colors duration-200"
                                  >
                                    {t("post.cancel")}
                                  </button>
                                  <button
                                    onClick={() => {
                                      toggleDropDownList(0);
                                      handleDeleteCommment(ele.id);
                                      openCloseDeleteModel();
                                    }}
                                    className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xl rounded-xl transition-colors duration-200"
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
        <div className="text-slate-400 text-3xl text-center my-4">
          {t("post.firstcomment")}
        </div>
      )}
    </div>
  );
}

export default Post;
