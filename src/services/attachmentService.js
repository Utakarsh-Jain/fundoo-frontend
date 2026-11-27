import apiClient from "../utils/apiClient";

/*
 * Service Name : AttachmentService
 * Description  : Handles attachment upload, listing, view and download APIs.
 * Author       : Utakarsh Jain
 * Date         : 27/11/2026
 */

// Uploads one file as multipart form data and returns the stored metadata.
export const uploadAttachment = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
        "/api/attachments/upload",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
};

// Fetches the attachment metadata owned by the authenticated user.
export const getAllAttachments = async () => {
    const response = await apiClient.get("/api/attachments");

    return response.data;
};

// Fetches one attachment as a blob for inline viewing.
export const viewAttachment = async (attachmentId) => {
    const response = await apiClient.get(
        `/api/attachments/${attachmentId}/view`,
        {
            responseType: "blob"
        }
    );

    return response.data;
};

// Fetches one attachment as a blob for local file download.
export const downloadAttachment = async (attachmentId) => {
    const response = await apiClient.get(
        `/api/attachments/${attachmentId}/download`,
        {
            responseType: "blob"
        }
    );

    return response.data;
};
