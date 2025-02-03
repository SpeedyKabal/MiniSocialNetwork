import { User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { use } from "react";

function UserDropdown({ hideDropdown }) {
  const currentUser = useUser();
  const onlineSocket = useWebSocket();
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    oflline();
    window.location.href = "/login"; // Redirect to login page
  };

  function oflline() {
    if (onlineSocket.readyState === WebSocket.OPEN) {
      onlineSocket.send(
        JSON.stringify({
          command: "Online",
          user: currentUser?.id,
          message: "isOffline",
        })
      );
    }
  }

  return (
    <div className="absolute right-0 mt-2 w-52 lg:w-56 bg-white rounded-lg shadow-lg py-1 z-20">
      <Link
        to={`/profile/${currentUser?.username}`}
        onClick={hideDropdown}
        className="w-full px-4 py-2 text-left text-md lg:text-xl text-gray-700 hover:bg-gray-100 flex items-center"
      >
        <User className="size-4 lg:size-6 mr-2" />
        Profile
      </Link>
      <button
        onClick={handleLogout}
        className="w-full px-4 py-2 text-left text-md lg:text-xl text-red-600 hover:bg-gray-100 flex items-center"
      >
        <LogOut className="size-4 lg:size-6 mr-2" />
        Logout
      </button>
    </div>
  );
}

export default UserDropdown;
