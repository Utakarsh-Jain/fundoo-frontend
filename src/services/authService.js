import apiClient from "../utils/apiClient";

/*
 * Service Name : AuthService
 * Description  : Handles user registration and login API calls.
 * Author       : Utakarsh Jain
 * Date         : 25/11/2026
 */

// Sends user registration details to the backend.
export const registerUser = async (userData) => {
    const response = await apiClient.post(
        "/api/users/register",
        userData
    );

    return response.data;
};

// Authenticates user and returns the JWT response.
export const loginUser = async (credentials) => {
    const response = await apiClient.post(
        "/api/users/login",
        credentials
    );

    return response.data;
};

export const resendVerificationEmail = async (email) => {
    const response = await apiClient.post(
        "/api/auth/verify-email/resend",
        { email }
    );

    return response.data;
};

export const verifyEmail = async (token) => {
    const response = await apiClient.post(
        "/api/auth/verify-email",
        { token }
    );

    return response.data;
};

export const requestPasswordReset = async (email) => {
    const response = await apiClient.post(
        "/api/auth/forgot-password",
        { email }
    );

    return response.data;
};

export const resetPassword = async (token, newPassword) => {
    const response = await apiClient.post(
        "/api/auth/reset-password",
        { token, newPassword }
    );

    return response.data;
};

export const logoutUser = async () => {
    const response = await apiClient.post("/api/auth/logout");

    return response.data;
};