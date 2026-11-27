import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import NoteCard from "../components/NoteCard";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import PageHeader from "../components/ui/PageHeader";

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
                <LoadingState label="Loading trash..." />
            </main>
        );
    }

    return (
        <main className="page-content">
            <PageHeader
                title="Trash"
                description="Restore anything you deleted by mistake."
                count={trashedNotes.length}
                countLabel={trashedNotes.length === 1 ? "note" : "notes"}
            />

            {trashedNotes.length === 0 ? (
                <EmptyState
                    icon="trash"
                    title="Trash is empty"
                    description="Deleted notes will appear here until restored."
                />
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
