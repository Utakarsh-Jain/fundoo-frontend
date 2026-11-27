import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import NoteCard from "../components/NoteCard";

import {
    getAllNotes,
    restoreNote,
    permanentlyDeleteNote
} from "../services/noteService";

/*
 * Component Name : TrashPage
 * Description    : Shows trashed notes and allows restoring them.
 * Author         : Utakarsh Jain
 * Date           : 26/11/2026
 */

function TrashPage() {

    const { labels = [], searchQuery, notify } = useOutletContext() || {};

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const runAction = async (action, successMessage, errorMessage) => {
        try {
            await action();
            notify(successMessage);
            await fetchNotes();
        } catch (error) {
            notify(error.response?.data?.message || errorMessage, "error");
        }
    };

    const trashedNotes = notes
        .filter((note) => note.trashed)
        .filter((note) => {
            const query = (searchQuery || "").toLowerCase();
            return (
                (note.title || "").toLowerCase().includes(query) ||
                (note.description || "").toLowerCase().includes(query)
            );
        });

    if (loading) {
        return (
            <main className="page-content">
                <div className="loading-state">
                    <div>
                        <div className="spinner" />
                        <p>Loading trash...</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="page-content">
            <div className="page-head">
                <div>
                    <h1>Trash</h1>
                    <p>Restore anything you deleted by mistake.</p>
                </div>
                <span className="count-pill">
                    {trashedNotes.length}{" "}
                    {trashedNotes.length === 1 ? "note" : "notes"}
                </span>
            </div>

            {trashedNotes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🗑️</div>
                    <h3>Trash is empty</h3>
                    <p>Deleted notes will appear here until restored.</p>
                </div>
            ) : (
                <div className="notes-grid">
                    {trashedNotes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            labels={labels}
                            onRestore={(id) => runAction(
                                () => restoreNote(id),
                                "Note restored successfully!",
                                "Failed to restore note."
                            )}
                            onPermanentlyDelete={(id) => runAction(
                                () => permanentlyDeleteNote(id),
                                "Note permanently deleted.",
                                "Failed to delete note permanently."
                            )}
                            onNotify={notify}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}

export default TrashPage;
