// UserContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../api";
import Loading from "../components/Extensions/Loading";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      await api
        .get("/api/currentuser/")
        .then((res) => {
          if (res.status === 200) {
            setCurrentUser(res.data);
          }
        })
        .catch((err) => console.log(err))
        .finally(() => setLoading(false));
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={currentUser}>
      {loading ? <Loading /> : children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
