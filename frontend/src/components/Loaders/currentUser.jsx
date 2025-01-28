import api from "../../api";

export const currentUser = async () => {
  const response = await api
    .get("/api/currentuser/")
    .catch((err) => console.log(err));

  return response.data;
};
