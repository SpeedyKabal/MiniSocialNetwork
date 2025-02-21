import api from "../api";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { IoCheckmarkSharp } from "react-icons/io5";
import { MdAttachFile } from "react-icons/md";
import WebSocketInstance from "../services/WebSocketService";
import Loading from "../components/Extensions/Loading";
import { useTranslation } from "react-i18next";
import { useUser } from "../Contexts/Usercontext";
import { useWebSocket } from "../Contexts/WebSocketContext";
import User from "../components/MessageComponents/User";
import {
  formatTime,
  convertLinksInsideMessages,
  contentDisplay,
} from "../services/Utilities";
import Media from "../components/PostComponents/Media";
import { useFileUpload } from "../CustomHooks/useFileUpload";
import { FilePreviews } from "../components/FilePreviews";

const chatWebSocketUrl = import.meta.env.VITE_CHAT_WS_URL;

const Messages = () => {
  const currentUser = useUser(); // This hold Current User infos
  const onlineSocket = useWebSocket(); // This hold Websocket Context
  const { t, i18n } = useTranslation(); // this for translation
  const [user, setUser] = useState(null); // This hold clicked user infos
  const [lastRecievedMessage, setLastRecievedMessage] = useState(null); // This hold the last message received or sent from the clicked user
  const [messages, setMessages] = useState([]); // This hold Messages between Current User and The clicked User
  const [showInput, setShowInput] = useState(null); // This hold the Clicked User ID
  const [messageInput, setMessageInput] = useState(""); // This hold the text tosend as a Message
  const [roomName, setRoomName] = useState(null); //This hold the ID of Websocket for RealTime chatting
  const { filePreviews, handleUpload, deleteFile, updateFile, resetFiles } =
    useFileUpload(); //This Hold The files that current user want to send
  const [loading, setLoading] = useState(false); //This for showing Loading component
  const [socketMessages, setsocketMessages] = useState([]); // This hold Messages between Current User and The clicked User on Websocket RealTime chatting
  const messagesEndRef = useRef(null); //This the last div in Messages container
  const [contacts, setContacts] = useState(false); //Used in Mobile views Either show User or Show Messages
  const [noMoreMessages, setNoMoreMessages] = useState(false); //This for showing "More Messages" Button
  const newMessageAudio = new Audio("/Sounds/newmessage.mp3");
  const textareaRef = useRef(null);

  // Start a Websocket Channel for Two Users
  useEffect(() => {
    if (roomName) {
      WebSocketInstance.connect(chatWebSocketUrl, roomName);

      WebSocketInstance.addCallback(
        "chat_message",
        handleReceivedSocketMessages
      );

      // Cleanup on component unmount

      return () => {
        WebSocketInstance.socketRef.close();
      };
    }
  }, [roomName]);

  useEffect(() => {
    if (onlineSocket.readyState == WebSocket.OPEN && currentUser) {
      onlineSocket.onmessage = (e) => {
        const WebSocketObject = JSON.parse(e.data);
        if (
          WebSocketObject["command"] == "SendMessage" &&
          WebSocketObject["reciever"] == currentUser.id
        ) {
          newMessageAudio.play().catch((error) => {
            console.error("Audio playback failed:", error);
          });
        }
      };
    }
  }, [onlineSocket]);

  useEffect(() => {
    // Automatically adjust the height of the textarea based on its scroll height
    if (textareaRef.current && textareaRef.current.scrollHeight < 200) {
      textareaRef.current.style.height = "auto"; // Reset the height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set the height to the scrollHeight
    }
  }, [messageInput]);

  const handleReceivedSocketMessages = (data) => {
    setsocketMessages((prevMessages) => {
      const newMessages = [...prevMessages, data];
      return newMessages;
    });
    const lastMessage = {
      is_read: false,
      sender: data.sender_id,
      message: data.message,
      date_created: new Date().toISOString(),
    };

    setLastRecievedMessage({
      userId:
        data.sender_id == currentUser.id ? data.receiver_id : data.sender_id,
      lastMessage: lastMessage,
    });
    scrollToBottom();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (user) {
      const messageContent = new FormData();
      messageContent.append("reciever_id", user.id);
      let newMessageid = 0;
      if (messageInput.trim() === "") {
        alert("Message Vide !!");
        return;
      } else {
        messageContent.append("message", messageInput);
      }
      await api
        .post("api/message/create/", messageContent)
        .then(async (res) => {
          if (res.status === 201) {
            newMessageid = res.data.id;
            for (const file of filePreviews) {
              const fileFormData = new FormData();
              fileFormData.append("file", file.file);
              fileFormData.append("message_id", newMessageid);
              updateFile(file.id, { status: "Uploading" });
              await api
                .post("api/message/upload-file/", fileFormData, {
                  headers: { "Content-Type": "multipart/form-data" },
                  onUploadProgress: (pregressEvent) => {
                    if (pregressEvent.total) {
                      const uploadingProgress = Math.round(
                        (pregressEvent.loaded * 100) / pregressEvent.total
                      );
                      updateFile(file.id, {
                        progress: uploadingProgress,
                        status:
                          uploadingProgress > 99 ? "Processing" : "Uploading",
                      });
                    }
                  },
                })
                .then((res) => {
                  if (res.status == 201) {
                    updateFile(file.id, { status: "Success" });
                  }
                })
                .catch((err) => {
                  console.error("File upload failed", file.name, err);
                  updateFile(file.id, { status: "Error" });
                });
            }
            const messageContentforWebSocket = {
              sender_id: currentUser?.id,
              receiver_id: res.data.reciever.id,
              message_id: res.data.id,
            };
            WebSocketInstance.sendaMessage(messageContentforWebSocket);
          }
          if (onlineSocket.readyState === WebSocket.OPEN) {
            onlineSocket.send(
              JSON.stringify({
                command: "SendMessage",
                sender: currentUser.id,
                reciever: res.data.reciever.id,
                message: res.data.message,
              })
            );
          }
        })
        .catch((err) => {
          alert(err);
        })
        .finally(() => {
          setMessageInput("");
          resetFiles();
          setLoading(false);
        });
    } else {
      alert("Message Content not Valid !!");
    }
  };

  const fetchMessages = (senderID, index) => {
    setNoMoreMessages(false);
    setMessages([]);
    setsocketMessages([]);
    setContacts(true);

    // Generate storage key for this conversation
    const storageKey = `chat_messages_${currentUser?.id}_${senderID}`;

    // Check local storage first
    const storedMessages = localStorage.getItem(storageKey);
    let lastMessageDate = null;
    const unreadMessages = [];

    if (storedMessages) {
      const parsedMessages = JSON.parse(storedMessages);

      const readMessages = parsedMessages.filter((msg) => msg.is_read);
      const unreadMessages = parsedMessages.filter((msg) => !msg.is_read);
      setMessages(readMessages);

      // Get date of most recent message
      if (parsedMessages.length > 0) {
        lastMessageDate =
          parsedMessages[parsedMessages.length - 1].date_created;
      }
    }

    // Fetch any new messages since last stored message
    api
      .get("/api/message/fetsh/", {
        params: {
          sender: senderID,
          reciever: currentUser?.id,
          last_message_date: lastMessageDate, // Last Message Date
          unread_ids: unreadMessages, // Unread Messages IDs
        },
      })
      .then((res) => res.data)
      .then((data) => {
        if (data.length > 0 || unreadMessages.length > 0) {
          // Get currently stored read messages
          const storedReadMessages = storedMessages
            ? JSON.parse(storedMessages).filter((msg) => msg.is_read)
            : [];
          // Merge new messages with stored messages
          const updatedMessages = [...storedReadMessages, ...data]
            .sort((a, b) => new Date(a.date_created) - new Date(b.date_created))
            .slice(-10);

          setMessages(updatedMessages);

          // Update local storage
          if (updatedMessages.length > 0) {
            const messagesToStore = updatedMessages.filter(
              (msg) => msg.is_read
            );
            localStorage.setItem(storageKey, JSON.stringify(messagesToStore));
          }
        }
      })
      .catch((err) => alert(err))
      .finally(() => {
        setShowInput(senderID);
        if (currentUser?.id > senderID) {
          setRoomName(currentUser?.id + "" + senderID);
        } else {
          setRoomName(senderID + "" + currentUser?.id);
        }
        setContacts(true);
        scrollToBottom();
      });

    if (
      onlineSocket &&
      onlineSocket.readyState == WebSocket.OPEN &&
      currentUser
    ) {
      try {
        onlineSocket.send(
          JSON.stringify({
            command: "ReadMessages",
            user: currentUser?.id,
            sender: senderID,
          })
        );
      } catch (e) {
        console.error(e);
      }
    }
  };

  const loadPreviousMessages = async (messageId, senderId, receiverId) => {
    try {
      const response = await api.get("/api/message/previous/", {
        params: {
          message_id: messageId,
          sender_id: senderId,
          receiver_id: receiverId,
        },
      });

      const previousMessages = response.data;

      if (previousMessages.length > 0) {
        setMessages((prevMessages) => {
          const combinedMessages = [...previousMessages, ...prevMessages].sort(
            (a, b) => new Date(a.date_created) - new Date(b.date_created)
          );
          return combinedMessages;
        });
      } else {
        setNoMoreMessages(true);
      }
    } catch (err) {
      console.error("Error loading previous messages:", err);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 500);
    }
  };

  return (
    <div className="flex flex-col mb-4">
      {loading === true && <Loading />}

      <div className="flex justify-center">
        <div className="py-2 w-[90vw] h-[90vh]">
          <div className="flex border-1 border-blue-200 rounded drop-shadow-lg h-full">
            {/* <!-- Left --> */}
            <div
              className={`lg:w-1/3 ${!contacts ? "w-full" : "w-0"
                }  border-1 border-blue-200 flex flex-col overflow-scroll`}
            >
              <User
                UserClicked={fetchMessages}
                userInfos={setUser}
                lastReceivedMessage={lastRecievedMessage}
              />
            </div>

            {/* <!-- Right --> */}
            <div
              className={`lg:w-3/4 ${contacts ? "w-full" : "w-0"
                } flex flex-col border-1 border-blue-200`}
            >
              {/* <!-- Header --> */}
              <div className="py-1 px-3 bg-grey-lighter flex flex-row justify-stretch items-center">
                <div className="flex lg:hidden">
                  <div className="ml-6">
                    <span
                      className=" text-[2rem] m-1 flex -scale-x-100 bg-indigo-500 text-white text-center animate-pulse rounded-full"
                      title="Back To Users"
                      onClick={() => {
                        setContacts(false);
                        setUser(null);
                        setMessages([]);
                        setRoomName(null);
                      }}
                    >
                      <IoIosArrowForward />
                    </span>
                  </div>
                </div>

                {user ? (
                  <div className="flex items-center">
                    <div>
                      <img
                        className={`w-10 h-10 rounded-full ${contacts ? "ml-2" : ""
                          }`}
                        src={user?.profile_pic}
                      />
                    </div>
                    <div className="ml-4">
                      <Link
                        to={`/profile/${user.username}`}
                        className="text-grey-darkest text-md font-bold cursor-pointer"
                      >
                        {user.first_name} {user.last_name}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <span className="text-grey-darkest text-md font-bold italic text-center w-full">
                    {t("message.noUserSelected")}
                  </span>
                )}
              </div>

              {/* <!-- Messages --> */}
              <div className="flex-1 bg-[#DAD3CC] overflow-y-scroll">
                <div className="flex justify-center py-2">
                  {user &&
                    (noMoreMessages ? (
                      <p className="text-sm font-semibold bg-sky-50/60 italic text-red-500 rounded-lg py-1 px-6">
                        {t("message.noMoreMessages")}
                      </p>
                    ) : (
                      <button
                        className="bg-indigo-500 hover:bg-green-600 text-white text-md font-bold py-1 px-6 rounded-3xl"
                        onClick={() =>
                          loadPreviousMessages(
                            messages[0].id,
                            currentUser?.id,
                            showInput
                          )
                        }
                      >
                        {t("message.moreMessages")}
                      </button>
                    ))}
                </div>
                <div className="py-2 px-3">
                  {messages?.map((message, index) => (
                    <div key={index} className="w-full flex flex-col">
                      {message.sender.id === currentUser?.id ? (
                        <div className="flex mb-2 mr-[25%]">
                          <div className="rounded py-1 px-1 bg-[#F2F2F2] max-w-3/4">
                            <p className="text-teal text-md font-semibold">
                              {t("home.you")}
                            </p>
                            <p
                              className="text-md mt-1 ml-2 whitespace-pre-line"
                              dir={
                                contentDisplay(message.message) ? "rtl" : "ltr"
                              }
                            >
                              {convertLinksInsideMessages(message.message)}
                            </p>
                            {message.mediaFiles && (
                              <Media urlFile={message.mediaFiles} />
                            )}

                            <p className="text-right text-sm text-grey-dark mt-1">
                              {formatTime(message.date_created, i18n.language)}
                            </p>
                          </div>
                          {message.is_read === true ? (
                            <p className="mt-auto text-md text-blue-500">
                              <IoCheckmarkDoneSharp />
                            </p>
                          ) : (
                            <p className="mt-auto text-md text-gray-500">
                              <IoCheckmarkSharp />
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-end mb-2 ml-[25%]">
                          {message.is_read === true ? (
                            <p className="mt-auto text-md text-blue-500">
                              <IoCheckmarkDoneSharp />
                            </p>
                          ) : (
                            <p className="mt-auto text-md text-gray-500">
                              <IoCheckmarkSharp />
                            </p>
                          )}
                          <div className="rounded py-2 px-3 bg-[#E2F7CB]">
                            <p className="text-teal text-md font-semibold">
                              {message.sender.first_name}{" "}
                              {message.sender.last_name}
                            </p>
                            <p
                              className="text-md mt-1 ml-2 whitespace-pre-line"
                              dir={
                                contentDisplay(message.message) ? "rtl" : "ltr"
                              }
                            >
                              {convertLinksInsideMessages(message.message)}
                            </p>
                            {message.mediaFiles && (
                              <Media urlFile={message.mediaFiles} />
                            )}

                            <p className="text-right text-sm text-grey-dark mt-1">
                              {formatTime(message.date_created, i18n.language)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {socketMessages.map((ele, actualindex) => (
                    <div key={actualindex}>
                      {ele.sender_id === currentUser?.id && user !== null ? (
                        <div className="flex mb-2">
                          <div className="rounded py-2 px-3 bg-[#F2F2F2]">
                            <p className="text-teal text-md font-semibold">
                              {t("home.you")}
                            </p>
                            <p
                              className="text-md mt-1 ml-2 whitespace-pre-line"
                              dir={
                                ele.message && contentDisplay(ele.message)
                                  ? "rtl"
                                  : "ltr"
                              }
                            >
                              {ele.message &&
                                convertLinksInsideMessages(ele.message)}
                            </p>
                            {ele.mediaFiles && (
                              <Media urlFile={ele.mediaFiles} />
                            )}
                            <p className="text-right text-sm text-grey-dark mt-1">
                              {formatTime(ele.dateMessage, i18n.language)}
                            </p>
                          </div>
                          {ele.is_read === true ? (
                            <p className="mt-auto text-md text-blue-500">
                              <IoCheckmarkDoneSharp />
                            </p>
                          ) : (
                            <p className="mt-auto text-md text-gray-500">
                              <IoCheckmarkSharp />
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-end mb-2">
                          {ele.is_read === true ? (
                            <p className="mt-auto text-md text-blue-500">
                              <IoCheckmarkDoneSharp />
                            </p>
                          ) : (
                            <p className="mt-auto text-md text-gray-500">
                              <IoCheckmarkSharp />
                            </p>
                          )}
                          <div className="rounded py-2 px-3 bg-[#E2F7CB]">
                            <p className="text-teal text-md font-semibold">
                              {user.first_name} {user.last_name}
                            </p>
                            <p
                              className="text-md mt-1 ml-2 whitespace-pre-line"
                              dir={contentDisplay(ele.message) ? "rtl" : "ltr"}
                            >
                              {ele.message &&
                                convertLinksInsideMessages(ele.message)}
                            </p>
                            {ele.mediaFiles && (
                              <Media urlFile={ele.mediaFiles} />
                            )}
                            <p className="text-right text-sm text-grey-dark mt-1">
                              {formatTime(ele.dateMessage, i18n.language)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className=" h-5" ref={messagesEndRef}></div>
                </div>
              </div>

              {/* <!-- Input --> */}

              {user !== null && (
                <form
                  onSubmit={sendMessage}
                  className="relative w-full "
                  encType="multipart/form-data"
                >
                  <div className="bg-grey-lighter px-2 py-2 ">
                    <div className="mx-2 flex items-center">
                      <textarea
                        name=""
                        id=""
                        rows={1}
                        placeholder={t("createPostModel.placeholder")}
                        onChange={(e) => {
                          setMessageInput(e.target.value);
                        }}
                        ref={textareaRef}
                        value={messageInput}
                        className="resize-none w-full border-2 border-blue-200 rounded px-2 py-1 text-md"
                      ></textarea>
                      <label
                        htmlFor="inputFile"
                        onClick={handleUpload}
                        className="cursor-pointer hover:bg-green-500  bg-blue-500 size-[2rem] mx-1 flex justify-center items-center"
                      >
                        <span
                          title="Click to Add a File"
                          className="text-[2rem] text-white"
                        >
                          <MdAttachFile />
                        </span>
                      </label>
                      <div className="absolute -top-32 left-0 flex rounded-lg gap-2 px-2 max-w-2/3 bg-slate-500/80 overflow-auto z-20">
                        {filePreviews.map((file, index) => (
                          <FilePreviews
                            key={index}
                            file={file}
                            onDelete={() => deleteFile(index)}
                          />
                        ))}
                      </div>

                      <button
                        type="submit"
                        title="Click to Send Message"
                        className="bg-blue-500 text-white hover:bg-green-500 text-[2rem]"
                        disabled={messageInput.trim() === ""}
                      >
                        <IoIosArrowForward />
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
