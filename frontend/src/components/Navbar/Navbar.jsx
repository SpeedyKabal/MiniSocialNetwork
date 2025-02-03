import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import { useUser } from "../../Contexts/Usercontext";
import { useWebSocket } from "../../Contexts/WebSocketContext";
import "i18next";
import { useTranslation } from "react-i18next";
import { Home, Bell, MessageSquare, Search } from "lucide-react";
import UserDropdown from "./UserDropdown";

const Navbar = () => {
  const currentUser = useUser();
  const onlineSocket = useWebSocket(); // This hold Websocket Context
  const [userDropdown, setUserDropdown] = useState(false);
  const { t, i18n } = useTranslation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const lngs = {
    en: { nativeName: "EN" },
    fr: { nativeName: "FR" },
    ar: { nativeName: "AR" },
  };

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    counterUnreadMessages();
  }, []);

  // Listen for WebSocket messages
  useEffect(() => {
    if (
      onlineSocket &&
      onlineSocket.readyState == WebSocket.OPEN &&
      currentUser
    ) {
      const handleMessage = (e) => {
        try {
          const WebSocketObject = JSON.parse(e.data);
          if (
            WebSocketObject.command == "SendMessage" &&
            WebSocketObject.reciever == currentUser.id
          ) {
            counterUnreadMessages(); // Refresh unread messages count
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      onlineSocket.onmessage = handleMessage;

      // Cleanup
      return () => {
        onlineSocket.onmessage = null;
      };
    }
  }, [onlineSocket, currentUser]); // Re-run effect if onlineSocket or currentUser changes

  useEffect(() => {
    if (unreadMessages < 1) {
      document.title = "Hopital Social Network";
    } else {
      document.title = `${unreadMessages} New Messages`;
    }
  }, [unreadMessages]);

  const counterUnreadMessages = async () =>
    await api
      .get("api/message/unreadcounter/")
      .then((res) => setUnreadMessages(res.data.unread_count))
      .catch((err) => alert(err));

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const userFullName =
    currentUser && `${currentUser.first_name} ${currentUser.last_name}`;

  return (
    <nav className="bg-white drop-shadow-lg w-full z-10">
      <div className="mx-8 px-4">
        <div className="flex justify-evenly items-center h-12">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl lg:text-[1.5rem] font-bold text-blue-600">
              <Link to={"/"}>HSN</Link>
            </h1>
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search className="h-2 w-2 lg:h-4 lg:w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none focus:outline-none ml-2 w-64"
              />
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/">
              <Home className="h-5 w-5 lg:h-8 lg:w-[2rem] text-gray-600 hover:text-blue-600" />
            </Link>

            <Bell className="h-5 w-5 lg:h-8 lg:w-[2rem] text-gray-600 hover:text-blue-600 cursor-pointer" />
            <Link to="/messages">
              <MessageSquare className="h-5 w-5 lg:h-8 lg:w-[2rem] text-gray-600 hover:text-blue-600" />
            </Link>

            {/* <Users className="h-6 w-6 lg:h-12 lg:w-[3rem] text-gray-600 hover:text-blue-600 cursor-pointer" /> */}
            <div className="h-6 w-6 lg:h-10 lg:w-10 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer">
              <div className="relative">
                <div
                  className="size-6 lg:size-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300"
                  onClick={() => setUserDropdown(!userDropdown)}
                >
                  <img
                    src={currentUser.profile_pic}
                    alt={userFullName}
                    className="object-cover size-6 lg:size-8 rounded-full"
                  />
                </div>

                {userDropdown && (
                  <UserDropdown
                    hideDropdown={() => setUserDropdown(!userDropdown)}
                    className="h-5 w-5 lg:h-10 lg:w-10 text-gray-600"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
