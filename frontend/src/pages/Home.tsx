import React, { useRef } from "react";
import { useEffect, useState } from "react";
import api from "../api";
import AllPosts from "../components/PostComponents/AllPosts";
import Loading from "../components/Extensions/Loading";
import { useTranslation } from "react-i18next";
import { Music, Video, Image, CircleX } from "lucide-react";
import { useUser } from '../Contexts/Usercontext'
import { contentDisplay } from "../services/Utilities";
import { FilePreview, Post } from '../types/types'
import { useFileUpload } from '../customhooks/useFileUpload'
import { FilePreviews } from "../components/FilePreviews";


function Home() {
  const currentUser = useUser();
  const [post, setPost] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState<string>("");
  const { filePreviews, handleUpload, deleteFile, updateFile, resetFiles } = useFileUpload();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Automatically adjust the height of the textarea based on its scroll height
    if (textareaRef.current && textareaRef.current.scrollHeight < 200) {
      textareaRef.current.style.height = "auto"; // Reset the height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set the height to the scrollHeight
    }

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
        setPost(data.reverse());
      })
      .catch((err) => alert(err))
      .finally(() => setLoading(false));
  };

  function handelCreatePost() {
    if (newPost !== "") {
      const formData = new FormData();
      let newPostID = "0";
      formData.append('content', newPost);

      api.post('api/post/', formData, {
        headers: { "Content-Type": "Multipart/form-data" },
      }).then(async (res) => {
        if (res.status == 201) {
          newPostID = res.data.id;
          for (const file of filePreviews) {
            const fileFormData = new FormData();
            fileFormData.append("file", file.file);
            fileFormData.append("post", newPostID);
            updateFile(file.id, { status: "Uploading" });
            await api.post("api/post/upload-file/", fileFormData, {
              headers: { "Content-Type": "Multipart/form-data" },
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const uploadingProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  updateFile(file.id, {
                    progress: uploadingProgress,
                    status: uploadingProgress > 99 ? "Processing" : "Uploading"
                  });
                }
              }
            }).then((res) => {
              if (res.status == 201) {
                updateFile(file.id, { status: "Success" });
              }

            }).catch((err) => {
              console.error("File upload failed", file.name, err);
              updateFile(file.id, { status: "Error" });
            })
          }
        }
      }).catch((err) => {
        console.error("Error", err);
      }).finally(() => {
        api
          .get(`/api/post/${newPostID}/`) // Fetch the specific post by ID
          .then((res) => setPost((prevState) => [res.data, ...prevState]))
          .catch((err) => alert(err)).finally(() => {
            resetFiles();
            setNewPost("");
          })
      });
    }
  }

  function handlePostInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const textAreaString = e.target.value;
    setNewPost(textAreaString);
    if (textareaRef.current) {
      if (contentDisplay(textAreaString)) {
        textareaRef.current.style.direction = "rtl"
      } else {
        textareaRef.current.style.direction = "ltr"
      }
    }
  }

  return (
    <div className="w-full">
      {loading && <Loading />}
      <div className="flex justify-center">
        <div className="mx-2 sm:w-full">
          <div className="bg-white rounded-lg drop-shadow-lg p-1 lg:p-2 mt-6 mx-auto lg:w-2/3">
            <div className="flex items-center lg:space-x-4 ">
              <div className="size-10 lg:size-15 rounded-full bg-gray-200 flex items-center justify-center">
                <img src={currentUser.profile_pic} alt="CurrentUserProfilePic" className="size-10 lg:size-15 rounded-full object-cover" />
              </div>
              <div className="flex-1">
                <textarea name="" id="" rows={1} placeholder={t("createPostModel.placeholder")} onChange={handlePostInput} ref={textareaRef} value={newPost}
                  className="resize-none text-xl w-full px-1 py-2 lg:px-4 lg:py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:placeholder:text-xl scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200"></textarea>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex">
                <button
                  onClick={() => handleUpload({ accept: 'image/*' })}
                  className="relative flex items-center space-x-2 px-1 lg:px-2 py-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Image className="size-6 lg:size-8" />
                  <span className="text-md lg:text-xl">Photo</span>
                </button>
                <button
                  onClick={() => handleUpload({ accept: 'video/*' })}
                  className="flex items-center space-x-2 px-1 lg:px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Video className="size-6 lg:size-8" />
                  <span className="text-md lg:text-xl">Video</span>
                </button>
                <button
                  onClick={() => handleUpload({ accept: 'audio/*' })}
                  className="flex items-center space-x-2 px-1 lg:px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Music className="size-6 lg:size-8" />
                  <span className="text-md lg:text-xl">Audio</span>
                </button>
              </div>
              <button onClick={handelCreatePost} className="bg-blue-600 text-white px-6 py-2 lg:px-8 lg:py-2 lg:text-xl rounded-full hover:bg-blue-700 transition-colors">
                {t("createPostModel.cpost")}
              </button>
            </div>
            <div className="flex items-center gap-4 overflow-x-auto max-w-[90vw] scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200">

              {filePreviews.map((file: FilePreview, index: React.Key | null | undefined) => (
                <FilePreviews
                  key={index}
                  file={file}
                  onDelete={() => index !== null && index !== undefined && deleteFile(index)}
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 