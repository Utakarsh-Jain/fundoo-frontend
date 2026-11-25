import apiClient from "../utils/apiClient";

export const registerUser = async (userData) => {
    const response = await apiClient.post("/api/users/register", userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await apiClient.post("/api/users/login", credentials);
    return response.data;
};