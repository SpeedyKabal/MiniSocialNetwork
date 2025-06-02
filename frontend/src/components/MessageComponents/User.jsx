import { IoCheckmarkDoneSharp, IoCheckmarkSharp } from "react-icons/io5";
import { useState, useEffect } from "react";
import api from "../../api";
import { useWebSocket } from "../../Contexts/WebSocketContext";
import { useUser } from "../../Contexts/Usercontext";
import { useTranslation } from "react-i18next";
import { formatTime } from "../../services/Utilities";

function User({ UserClicked, userInfos, lastReceivedMessage }) {
  const [users, setUsers] = useState([]);
  const [filtredUsers, setFiltredUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [loading, setLoading] = useState(false);
  const onlineSocket = useWebSocket();
  const currentUser = useUser();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (
      lastReceivedMessage &&
      lastReceivedMessage.userId &&
      lastReceivedMessage.lastMessage
    ) {
      const { userId, lastMessage } = lastReceivedMessage;
      setUsers((prevUsers) => {
        // Only update if we actually have users to update
        if (!prevUsers || prevUsers.length === 0) return prevUsers;

        // Find the user that needs updating
        const userExists = prevUsers.some((user) => user.id === userId);
        if (!userExists) return prevUsers;

        const updatedUsers = prevUsers.map((user) =>
          user.id === userId ? { ...user, last_message: lastMessage } : user
        );

        return sortUsers(updatedUsers);
      });
    }
  }, [lastReceivedMessage]);


  useEffect(() => {
    if (onlineSocket && onlineSocket.readyState == 1 && currentUser) {
      const handleWebSocketMessage = (e) => {
        const WebSocketObject = JSON.parse(e.data);
        if (
          WebSocketObject["command"] == "Online" &&
          WebSocketObject["user"] != currentUser.id
        ) {
          // Use functional update to ensure we have latest state
          setUsers((prevUsers) => {
            const updatedUsers = prevUsers.map((user) => {
              if (user.id === WebSocketObject["user"]) {
                return {
                  ...user,
                  isOnline: WebSocketObject["message"] == "isOnline",
                };
              }
              return user;
            });
            return sortUsers(updatedUsers);
          });
        }
      };

      onlineSocket.onmessage = handleWebSocketMessage;
      onlineSocket.addEventListener("message", handleWebSocketMessage);

      return () => {
        onlineSocket.removeEventListener("message", handleWebSocketMessage);
      };
    }
  }, [onlineSocket]); // Remove users from dependency array

  useEffect(() => {
    getAllUsers();
  }, []);

  const sortUsers = (users) => {
    return users.sort((a, b) => {
      // First sort by online status
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;

      // Then sort by last message date
      if (!a.last_message) return 1;
      if (!b.last_message) return -1;

      return (
        new Date(b.last_message.date_created) -
        new Date(a.last_message.date_created)
      );
    });
  };

  const getAllUsers = async () => {
    setLoading(true);
    await api
      .get(`/api/allusers/`)
      .then((res) => res.data)
      .then((data) => {
        if (data.length > 0) {
          setUsers(sortUsers(data));
          setFiltredUsers(sortUsers(data));
        }
      })
      .catch((err) => alert(err))
      .finally(() => setLoading(false));
  };

  const fetchMessages = (user, index) => {
    UserClicked(user.id, index);
    userInfos(user);
  };

  const searchUserInput = (e) => {
    const searchUserValue = e.target.value;
    setSearchUser(searchUserValue);
    if (searchUserValue.trim() === "") {
      setUsers(filtredUsers);
    } else {
      const newUsersList = [...users];
      const filtredUsers = newUsersList.filter(
        (u) =>
          u.first_name.toLowerCase().includes(searchUserValue.toLowerCase()) ||
          u.last_name.toLowerCase().includes(searchUserValue.toLowerCase())
      );
      setUsers(filtredUsers);
    }
  };

  return (
    <>
      {/* <!-- Search --> */}
      <div className="py-2 px-2 bg-grey-lightest">
        <input
          type="text"
          value={searchUser}
          onChange={searchUserInput}
          className="w-full px-2 py-2 text-sm outline-2 outline-slate-400 outline-double rounded-lg bg-white text-grey-darkest focus:outline-blue-500"
          placeholder={t("message.serachSelectPlacholder")}
        />
      </div>

      {/* <!-- Contacts --> */}
      <div className="bg-grey-lighter flex-1 overflow-y-auto min-h-0 rounded-xl shadow-sm">
        {loading && (
          <div className="flex flex-col gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-white px-3 flex items-center gap-5"
              >
                <div>
                  <div className="h-6 w-6 rounded-full animate-pulse bg-gray-300"></div>
                </div>
                <div className="flex w-full flex-col gap-5 py-4">
                  <div className="flex items-bottom justify-between animate-pulse bg-gray-300 w-full h-3"></div>
                  <div className="flex items-bottom justify-between animate-pulse bg-gray-300 w-full h-3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {users?.map((user, index) => (
          <div
            className={`px-3 flex items-center hover:bg-green-100 cursor-pointer ${user.last_message ? user.last_message.sender != currentUser.id && !user.last_message.is_read ? "bg-red-500/20 animate-pulse" : "bg-white" : "bg-white"}`}
            key={user.id}
            onClick={() => {
              fetchMessages(user, index);
            }}
          >
            <div>
              <img
                className="h-8 w-8 lg:h-10 lg:w-10 rounded-full"
                src={user?.profile_pic}
                alt="ProfilePhoto"
                loading="lazy"
              />
            </div>
            <div className="ml-4 flex-1 border-b-3 border-blue-200 py-1">
              <div className="flex items-bottom justify-between">
                <p className="text-grey-darkest text-md font-semibold">
                  {user?.last_name} {user?.first_name}
                </p>
                <p className="text-sm text-grey-darkest">
                  {user.last_message
                    ? formatTime(user.last_message.date_created, i18n.language)
                    : ""}
                </p>
              </div>
              <div className="flex">
                <p className="text-grey-dark mt-1 text-sm">
                  {user.last_message ? user.last_message.message : ""}
                </p>
                {user.last_message?.sender !== currentUser?.id && (
                  <p className="mt-auto text-lg">
                    {user.last_message ? (
                      user.last_message.is_read ? (
                        <span className="text-blue-500">
                          <IoCheckmarkDoneSharp />
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          <IoCheckmarkSharp />
                        </span>
                      )
                    ) : (
                      ""
                    )}
                  </p>
                )}
              </div>
            </div>
            <div
              className={`${user.isOnline ? "bg-green-500 animate-pulse" : "bg-slate-500"
                }  w-3 h-3 rounded-full mx-2`}
            ></div>
          </div>
        ))}
      </div>
    </>
  );
}

export default User;
