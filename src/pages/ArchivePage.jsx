import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import NoteCard from "../components/NoteCard";

import { createReminder } from "../services/reminderService";
import {
    getAllNotes,
    togglePin,
    toggleArchive,
    toggleTrash
} from "../services/noteService";
import {
    assignLabelToNote,
    removeLabelFromNote
} from "../services/labelService";

/*
 * Component Name : ArchivePage
 * Description    : Shows archived notes and allows restoring or trashing them.
 * Author         : Utakarsh Jain
 * Date           : 26/11/2026
 */

function ArchivePage() {

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

    const archivedNotes = notes
        .filter((note) => note.archived && !note.trashed)
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
                        <p>Loading archived notes...</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="page-content">
            <div className="page-head">
                <div>
                    <h1>Archive</h1>
                    <p>Notes you want to keep, but out of the way.</p>
                </div>
                <span className="count-pill">
                    {archivedNotes.length}{" "}
                    {archivedNotes.length === 1 ? "note" : "notes"}
                </span>
            </div>

            {archivedNotes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>Your archive is empty</h3>
                    <p>Archived notes will show up here.</p>
                </div>
            ) : (
                <div className="notes-grid">
                    {archivedNotes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            labels={labels}
                            onPin={(id) => runAction(
                                () => togglePin(id),
                                "Pin status updated.",
                                "Failed to update pin status."
                            )}
                            onArchive={(id) => runAction(
                                () => toggleArchive(id),
                                "Note restored from archive.",
                                "Failed to unarchive note."
                            )}
                            onTrash={(id) => runAction(
                                () => toggleTrash(id),
                                "Note moved to trash.",
                                "Failed to move note to trash."
                            )}
                            onSetReminder={(id, time) => runAction(
                                () => createReminder({ noteId: id, reminderTime: time }),
                                "Reminder scheduled successfully!",
                                "Failed to schedule reminder."
                            )}
                            onAssignLabel={(labelId, id) => runAction(
                                () => assignLabelToNote(labelId, id),
                                "Label assigned successfully!",
                                "Failed to assign label."
                            )}
                            onRemoveLabel={(labelId, id) => runAction(
                                () => removeLabelFromNote(labelId, id),
                                "Label removed successfully!",
                                "Failed to remove label."
                            )}
                            onNotify={notify}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}

export default ArchivePage;
