import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import NoteCard from "../components/NoteCard";

import { createReminder } from "../services/reminderService";
import {
    getAllNotes,
    createNote,
    togglePin,
    toggleArchive,
    toggleTrash
} from "../services/noteService";
import {
    assignLabelToNote,
    removeLabelFromNote
} from "../services/labelService";

/*
 * Component Name : DashboardPage
 * Description    : Displays active notes with creation, filtering and label actions.
 * Author         : Utakarsh Jain
 * Date           : 26/11/2026
 */

function DashboardPage() {

    const {
        labels = [],
        selectedLabel,
        searchQuery,
        notify
    } = useOutletContext() || {};

    const [notes, setNotes] = useState([]);
    const [formData, setFormData] = useState({ title: "", description: "" });
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [filter, setFilter] = useState("all");

    const fetchNotes = useCallback(() => getAllNotes()
        .then((response) => {
            setNotes(Array.isArray(response) ? response : []);
        })
        .catch((error) => {
            notify(
                error.response?.data?.message || "Failed to fetch notes.",
                "error"
            );
        })
        .finally(() => {
            setLoading(false);
        }), [notify]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            await createNote(formData);
            setFormData({ title: "", description: "" });
            notify("Note created successfully!");
            await fetchNotes();
        } catch (error) {
            notify(
                error.response?.data?.message || "Failed to create note.",
                "error"
            );
        } finally {
            setCreating(false);
        }
    };

    const runAction = async (action, successMessage, errorMessage) => {
        try {
            await action();
            notify(successMessage);
            await fetchNotes();
        } catch (error) {
            notify(
                error.response?.data?.message || errorMessage,
                "error"
            );
        }
    };

    const handlePin = (noteId) => runAction(
        () => togglePin(noteId),
        "Pin status updated.",
        "Failed to update pin status."
    );

    const handleArchive = (noteId) => runAction(
        () => toggleArchive(noteId),
        "Note archived.",
        "Failed to archive note."
    );

    const handleTrash = (noteId) => runAction(
        () => toggleTrash(noteId),
        "Note moved to trash.",
        "Failed to move note to trash."
    );

    const handleSetReminder = (noteId, reminderTime) => runAction(
        () => createReminder({ noteId, reminderTime }),
        "Reminder scheduled successfully!",
        "Failed to schedule reminder."
    );

    const handleAssignLabel = (labelId, noteId) => runAction(
        () => assignLabelToNote(labelId, noteId),
        "Label assigned successfully!",
        "Failed to assign label."
    );

    const handleRemoveLabel = (labelId, noteId) => runAction(
        () => removeLabelFromNote(labelId, noteId),
        "Label removed successfully!",
        "Failed to remove label."
    );

    const filteredNotes = notes
        .filter((note) => !note.archived && !note.trashed)
        .filter((note) => {
            const query = (searchQuery || "").toLowerCase();

            const matchesSearch =
                (note.title || "").toLowerCase().includes(query) ||
                (note.description || "").toLowerCase().includes(query);

            const matchesFilter =
                filter === "all" ||
                (filter === "pinned" && note.pinned) ||
                (filter === "unpinned" && !note.pinned);

            const matchesLabel =
                selectedLabel === null ||
                (note.labels || []).some(
                    (label) => label.id === selectedLabel
                );

            return matchesSearch && matchesFilter && matchesLabel;
        })
        .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));

    const selectedLabelName = labels.find(
        (label) => label.id === selectedLabel
    )?.name;

    if (loading) {
        return (
            <main className="page-content">
                <div className="loading-state">
                    <div>
                        <div className="spinner" />
                        <p>Loading your notes...</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="page-content">
            <div className="page-head">
                <div>
                    <h1>{selectedLabelName || "My Notes"}</h1>
                    <p>Capture your thoughts, keep them organised.</p>
                </div>
                <span className="count-pill">
                    {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
                </span>
            </div>

            <form className="composer" onSubmit={handleSubmit}>
                <input
                    className="input"
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleChange}
                    aria-label="Note title"
                    required
                />
                <textarea
                    className="input"
                    name="description"
                    placeholder="Write something..."
                    value={formData.description}
                    onChange={handleChange}
                    aria-label="Note description"
                />
                <div className="composer-footer">
                    <span>Notes are saved to your account</span>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={creating}
                    >
                        {creating ? "Creating..." : "Create Note"}
                    </button>
                </div>
            </form>

            <div className="toolbar">
                <div className="filter-tabs">
                    {[
                        ["all", "All"],
                        ["pinned", "Pinned"],
                        ["unpinned", "Others"]
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            className={`filter-tab ${filter === value ? "active" : ""}`}
                            onClick={() => setFilter(value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <span className="toolbar-hint">
                    {selectedLabelName
                        ? `Showing notes labeled “${selectedLabelName}”`
                        : "Tip: use the sidebar to organise notes with labels"}
                </span>
            </div>

            {filteredNotes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">✎</div>
                    <h3>Nothing here yet</h3>
                    <p>
                        {searchQuery
                            ? "Try a different search term."
                            : "Create a note above to get started."}
                    </p>
                </div>
            ) : (
                <div className="notes-grid">
                    {filteredNotes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            labels={labels}
                            onPin={handlePin}
                            onArchive={handleArchive}
                            onTrash={handleTrash}
                            onSetReminder={handleSetReminder}
                            onAssignLabel={handleAssignLabel}
                            onRemoveLabel={handleRemoveLabel}
                            onNotify={notify}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}

export default DashboardPage;
