import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useUser } from "./Usercontext";
import { ACCESS_TOKEN } from "../constants";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const currentUser = useUser();
  const [onlineStatus, setOnlineStatus] = useState({});
  const webSocketRef = useRef(null);

  useEffect(() => {
    const userConnect = async () => {
      if (currentUser && !webSocketRef.current) {
        try {
          const token = localStorage.getItem(ACCESS_TOKEN);
          if (!token) {
            console.error("Can't Connect, No Authentication is Provided!");
            return;
          }

          webSocketRef.current = new WebSocket(
            `ws://127.0.0.1:8000/ws/online/?token=${token}`
          );
          webSocketRef.current.onopen = () => {
            window.addEventListener("beforeunload", handleBeforeUnload);
            setOnlineStatus(webSocketRef.current);
          };
          webSocketRef.current.onerror = (error) => {
            console.error("WebSocket error:", error);
            webSocketRef.current = null;
            setOnlineStatus({});
          };
          webSocketRef.current.onclose = () => {
            webSocketRef.current = null;
            setOnlineStatus({});
          };
        } catch (error) {
          console.error("Failed to connect to WebSocket:", error);
        }
      }
    };
    setTimeout(() => {
      userConnect();
    }, 1500);

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
      setOnlineStatus({});
    };
  }, []);

  // useEffect(() => {
  //   if (currentUser && webSocketRef.current) {
  //     webSocketRef.current.send(
  //       JSON.stringify({
  //         command: "Online",
  //         user: currentUser?.id,
  //         message: "isOnline",
  //       })
  //     );
  //   }
  // }, [onlineStatus]);

  return (
    <WebSocketContext.Provider value={onlineStatus}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const socket = useContext(WebSocketContext);
  if (!socket) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return socket;
};
