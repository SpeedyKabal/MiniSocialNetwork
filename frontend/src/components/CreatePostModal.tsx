// CreatePostModal.jsx
import React from "react";
import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import api from "../api";
import { useCreatePost } from "./CreatePostContext";
import { useTranslation } from "react-i18next";

type CreatePostModalProps = {
  onPostCreated?: () => void;
};

const CreatePostModal : React.FC<CreatePostModalProps> = ({ onPostCreated }) => {
  const { isCreatePostVisible, toggleCreatePost } = useCreatePost();
  const [content, setContent] = useState<string>("");
  const [media, setMedia] = useState<File | null>(null);
  const { t } = useTranslation();
  const [progress, setProgress] = useState<number>(0);
  const [shareButton, setShareButton] = useState<boolean>(false);
  const cancelSourceRef = useRef<AbortController | null>(null);

  const handleMediaChange = (e : ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]){
      setMedia(e.target.files[0]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event : KeyboardEvent) => {
      if (event.key === "Escape") {
        toggleCreatePost(false);
      }
    };

    if (isCreatePostVisible) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      setContent("");
      setMedia(null);
      window.removeEventListener("keydown", handleKeyDown);
    }

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCreatePostVisible]);

  const createPost = (e : FormEvent) => {
    e.preventDefault();
    setShareButton(true);
    cancelSourceRef.current = new AbortController();

    const formData = new FormData();
    formData.append("content", content);
    if (media) {
      if (media.type.startsWith("image/")) {
        formData.append("image", media);
      } else if (media.type.startsWith("video/")) {
        formData.append("video", media);
      } else if (media.type.startsWith("audio/")) {
        formData.append("audio", media);
      }
    }

    api
      .post("api/post/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        signal: cancelSourceRef.current.signal,
        onUploadProgress: (progressEvent) => {
          if(progressEvent.total){
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      })
      .then((res) => {
        if (res.status === 201) {
          setContent("");
          setMedia(null);
          if (onPostCreated) {
            onPostCreated();
          }
          toggleCreatePost(); // Hide CreatePost div
        } else {
          alert("Failed to create Post !!");
        }
      })
      .catch((err) => {
        console.log(err);
        alert(err);
      })
      .finally(() => {
        setShareButton(false);
        setProgress(0);
      });
  };

  const cancelPost = () => {
    if (cancelSourceRef.current) {
      cancelSourceRef.current.abort();
      setShareButton(false); // Ensure share button state is reset

      setProgress(0);
    }
    toggleCreatePost(false);
  };

  if (!isCreatePostVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center flex-col z-10 top-0 left-0 w-screen h-[100vh] bg-black/80">
      <div className="w-screen md:w-[600px] px-4 h-auto border-2 border-white border-solid flex flex-col bg-cyan-700">
        <div className="text-white text-6xl text-center my-8">
          {t("createPostModel.cpost")}
        </div>
        <div>
          <form
            onSubmit={createPost}
            className="flex flex-col items-center"
            encType="multipart/form-data"
          >
            <label htmlFor="content" className="text-white text-3xl my-3">
              {t("createPostModel.content")}
            </label>
            <textarea
              className="resize-none w-[350px] md:w-[550px] mx-5 h-[100px] px-3 text-2xl rounded-lg border-1 border-slate-400 border-solid"
              rows={4}
              name="content"
              id="content"
              required
              onChange={(e) => setContent(e.target.value)}
              value={content}
              placeholder={t("createPostModel.placeholder")}
            ></textarea>
            <input
              type="file"
              name="media"
              id="media"
              capture="environment"
              accept="image/png, image/jpeg, image/jpg, video/*, audio/*"
              onChange={handleMediaChange}
              className="bg-blue-300 hover:bg-indigo-200 p-4 m-5 text-white text-2xl w-[350px] md:w-[550px] border-y-2 border-green-600/15 hover:border-blue-500/15 rounded-md"
            />
            {progress > 0 && (
              <div className="relative w-[350px] md:w-[550px] bg-white h-10 rounded-full py-1">
                <div
                  className="absolute top-0 left-0 bg-blue-300 h-10 rounded-full text-right py-2 text-green-900"
                  style={{ width: `${progress}%` }}
                >
                  {progress}%
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                const mediaInput = document.getElementById("media") as HTMLInputElement | null;
                if(mediaInput){
                  mediaInput.click();
                } 
              }}
              className="bg-blue-500 text-white text-2xl px-4 py-2 rounded-lg m-2 hover:bg-indigo-200 disabled:bg-slate-600"
              disabled={shareButton}
            >
              {t("createPostModel.camera")}
            </button>
            <div className="flex">
              <button
                type="submit"
                className="text-center text-green-100 bg-indigo-500 hover:bg-indigo-200 text-3xl px-8 py-4 rounded-lg my-8 mx-5 disabled:bg-slate-600"
                disabled={shareButton}
              >
                {t("createPostModel.ppost")}
              </button>
              <button
                type="button"
                className="text-center text-green-100 bg-slate-500 hover:bg-indigo-200 text-3xl px-8 py-4 rounded-lg my-8  mx-5"
                onClick={cancelPost}
              >
                {t("post.cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
