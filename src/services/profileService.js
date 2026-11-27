import apiClient from "../utils/apiClient";

/*
 * Service Name : ProfileService
 * Description  : Handles authenticated profile API calls.
 * Author       : Utakarsh Jain
 * Date         : 27/11/2026
 */

// Fetches the authenticated user's profile from the backend.
export const getProfile = async () => {
    const response = await apiClient.get("/api/users/profile");

    return response.data;
};
