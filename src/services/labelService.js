import apiClient from "../utils/apiClient";

/*
 * Service Name : LabelService
 * Description  : Handles label-related API operations.
 * Author       : Utakarsh Jain
 * Date         : 26/11/2026
 */

export const createLabel = async (labelData) => {
    const response = await apiClient.post("/api/labels", labelData);
    return response.data;
};

export const updateLabel = async (labelId, labelData) => {
    const response = await apiClient.put(
        `/api/labels/${labelId}`,
        labelData
    );
    return response.data;
};

export const getAllLabels = async () => {
    const response = await apiClient.get("/api/labels");
    return response.data;
};

export const deleteLabel = async (labelId) => {
    const response = await apiClient.delete(`/api/labels/${labelId}`);
    return response.data;
};

export const assignLabelToNote = async (labelId, noteId) => {
    const response = await apiClient.post(
        `/api/labels/${labelId}/notes/${noteId}`
    );
    return response.data;
};

export const removeLabelFromNote = async (labelId, noteId) => {
    const response = await apiClient.delete(
        `/api/labels/${labelId}/notes/${noteId}`
    );
    return response.data;
};
