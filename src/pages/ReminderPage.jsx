import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
    createReminder,
    deleteReminder,
    getAllReminders,
    updateReminder
} from "../services/reminderService";
import { getAllNotes } from "../services/noteService";

/*
 * Component Name : ReminderPage
 * Description    : Lists, schedules, updates and deletes user reminders.
 * Author         : Utakarsh Jain
 * Date           : 26/11/2026
 */

function toLocalInputValue(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const local = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
    );
    return local.toISOString().slice(0, 16);
}

function formatReminderTime(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleString();
}

const noop = () => {};

function ReminderPage() {

    const { searchQuery, notify: notifyContext } = useOutletContext() || {};
    const notify = notifyContext || noop;

    const [notes, setNotes] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [times, setTimes] = useState({});
    const [busyId, setBusyId] = useState(null);
    const [editingReminderId, setEditingReminderId] = useState(null);
    const [editTime, setEditTime] = useState("");
    const [error, setError] = useState("");

    const fetchNotes = useCallback(() => getAllNotes()
        .then((response) => {
            setNotes(Array.isArray(response) ? response : []);
        })
        .catch((error) => {
            notify(
                error.response?.data?.message || "Failed to fetch notes.",
                "error"
            );
        }), [notify]);

    const fetchReminders = useCallback(() => getAllReminders()
        .then((response) => {
            setReminders(Array.isArray(response) ? response : []);
        })
        .catch((error) => {
            notify(
                error.response?.data?.message || "Failed to fetch reminders.",
                "error"
            );
        }), [notify]);

    useEffect(() => {
        Promise.all([fetchNotes(), fetchReminders()])
            .finally(() => setLoading(false));
    }, [fetchNotes, fetchReminders]);

    const now = new Date();
    const localMin = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 16);

    const query = (searchQuery || "").toLowerCase();

    const scheduledNoteIds = new Set(
        reminders.map((reminder) => reminder.noteId)
    );

    const activeNotes = notes
        .filter((note) => !note.archived && !note.trashed)
        .filter((note) => !scheduledNoteIds.has(note.id))
        .filter((note) =>
            (note.title || "").toLowerCase().includes(query) ||
            (note.description || "").toLowerCase().includes(query)
        );

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
            await fetchReminders();

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

    const openEditForm = (reminder) => {
        setEditingReminderId(reminder.id);
        setEditTime(toLocalInputValue(reminder.reminderTime));
        setError("");
    };

    const closeEditForm = () => {
        setEditingReminderId(null);
        setEditTime("");
        setError("");
    };

    const handleUpdateReminder = async (reminder) => {
        if (!editTime) {
            setError("Choose a date and time first.");
            return;
        }

        if (new Date(editTime) <= new Date()) {
            setError("Please select a future date and time.");
            return;
        }

        setBusyId(reminder.id);

        try {
            await updateReminder(reminder.id, { reminderTime: editTime });
            await fetchReminders();

            closeEditForm();
            notify("Reminder updated successfully!");
        } catch (error) {
            const message = error.response?.data?.message
                || "Failed to update reminder.";

            setError(message);
            notify(message, "error");
        } finally {
            setBusyId(null);
        }
    };

    const handleDeleteReminder = async (reminder) => {
        setBusyId(reminder.id);

        try {
            await deleteReminder(reminder.id);
            await fetchReminders();

            if (editingReminderId === reminder.id) {
                closeEditForm();
            }

            notify("Reminder deleted successfully!");
        } catch (error) {
            notify(
                error.response?.data?.message || "Failed to delete reminder.",
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
                        <p>Loading reminders...</p>
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
                    <p>Keep track of every reminder you have scheduled.</p>
                </div>
                <span className="count-pill">
                    {reminders.length}{" "}
                    {reminders.length === 1 ? "reminder" : "reminders"}
                </span>
            </div>

            <div className="info-banner">
                <span>⏰</span>
                Reminders are delivered to your registered email address.
            </div>

            <section className="reminder-section">
                <h2>Scheduled reminders</h2>

                {reminders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">⏰</div>
                        <h3>No reminders scheduled</h3>
                        <p>Schedule a reminder for a note below.</p>
                    </div>
                ) : (
                    <div className="reminder-list">
                        {reminders.map((reminder) => (
                            <article className="reminder-item" key={reminder.id}>
                                <div className="reminder-item-main">
                                    <h3>{reminder.noteTitle}</h3>
                                    <p>
                                        ⏰ {formatReminderTime(
                                            reminder.reminderTime
                                        )}
                                    </p>
                                </div>

                                <div className="reminder-actions">
                                    <button
                                        type="button"
                                        className="icon-button label-edit"
                                        title="Edit reminder"
                                        aria-label={`Edit reminder for ${reminder.noteTitle}`}
                                        onClick={() => openEditForm(reminder)}
                                    >
                                        ✎
                                    </button>

                                    <button
                                        type="button"
                                        className="icon-button label-delete"
                                        title="Delete reminder"
                                        aria-label={`Delete reminder for ${reminder.noteTitle}`}
                                        disabled={busyId === reminder.id}
                                        onClick={() => handleDeleteReminder(reminder)}
                                    >
                                        ×
                                    </button>
                                </div>

                                {editingReminderId === reminder.id && (
                                    <div className="reminder-edit">
                                        <input
                                            className="input"
                                            type="datetime-local"
                                            min={localMin}
                                            value={editTime}
                                            onChange={(e) => {
                                                setEditTime(e.target.value);
                                                setError("");
                                            }}
                                            aria-label={`New reminder time for ${reminder.noteTitle}`}
                                        />

                                        {error && (
                                            <p className="label-error" role="alert">
                                                {error}
                                            </p>
                                        )}

                                        <div className="label-form-actions">
                                            <button
                                                type="button"
                                                className="btn btn-link"
                                                onClick={closeEditForm}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                disabled={busyId === reminder.id}
                                                onClick={() => handleUpdateReminder(reminder)}
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="reminder-section">
                <h2>Schedule a new reminder</h2>

                {activeNotes.length === 0 ? (
                    <p className="label-empty">
                        Every active note already has a reminder.
                    </p>
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
            </section>
        </main>
    );
}

export default ReminderPage;
