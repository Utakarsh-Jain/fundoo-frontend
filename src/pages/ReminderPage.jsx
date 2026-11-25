import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { createReminder } from "../services/reminderService";
import { getAllNotes } from "../services/noteService";

/*
 * Component Name : ReminderPage
 * Description    : Lets the user schedule email reminders for active notes.
 * Author         : Utakarsh Jain
 * Date           : 26/11/2026
 */

const STORAGE_KEY = "fundoo.reminders";

function readScheduled() {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value ? JSON.parse(value) : {};
    } catch {
        return {};
    }
}

function ReminderPage() {

    const { searchQuery, notify } = useOutletContext() || {};

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [times, setTimes] = useState({});
    const [scheduled, setScheduled] = useState(readScheduled);
    const [busyId, setBusyId] = useState(null);

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

    const now = new Date();
    const localMin = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 16);

    const activeNotes = notes
        .filter((note) => !note.archived && !note.trashed)
        .filter((note) => {
            const query = (searchQuery || "").toLowerCase();
            return (
                (note.title || "").toLowerCase().includes(query) ||
                (note.description || "").toLowerCase().includes(query)
            );
        });

    const handleSetReminder = async (note) => {
        const reminderTime = times[note.id];

        if (!reminderTime) {
            notify("Choose a date and time first.", "error");
            return;
        }

        if (new Date(reminderTime) <= new Date()) {
            notify("Please select a future date and time.", "error");
            return;
        }

        setBusyId(note.id);

        try {
            await createReminder({ noteId: note.id, reminderTime });

            const updated = { ...scheduled, [note.id]: reminderTime };
            setScheduled(updated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setTimes({ ...times, [note.id]: "" });
            notify(`Reminder set for “${note.title}”.`);
        } catch (error) {
            notify(
                error.response?.data?.message || "Failed to schedule reminder.",
                "error"
            );
        } finally {
            setBusyId(null);
        }
    };

    if (loading) {
        return (
            <main className="page-content">
                <div className="loading-state">
                    <div>
                        <div className="spinner" />
                        <p>Loading notes...</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="page-content">
            <div className="page-head">
                <div>
                    <h1>Reminders</h1>
                    <p>Choose a note and we will remind you at the right time.</p>
                </div>
                <span className="count-pill">
                    {activeNotes.length}{" "}
                    {activeNotes.length === 1 ? "note" : "notes"}
                </span>
            </div>

            <div className="info-banner">
                <span>⏰</span>
                Reminders are delivered to your registered email address.
            </div>

            {activeNotes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">⏰</div>
                    <h3>No notes to remind you about</h3>
                    <p>Create a note first, then schedule a reminder here.</p>
                </div>
            ) : (
                <div className="notes-grid">
                    {activeNotes.map((note) => (
                        <article className="note-card" key={note.id}>
                            <div className="note-card-top">
                                <h3>{note.title}</h3>
                            </div>
                            <p className="note-description note-snippet">
                                {note.description}
                            </p>

                            {scheduled[note.id] && (
                                <div className="chip-row">
                                    <span className="chip">
                                        ⏰ Scheduled for{" "}
                                        {new Date(scheduled[note.id]).toLocaleString()}
                                    </span>
                                </div>
                            )}

                            <div className="reminder-box">
                                <div className="reminder-inline">
                                    <input
                                        className="input"
                                        type="datetime-local"
                                        min={localMin}
                                        value={times[note.id] || ""}
                                        onChange={(e) => setTimes({
                                            ...times,
                                            [note.id]: e.target.value
                                        })}
                                        aria-label={`Reminder time for ${note.title}`}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        disabled={busyId === note.id}
                                        onClick={() => handleSetReminder(note)}
                                    >
                                        {busyId === note.id ? "Saving..." : "Set"}
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

export default ReminderPage;
