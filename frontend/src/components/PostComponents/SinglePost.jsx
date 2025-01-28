import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import AllPosts from "./AllPosts";
import Loading from "../Extensions/Loading";


function SinglePost() {
  const { id } = useParams(); // Get the post ID from the URL
  const [post, setPost] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPost();
  }, []);

  const getPost = async () => {
    setLoading(true);
    await api
      .get(`/api/post/${id}/`) // Fetch the specific post by ID
      .then((res) => res.data)
      .then((data) => {
        setPost(data);
      })
      .catch((err) => alert(err))
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="w-full">
      {loading && <Loading />}
      <div className="flex justify-center mt-12">
        <div className="mx-2 sm:w-full flex flex-col items-center">
          {post && (
            <AllPosts
              post={post}
              showDetails={true}
              OnPostDeleted={() => {
                navigate("/");
              }}
            /> // Show the post with details
          )}
        </div>
      </div>
    </div>
  );
}

export default SinglePost;
