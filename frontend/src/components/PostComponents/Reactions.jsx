import { useEffect, useState } from "react";
import api from "../../api";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useUser } from "../../Contexts/Usercontext";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

function Reactions({ post_id }) {
  const currentUser = useUser();
  const [reactions, setReactions] = useState({ Likes: 0, Dislikes: 0 }); // This count All reaction by all users to the post
  const [userReactions, setUserReactions] = useState(null); // This Hold The Reaction of Actual user to the post
  const [allReactions, setAllReactions] = useState([]); // This Hold All Reactions of All Users to the post
  const [showUsersReactions, setShowUsersReactions] = useState([]); // This show the model of All Reactions of All Users to the post
  const { t } = useTranslation();

  useEffect(() => {
    fetchReactions();
  }, []);

  const fetchReactions = async () => {
    try {
      const response = await api.get(`/api/post/reaction/?post_id=${post_id}`);
      const data = response.data;
      setAllReactions(data);
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

  const handleReaction = async (reactionType) => {
    let updateReaction = { ...reactions };
    let newUserReaction = reactionType;

    if (userReactions == reactionType) {
      // User click on the Same Reaction , Delete Reaction
      await api
        .delete("/api/post/reaction/destroy/", { data: { post_id: post_id } })
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
            post: post_id,
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
        postData.append("post", post_id);
        postData.append("reaction", reactionType);

        await api
          .post("api/post/reaction/create/", postData)
          .catch((err) => alert(err));
      }
    }
    setReactions(updateReaction);
    setUserReactions(newUserReaction);
  };

  const showReactions = (reactionType) => {
    setShowUsersReactions(allReactions.filter((ele) => ele.reaction == reactionType));
  };

  return (
    <div className="post-actions flex justify-between">
      <div className="flex flex-col items-center gap-2 m-4" >
        <button
          onClick={() => handleReaction("Like")}
          className={classNames("px-5 cursor-pointer", {
            "text-green-500": userReactions == "Like",
            "text-sky-900 hover:text-green-500": userReactions != "Like",
          })}
        >
          <ThumbsUp size={40} />
        </button>
        <button className="text-sky-900 text-xl" onClick={() => showReactions("Like")}>{reactions.Likes}</button>
      </div>
      <div className="flex flex-col items-center gap-2 m-4" >
        <button
          onClick={() => handleReaction("Dislike")}
          className={classNames("px-5 cursor-pointer", {
            "text-red-500": userReactions == "Dislike",
            "text-sky-900 hover:text-red-500": userReactions != "Dislike",
          })}
        >
          <ThumbsDown size={40} />
        </button>
        <button className="text-sky-900 text-xl" onClick={() => showReactions("Dislike")}>{reactions.Dislikes}</button>
      </div>
      {showUsersReactions.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg drop-shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-sky-900">User that reacted</h2>
              <button
                onClick={() => setShowUsersReactions([])}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {showUsersReactions.map((reaction, index) => (
                <div key={index} className="py-2 border-b border-gray-200 last:border-0">
                  <p className="text-sky-900 text-lg">{reaction.user.last_name} {reaction.user.first_name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reactions;
