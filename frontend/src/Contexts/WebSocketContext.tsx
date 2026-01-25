import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useUser } from "./Usercontext";
import { ACCESS_TOKEN } from "../constants";
import { Utilisateur } from '../types/types'


const WebSocketContext = createContext<WebSocket | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {

  const currentUser = useUser() as Utilisateur | null;
  const [onlineStatus, setOnlineStatus] = useState<WebSocket | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const userConnect = async () => {
      if (currentUser && !webSocketRef.current) {
        try {
          const token = localStorage.getItem(ACCESS_TOKEN);
          if (!token) {
            console.error("Can't Connect, No Authentication is Provided!");
            return;
          }

          const wsUrl = (import.meta as any).env.VITE_WS_URL;
          if (wsUrl) {
            webSocketRef.current = new WebSocket(`${wsUrl}?token=${token}`);
            webSocketRef.current.onopen = () => {
              setOnlineStatus(webSocketRef.current as WebSocket);
            };
            webSocketRef.current.onerror = (error) => {
              console.error("WebSocket error:", error);
              webSocketRef.current = null;
              setOnlineStatus(null);
            };
            webSocketRef.current.onclose = () => {
              webSocketRef.current = null;
              setOnlineStatus(null);
            };
          } else {
            console.error("WebSocket URL is not defined in environment variables.");
            console.log("wUrl : ", wsUrl);
            return;
          }

        } catch (error) {
          console.error("Failed to connect to WebSocket:", error);
        }
      }
    };
    setTimeout(() => {
      userConnect();
    }, 300);

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
      setOnlineStatus(null);
    };
  }, []);

  // useEffect(() => {
  //   if (currentUser && webSocketRef.current) {
  //     webSocketRef.current.send(
  //       JSON.stringify({
  //         command: "Online",
  //         user: currentUser ? currentUser.id : null,
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

export function useWebSocket() {
  const socket = useContext(WebSocketContext);
  if (socket === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return socket;
};
