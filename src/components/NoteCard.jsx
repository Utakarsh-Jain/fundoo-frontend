import { useState } from "react";

import { istNowInputValue } from "../utils/reminderTime";
import ActionButton from "./ui/ActionButton";
import Icon from "./ui/Icon";

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
    onUpdate,
    onRestore,
    onPermanentlyDelete,
    onSetReminder,
    onAssignLabel,
    onRemoveLabel,
    onNotify
}) {

    const [reminderTime, setReminderTime] = useState("");
    const [showLabels, setShowLabels] = useState(false);
    const [showReminder, setShowReminder] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState({
        title: note.title,
        description: note.description || ""
    });

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

    const openEdit = () => {
        setEditForm({
            title: note.title,
            description: note.description || ""
        });
        setShowEdit(true);
    };

    const handleEditChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        const title = editForm.title.trim();

        if (!title) {
            onNotify("Note title is required.", "error");
            return;
        }

        await onUpdate(note.id, {
            title,
            description: editForm.description
        });
        setShowEdit(false);
    };

    return (
        <article className={`note-card ${note.pinned ? "pinned" : ""}`}>
            <div className="note-card-top">
                <h3>{note.title}</h3>
                {note.pinned && (
                    <span className="pin-badge" title="Pinned note">
                        <Icon name="pin" size={14} />
                    </span>
                )}
            </div>

            <p className="note-description">{note.description}</p>

            {showEdit && (
                <form className="note-edit-form" onSubmit={handleUpdate}>
                    <input
                        className="input"
                        type="text"
                        name="title"
                        value={editForm.title}
                        onChange={handleEditChange}
                        aria-label={`Edit title for ${note.title}`}
                        required
                    />
                    <textarea
                        className="input"
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                        aria-label={`Edit description for ${note.title}`}
                    />
                    <div className="note-edit-actions">
                        <button
                            type="button"
                            className="btn btn-link"
                            onClick={() => setShowEdit(false)}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Save
                        </button>
                    </div>
                </form>
            )}

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
                                        <Icon name="close" size={13} />
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
                {note.trashed ? (
                    <>
                        <ActionButton
                            icon="restore"
                            label="Restore"
                            onClick={() => onRestore(note.id)}
                        />

                        <ActionButton
                            icon="close"
                            label="Delete forever"
                            className="danger"
                            onClick={() => onPermanentlyDelete(note.id)}
                        />
                    </>
                ) : (
                    <>
                        <ActionButton
                            icon="edit"
                            label="Edit"
                            onClick={openEdit}
                        />

                        <ActionButton
                            icon="pin"
                            label={note.pinned ? "Unpin" : "Pin"}
                            onClick={() => onPin(note.id)}
                        />

                        <ActionButton
                            icon="archive"
                            label={note.archived ? "Unarchive" : "Archive"}
                            onClick={() => onArchive(note.id)}
                        />

                        <ActionButton
                            icon="trash"
                            label="Trash"
                            className="danger"
                            onClick={() => onTrash(note.id)}
                        />

                        <ActionButton
                            icon="label"
                            label="Labels"
                            onClick={() => setShowLabels(!showLabels)}
                        />

                        <ActionButton
                            icon="reminder"
                            label="Remind"
                            onClick={() => setShowReminder(!showReminder)}
                        />
                    </>
                )}
            </div>
        </article>
    );
}

export default NoteCard;
