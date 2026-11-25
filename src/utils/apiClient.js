import axios from "axios";
import { getToken, removeToken } from "./token";

const apiClient = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json"
    }
});

apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLogin = error.config?.url?.includes("/api/users/login");

        if (error.response?.status === 401 && !isLogin) {
            removeToken();
            window.location.assign("/login");
        }

        return Promise.reject(error);
    }
);

export default apiClient;