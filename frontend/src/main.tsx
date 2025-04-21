import React from "react";
import ReactDOM from "react-dom/client";
import "./browser.js";
import "./i18next.js";
import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar/Navbar";
import { WebSocketProvider, useWebSocket } from "./Contexts/WebSocketContext";
import { useUser } from "./Contexts/Usercontext";
import Home from "./pages/Home.tsx";
import SinglePost from "./components/PostComponents/SinglePost";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Footer from "./components/Footer";
import ChangePassword from "./pages/ChangePassword";
import { Utilisateur } from "./types/types.ts";

function Logout() {
  const socket = useWebSocket();
  const currentUser = useUser() as Utilisateur | null;

  if (socket && socket.readyState == 1 && currentUser) {
    // Send logout notification via WebSocket
    socket.send(
      JSON.stringify({
        command: "Online",
        user: currentUser ? currentUser.id : null,
        message: "notOnline",
      })
    );
  }


  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  return <Register />;
}


const Layout = () => (
  <ProtectedRoute>
    <WebSocketProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Outlet />
        <Footer />
      </div>
    </WebSocketProvider>
  </ProtectedRoute>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="post/:id" element={<SinglePost />} />
        <Route path="messages" element={<Messages />} />
        <Route path="profile/:username" element={<Profile />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/register" element={<RegisterAndLogout />} />
    </>
  )
);

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}


