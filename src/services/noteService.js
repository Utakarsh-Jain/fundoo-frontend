import apiClient from "../utils/apiClient";

/*
 * Service Name : NoteService
 * Description  : Handles note-related API operations.
 * Author       : Utakarsh Jain
 * Date         : 25/11/2026
 */

// Fetches all notes belonging to the authenticated user.
export const getAllNotes = async () => {
    const response = await apiClient.get("/api/notes");

    return response.data;
};