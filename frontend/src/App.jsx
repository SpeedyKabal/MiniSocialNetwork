import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import { CreatePostProvider } from "./components/CreatePostContext";
import CreatePostModal from "./components/CreatePostModal";
import { currentUserLoader } from "./components/loaders/curerntUserLoader";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          loader={currentUserLoader}
          element={
            <ProtectedRoute>
              <CreatePostProvider>
                <Navbar />
                <CreatePostModal />
                <Home />
              </CreatePostProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <CreatePostProvider>
                <Navbar />
                <CreatePostModal />
                <Messages />
              </CreatePostProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/myprofile"
          element={
            <ProtectedRoute>
              <CreatePostProvider>
                <Navbar />
                <CreatePostModal />
                <Profile />
              </CreatePostProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/logout"
          element={
            <ProtectedRoute>
              <Logout />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
