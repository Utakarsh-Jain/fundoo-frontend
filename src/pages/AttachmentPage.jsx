import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
    uploadAttachment,
    getAllAttachments,
    viewAttachment,
    downloadAttachment
} from "../services/attachmentService";

/*
 * Component Name : AttachmentPage
 * Description    : Uploads, lists, views and downloads user attachments.
 * Author         : Utakarsh Jain
 * Date           : 27/11/2026
 */

const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Converts a byte count into a short human readable file size.
const formatFileSize = (bytes) => {
    const size = Number(bytes) || 0;

    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

// Extracts the most useful error message from an API failure.
const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

// Validates the selected file before it is sent to the backend.
const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return "Unsupported file type. Upload PNG, JPEG, GIF, PDF, TXT, DOC, DOCX, XLS, or XLSX files.";
    }

    if (file.size > MAX_FILE_SIZE) {
        return "File is too large. Maximum allowed size is 10 MB.";
    }

    return "";
};

function AttachmentPage() {

    const { notify } = useOutletContext() || {};

    const [attachments, setAttachments] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    // Loads attachment metadata and reports failures through the toast.
    const fetchAttachments = useCallback(() => getAllAttachments()
        .then((response) => {
            setAttachments(Array.isArray(response) ? response : []);
        })
        .catch((fetchError) => {
            const message = getErrorMessage(
                fetchError,
                "Failed to fetch attachments."
            );
            setError(message);
            notify(message, "error");
        })
        .finally(() => {
            setLoading(false);
        }), [notify]);

    // Loads the attachment list once when the page is first mounted.
    useEffect(() => {
        fetchAttachments();
    }, [fetchAttachments]);

    // Stores the file chosen in the input and clears previous validation errors.
    const handleFileInputChange = (event) => {
        setSelectedFile(event.target.files?.[0] || null);
        setError("");
    };

    // Uploads the selected file and refreshes the metadata list.
    const handleUpload = async (event) => {
        event.preventDefault();

        const uploadForm = event.currentTarget;

        if (!selectedFile) {
            setError("Choose a file before uploading.");
            return;
        }

        const validationError = validateFile(selectedFile);

        if (validationError) {
            setError(validationError);
            notify(validationError, "error");
            return;
        }

        setUploading(true);
        setError("");

        try {
            await uploadAttachment(selectedFile);
            notify("Attachment uploaded successfully!");
            setSelectedFile(null);
            uploadForm.reset();
            await fetchAttachments();
        } catch (uploadError) {
            const message = getErrorMessage(
                uploadError,
                "Failed to upload attachment."
            );
            setError(message);
            notify(message, "error");
        } finally {
            setUploading(false);
        }
    };

    // Revokes a temporary object URL after the browser has opened it.
    const revokeObjectUrl = (url) => {
        URL.revokeObjectURL(url);
    };

    // Opens a fetched attachment blob in a new browser tab.
    const handleView = async (attachment) => {
        try {
            const blob = await viewAttachment(attachment.id);
            const url = URL.createObjectURL(blob);

            window.open(url, "_blank", "noopener,noreferrer");
            setTimeout(() => revokeObjectUrl(url), 1000);
        } catch (viewError) {
            notify(
                getErrorMessage(viewError, "Failed to view attachment."),
                "error"
            );
        }
    };

    // Saves a fetched attachment blob using a temporary download link.
    const handleDownload = async (attachment) => {
        try {
            const blob = await downloadAttachment(attachment.id);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = attachment.originalFileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            revokeObjectUrl(url);
        } catch (downloadError) {
            notify(
                getErrorMessage(downloadError, "Failed to download attachment."),
                "error"
            );
        }
    };

    // Creates a click handler for viewing one attachment row.
    const createViewHandler = (attachment) => () => handleView(attachment);

    // Creates a click handler for downloading one attachment row.
    const createDownloadHandler = (attachment) => () =>
        handleDownload(attachment);

    // Renders one attachment row with metadata and file actions.
    const renderAttachment = (attachment) => (
        <li className="attachment-item" key={attachment.id}>
            <div className="attachment-details">
                <p className="attachment-name">{attachment.originalFileName}</p>
                <p className="attachment-meta">
                    {formatFileSize(attachment.fileSize)}
                    {" · "}
                    {attachment.contentType}
                    {" · "}
                    {new Date(attachment.uploadedAt).toLocaleString()}
                </p>
            </div>

            <div className="attachment-actions">
                <button
                    type="button"
                    className="btn btn-link"
                    onClick={createViewHandler(attachment)}
                >
                    View {attachment.originalFileName}
                </button>
                <button
                    type="button"
                    className="btn btn-link"
                    onClick={createDownloadHandler(attachment)}
                >
                    Download {attachment.originalFileName}
                </button>
            </div>
        </li>
    );

    if (loading) {
        return (
            <main className="page-content">
                <div className="loading-state">
                    <div>
                        <div className="spinner" />
                        <p>Loading attachments...</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="page-content">
            <div className="page-head">
                <div>
                    <h1>Attachments</h1>
                    <p>Upload files and keep them available across your notes.</p>
                </div>
                <span className="count-pill">
                    {attachments.length}{" "}
                    {attachments.length === 1 ? "file" : "files"}
                </span>
            </div>

            <section className="attachment-panel">
                <h2>Upload a file</h2>
                <p className="attachment-hint">
                    PNG, JPEG, GIF, PDF, TXT, DOC, DOCX, XLS and XLSX files up
                    to 10 MB are supported.
                </p>

                <form className="upload-form" onSubmit={handleUpload}>
                    <div className="upload-row">
                        <input
                            id="attachment-file"
                            className="input"
                            type="file"
                            name="file"
                            aria-label="Choose attachment"
                            accept=".png,.jpg,.jpeg,.gif,.pdf,.txt,.doc,.docx,.xls,.xlsx,image/png,image/jpeg,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onChange={handleFileInputChange}
                        />

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={uploading || !selectedFile}
                        >
                            {uploading ? "Uploading..." : "Upload attachment"}
                        </button>
                    </div>

                    {selectedFile && (
                        <p className="attachment-selection">
                            Selected: {selectedFile.name}
                        </p>
                    )}

                    {error && (
                        <p className="attachment-error" role="alert">
                            {error}
                        </p>
                    )}
                </form>
            </section>

            <section className="attachment-panel">
                <h2>Your files</h2>

                {attachments.length === 0 ? (
                    <div className="attachment-empty">
                        <h3>No attachments yet</h3>
                        <p>Uploaded files will appear in this list.</p>
                    </div>
                ) : (
                    <ul className="attachment-list">
                        {attachments.map(renderAttachment)}
                    </ul>
                )}
            </section>
        </main>
    );
}

export default AttachmentPage;
