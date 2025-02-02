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
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import { WebSocketProvider } from "./Contexts/WebSocketContext.jsx";
import Home from "./pages/Home.tsx";
import SinglePost from "./components/PostComponents/SinglePost.jsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";
import Messages from "./pages/Messages.jsx";
import Profile from "./pages/Profile.jsx";
import Footer from "./components/Footer.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";

function Logout() {
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


