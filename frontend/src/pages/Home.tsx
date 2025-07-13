import React, { useRef, useContext } from "react";
import { useEffect, useState } from "react";
import api from "../api";
import AllPosts from "../components/PostComponents/AllPosts";
import Loading from "../components/Extensions/Loading";
import { useTranslation } from "react-i18next";
import { Music, Video, Image } from "lucide-react";
import { useUser } from "../Contexts/Usercontext";
import { useWebSocket } from "../Contexts/WebSocketContext";
import { contentDisplay, adjustTextareaHeight } from "../services/Utilities";
import { FilePreview, Post, Utilisateur } from "../types/types";
import { useFileUpload } from "../customhooks/useFileUpload";
import { FilePreviews } from "../components/FilePreviews";
import Weather from "../components/HomeComponents/Weather";

function Home() {
  const currentUser = useUser() as Utilisateur | null;
  const [post, setPost] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState<string>("");
  const { filePreviews, handleUpload, deleteFile, updateFile, resetFiles } =
    useFileUpload();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [noMorePosts, setNoMorePosts] = useState(false);
  const onlineSocket = useWebSocket(); // This hold Websocket Context
  const { t } = useTranslation();

  useEffect(() => {
    if (onlineSocket && onlineSocket.readyState === WebSocket.OPEN) {
      onlineSocket.onmessage = (e: { data: string }) => {
        const WebSocketObject = JSON.parse(e.data);
        if (WebSocketObject["command"] === "ffmpegProgress") {
          updateFile(WebSocketObject["fileid"], {
            progressProcessing: Math.floor(WebSocketObject["progress"]),
          });
        }
      };
    }
  }, [onlineSocket]);

  useEffect(() => {
    adjustTextareaHeight(textareaRef);
  }, [newPost]);

  useEffect(() => {
    getPost();
  }, []);

  const getPost = async () => {
    setLoading(true);
    await api
      .get("/api/post/")
      .then((res) => res.data)
      .then((data) => {
        setPost(data);
      })
      .catch((err) => alert(err))
      .finally(() => setLoading(false));
  };

  const getPrevieusPosts = async () => {
    setLoading(true);
    const lastPostDate =
      post.length > 0 ? post[post.length - 1].created_at : null;
    await api
      .get("/api/post/previous/", { params: { date: lastPostDate } })
      .then((res) => res.data)
      .then((data) => {
        if (data.length > 0) {
          setPost((prevState) => [...prevState, ...data]);
        } else {
          setNoMorePosts(true);
        }
      })
      .catch((err) => alert(err))
      .finally(() => setLoading(false));
  };

  function handelCreatePost() {
    if (newPost !== "") {
      const formData = new FormData();
      let newPostID = "0";
      formData.append("content", newPost);

      api
        .post("api/post/", formData, {
          headers: { "Content-Type": "Multipart/form-data" },
        })
        .then(async (res) => {
          if (res.status == 201) {
            newPostID = res.data.id;
            for (const file of filePreviews) {
              const fileFormData = new FormData();
              fileFormData.append("file", file.file);
              fileFormData.append("post", newPostID);
              updateFile(file.id, { status: "Uploading" });
              await api
                .post("api/post/upload-file/", fileFormData, {
                  headers: { "Content-Type": "Multipart/form-data" },
                  onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                      const uploadingProgress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                      );
                      updateFile(file.id, {
                        progress: uploadingProgress,
                        status:
                          uploadingProgress > 99 ? "Processing" : "Uploading",
                      });
                    }
                  },
                })
                .then(async (res) => {
                  if (res.status == 201) {
                    const fileId = res.data.id;
                    if (file.type == "video") {
                      await api.post(
                        `api/post/process-video/${fileId}/${file.id}/`
                      );
                    } else {
                      updateFile(file.id, { status: "Success" });
                    }
                  }
                })
                .catch((err) => {
                  console.error("File upload failed", file.name, err);
                  updateFile(file.id, { status: "Error" });
                });
            }
          }
        })
        .catch((err) => {
          console.error("Error", err);
        })
        .finally(() => {
          api
            .get(`/api/post/${newPostID}/`) // Fetch the specific post by ID
            .then((res) => setPost((prevState) => [res.data, ...prevState]))
            .catch((err) => alert(err))
            .finally(() => {
              resetFiles();
              setNewPost("");
            });
        });
    }
  }

  function handlePostInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const textAreaString = e.target.value;
    setNewPost(textAreaString);
    if (textareaRef.current) {
      if (contentDisplay(textAreaString)) {
        textareaRef.current.style.direction = "rtl";
      } else {
        textareaRef.current.style.direction = "ltr";
      }
    }
  }

  return (
    <div className="w-full relative">
      {loading && <Loading />}
      <Weather />
      <div className="flex justify-center">
        <div className="mx-2 sm:w-full">
          <div className="bg-white rounded-lg drop-shadow-lg p-1 lg:p-2 mt-6 mx-auto lg:w-2/3">
            <div className="flex items-center lg:space-x-4 ">
              <div className="size-10 lg:size-15 rounded-full bg-gray-200 flex items-center justify-center">
                <img
                  src={currentUser?.profile_pic}
                  alt="CurrentUserProfilePic"
                  className="size-10 lg:size-15 rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <textarea
                  name=""
                  id=""
                  rows={1}
                  placeholder={t("createPostModel.placeholder")}
                  onChange={handlePostInput}
                  ref={textareaRef}
                  value={newPost}
                  className="resize-none text-xl w-full px-1 py-2 lg:px-4 lg:py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:placeholder:text-xl"
                ></textarea>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex">
                <button
                  onClick={() => handleUpload({ accept: "image/*" })}
                  className="relative flex items-center space-x-2 px-1 lg:px-2 py-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Image className="size-6 lg:size-8" />
                  <span className="text-md lg:text-xl">{t("home.photo")}</span>
                </button>
                <button
                  onClick={() => handleUpload({ accept: "video/*" })}
                  className="flex items-center space-x-2 px-1 lg:px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Video className="size-6 lg:size-8" />
                  <span className="text-md lg:text-xl">{t("home.video")}</span>
                </button>
                <button
                  onClick={() => handleUpload({ accept: "audio/*", capture: "microphone" })}
                  className="flex items-center space-x-2 px-1 lg:px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Music className="size-6 lg:size-8" />
                  <span className="text-md lg:text-xl">{t("home.audio")}</span>
                </button>
              </div>
              <button
                onClick={handelCreatePost}
                className="bg-blue-600 text-white px-6 py-2 lg:px-8 lg:py-2 lg:text-xl rounded-full hover:bg-blue-700 transition-colors"
              >
                {t("createPostModel.cpost")}
              </button>
            </div>
            <div className="flex items-center gap-4 overflow-x-auto max-w-[90vw]">
              {filePreviews.map((file: FilePreview, index: number) => (
                <FilePreviews
                  key={index}
                  file={file}
                  onDelete={() =>
                    index !== null && index !== undefined && deleteFile(index)
                  }
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-black text-[2rem] text-center my-2">
              {t("home.postPage")}
            </h2>
            {post.map((post) => (
              <AllPosts key={post.id} post={post} OnPostDeleted={getPost} />
            ))}

            {noMorePosts ? (
              <span className="text-sm font-semibold bg-sky-50/60 italic text-red-500 rounded-lg py-1 px-6 my-2">
                {t("home.NoMore")}
              </span>
            ) : (
              <button
                onClick={getPrevieusPosts}
                className="bg-blue-600 text-white px-6 py-2 lg:px-8 lg:py-2 lg:text-xl rounded-full hover:bg-blue-700 transition-colors mx-4 my-2"
              >
                {t("home.loadMore")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
