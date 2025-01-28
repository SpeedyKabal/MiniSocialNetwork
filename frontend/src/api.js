import axios from "axios"
import { ACCESS_TOKEN,REFRESH_TOKEN  } from "./constants"



const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

const refreshToken = async () => {
    try {
        const refresh = localStorage.getItem(REFRESH_TOKEN); // Retrieve the actual refresh token
        if (!refresh) {
            alert("No refresh token found.");
            return null;
        }

        const response = await axios.post(`${import.meta.env.VITE_API_URL}api/token/refresh/`, {
            refresh,
        }).catch((e)=>alert(e));
        const newAccessToken = response.data.access;

        localStorage.setItem(ACCESS_TOKEN, newAccessToken);

        return newAccessToken;
    } catch (error) {
        console.error("Failed to refresh token:", error);
        return null;
    }
};

const startTokenRefresh = () => {
    const REFRESH_INTERVAL = 25 * 60 * 1000; // 25 minutes

    setInterval(async () => {
        const newToken = await refreshToken();
        if (!newToken) {
            window.location.href = "/login";
        }
    }, REFRESH_INTERVAL);
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if(token){
            config.headers.Authorization = 'Bearer ' + token
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

startTokenRefresh();


export default api