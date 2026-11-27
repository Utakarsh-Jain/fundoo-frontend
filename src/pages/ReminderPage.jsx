import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import ActionButton from "../components/ui/ActionButton";
import EmptyState from "../components/ui/EmptyState";
import Icon from "../components/ui/Icon";
import LoadingState from "../components/ui/LoadingState";
import PageHeader from "../components/ui/PageHeader";

import {
    createReminder,
    deleteReminder,
    getAllReminders,
    updateReminder
} from "../services/reminderService";
import { getAllNotes } from "../services/noteService";
import {
    formatReminderTime,
    istNowInputValue,
    toIstInputValue
} from "../utils/reminderTime";

/*
 * Component Name : ReminderPage
 * Description    : Lists, schedules, updates and deletes user reminders.
 * Author         : Utakarsh Jain
 * Date           : 26/11/2026
 */

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

    useEffect(() => {
        const timer = setInterval(() => {
            fetchReminders();
        }, 30000);

        return () => clearInterval(timer);
    }, [fetchReminders]);

    const istMin = istNowInputValue();

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

        if (reminderTime <= istNowInputValue()) {
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
        setEditTime(toIstInputValue(reminder.reminderTime));
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

        if (editTime <= istNowInputValue()) {
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
                <LoadingState label="Loading reminders..." />
            </main>
        );
    }

    return (
        <main className="page-content">
            <PageHeader
                title="Reminders"
                description="Keep track of every reminder you have scheduled."
                count={reminders.length}
                countLabel={reminders.length === 1 ? "reminder" : "reminders"}
            />

            <div className="info-banner">
                <span className="info-banner-icon">
                    <Icon name="reminder" size={18} />
                </span>
                Reminders are delivered to your registered email address.
                All times are shown in IST (Asia/Kolkata). Completed reminders
                are cleared automatically.
            </div>

            <section className="reminder-section">
                <h2>Scheduled reminders</h2>

                {reminders.length === 0 ? (
                    <EmptyState
                        icon="reminder"
                        title="No reminders scheduled"
                        description="Schedule a reminder for a note below."
                    />
                ) : (
                    <div className="reminder-list">
                        {reminders.map((reminder) => (
                            <article className="reminder-item" key={reminder.id}>
                                <div className="reminder-item-main">
                                    <h3>{reminder.noteTitle}</h3>
                                    <p className="reminder-time">
                                        <Icon name="reminder" size={15} />
                                        {formatReminderTime(reminder.reminderTime)}
                                    </p>
                                </div>

                                <div className="reminder-actions">
                                    <ActionButton
                                        icon="edit"
                                        label="Edit"
                                        ariaLabel={`Edit reminder for ${reminder.noteTitle}`}
                                        onClick={() => openEditForm(reminder)}
                                    />

                                    <ActionButton
                                        icon="trash"
                                        label="Delete"
                                        ariaLabel={`Delete reminder for ${reminder.noteTitle}`}
                                        className="danger"
                                        disabled={busyId === reminder.id}
                                        onClick={() => handleDeleteReminder(reminder)}
                                    />
                                </div>

                                {editingReminderId === reminder.id && (
                                    <div className="reminder-edit">
                                        <input
                                            className="input"
                                            type="datetime-local"
                                            min={istMin}
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
                                            min={istMin}
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
