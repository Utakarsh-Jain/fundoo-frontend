import apiClient from "../utils/apiClient";

/*
 * Service Name : NoteService
 * Description  : Handles note-related API operations.
 * Author       : Utkarsh Jain
 * Date         : 25/11/2026
 */

// Fetches all notes belonging to the authenticated user.
export const getAllNotes = async () => {
    const response = await apiClient.get("/api/notes");

    return response.data;
};

// Creates a new note for the authenticated user.
export const createNote = async (noteData) => {
    const response = await apiClient.post(
        "/api/notes",
        noteData
    );

    return response.data;
};
// Toggles the pin status of a note.
export const togglePin = async (noteId) => {
    const response = await apiClient.patch(
        `/api/notes/${noteId}/pin`
    );

    return response.data;
};

// Toggles the archive status of a note.
export const toggleArchive = async (noteId) => {
    const response = await apiClient.patch(
        `/api/notes/${noteId}/archive`
    );

    return response.data;
};
// Toggles the trash status of a note.
export const toggleTrash = async (noteId) => {
    const response = await apiClient.patch(
        `/api/notes/${noteId}/trash`
    );

    return response.data;
};