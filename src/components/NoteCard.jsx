import { useState } from "react";

import { istNowInputValue } from "../utils/reminderTime";

/*
 * Component Name : NoteCard
 * Description    : Displays note details and manages note operations and labels.
 * Author         : Utakarsh Jain
 * Date           : 26/11/2026
 */

function NoteCard({
    note,
    labels = [],
    onPin,
    onArchive,
    onTrash,
    onSetReminder,
    onAssignLabel,
    onRemoveLabel,
    onNotify
}) {

    const [reminderTime, setReminderTime] = useState("");
    const [showLabels, setShowLabels] = useState(false);
    const [showReminder, setShowReminder] = useState(false);

    const assignedLabels = note.labels || [];
    const istMin = istNowInputValue();

    const handleReminder = () => {
        if (!reminderTime) {
            return;
        }

        if (reminderTime <= istNowInputValue()) {
            onNotify("Please select a future date and time.", "error");
            return;
        }

        onSetReminder(note.id, reminderTime);
        setReminderTime("");
        setShowReminder(false);
    };

    const handleLabelChange = (labelId) => {
        const isAssigned = assignedLabels.some(
            (label) => label.id === labelId
        );

        if (isAssigned) {
            onRemoveLabel(labelId, note.id);
        } else {
            onAssignLabel(labelId, note.id);
        }
    };

    return (
        <article className={`note-card ${note.pinned ? "pinned" : ""}`}>
            <div className="note-card-top">
                <h3>{note.title}</h3>
                {note.pinned && (
                    <span className="pin-badge" title="Pinned note">📌</span>
                )}
            </div>

            <p className="note-description">{note.description}</p>

            {assignedLabels.length > 0 && (
                <div className="chip-row">
                    {assignedLabels.map((label) => (
                        <span className="chip" key={label.id}>
                            {label.name}
                            <button
                                type="button"
                                onClick={() => onRemoveLabel(label.id, note.id)}
                                title="Remove label"
                                aria-label={`Remove ${label.name}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {(note.archived || note.trashed) && (
                <div className="status-row">
                    {note.archived && (
                        <span className="status-badge archived">Archived</span>
                    )}
                    {note.trashed && (
                        <span className="status-badge trashed">In trash</span>
                    )}
                </div>
            )}

            {showLabels && (
                <div className="label-picker">
                    <p>Assign labels</p>
                    {labels.length === 0 ? (
                        <p>Create a label from the sidebar first.</p>
                    ) : (
                        labels.map((label) => (
                            <label className="label-option" key={label.id}>
                                <input
                                    type="checkbox"
                                    checked={assignedLabels.some(
                                        (item) => item.id === label.id
                                    )}
                                    onChange={() => handleLabelChange(label.id)}
                                />
                                {label.name}
                            </label>
                        ))
                    )}
                </div>
            )}

            {showReminder && (
                <div className="reminder-box">
                    <div className="reminder-inline">
                        <input
                            className="input"
                            type="datetime-local"
                            value={reminderTime}
                            min={istMin}
                            onChange={(e) => setReminderTime(e.target.value)}
                            aria-label="Reminder date and time"
                        />
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleReminder}
                            disabled={!reminderTime}
                        >
                            Set
                        </button>
                    </div>
                </div>
            )}

            <div className="note-actions">
                <button
                    type="button"
                    className="action-btn"
                    onClick={() => onPin(note.id)}
                >
                    <span className="emoji">📌</span>
                    {note.pinned ? "Unpin" : "Pin"}
                </button>

                <button
                    type="button"
                    className="action-btn"
                    onClick={() => onArchive(note.id)}
                >
                    <span className="emoji">📦</span>
                    {note.archived ? "Unarchive" : "Archive"}
                </button>

                <button
                    type="button"
                    className="action-btn danger"
                    onClick={() => onTrash(note.id)}
                >
                    <span className="emoji">🗑️</span>
                    {note.trashed ? "Restore" : "Trash"}
                </button>

                <button
                    type="button"
                    className="action-btn"
                    onClick={() => setShowLabels(!showLabels)}
                >
                    <span className="emoji">🏷️</span>
                    Labels
                </button>

                <button
                    type="button"
                    className="action-btn"
                    onClick={() => setShowReminder(!showReminder)}
                >
                    <span className="emoji">⏰</span>
                    Remind
                </button>
            </div>
        </article>
    );
}

export default NoteCard;
