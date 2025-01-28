import { createContext, useState, useContext } from "react";

const CreatePostContext = createContext();

export const useCreatePost = () => useContext(CreatePostContext);

export const CreatePostProvider = ({ children }) => {
  const [isCreatePostVisible, setIsCreatePostVisible] = useState(false);

  const toggleCreatePost = () => {
    setIsCreatePostVisible(!isCreatePostVisible);
  };

  return (
    <CreatePostContext.Provider
      value={{ isCreatePostVisible, toggleCreatePost }}
    >
      {children}
    </CreatePostContext.Provider>
  );
};
