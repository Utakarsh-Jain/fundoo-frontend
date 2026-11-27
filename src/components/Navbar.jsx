import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Icon from "./ui/Icon";

/*
 * Component Name : Navbar
 * Description    : Provides sidebar navigation and label management.
 * Author         : Utakarsh Jain
 * Date           : 26/11/2026
 */

const NAV_ITEMS = [
    { path: "/dashboard", label: "Notes", icon: "note" },
    { path: "/reminders", label: "Reminders", icon: "reminder" },
    { path: "/archive", label: "Archive", icon: "archive" },
    { path: "/trash", label: "Trash", icon: "trash" },
    { path: "/attachments", label: "Attachments", icon: "attachment" },
    { path: "/profile", label: "Profile", icon: "user" }
];

function Navbar({
    labels = [],
    selectedLabel,
    onSelectLabel,
    onSaveLabel,
    onDeleteLabel,
    onLogout,
    open,
    onClose
}) {

    const navigate = useNavigate();
    const location = useLocation();

    const [showLabelInput, setShowLabelInput] = useState(false);
    const [editingLabelId, setEditingLabelId] = useState(null);
    const [labelName, setLabelName] = useState("");
    const [error, setError] = useState("");

    const closeForm = () => {
        setShowLabelInput(false);
        setEditingLabelId(null);
        setLabelName("");
        setError("");
    };

    const openCreateForm = () => {
        if (showLabelInput && editingLabelId === null) {
            closeForm();
            return;
        }

        setEditingLabelId(null);
        setLabelName("");
        setError("");
        setShowLabelInput(true);
    };

    const openEditForm = (label) => {
        setEditingLabelId(label.id);
        setLabelName(label.name);
        setError("");
        setShowLabelInput(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = labelName.trim();

        if (!name) {
            setError("Label name is required.");
            return;
        }

        if (name.length > 50) {
            setError("Label name cannot exceed 50 characters.");
            return;
        }

        const duplicate = labels.some((label) =>
            label.id !== editingLabelId &&
            label.name.trim().toLowerCase() === name.toLowerCase()
        );

        if (duplicate) {
            setError("You already have a label with this name.");
            return;
        }

        const result = await onSaveLabel(name, editingLabelId);

        if (result?.success) {
            closeForm();
        } else {
            setError(result?.message || "Failed to save label.");
        }
    };

    const handleNavigation = (path) => {
        onSelectLabel(null);
        navigate(path);
        onClose();
    };

    const handleLabelSelect = (labelId) => {
        onSelectLabel(labelId);
        navigate("/dashboard");
        onClose();
    };

    return (
        <aside className={`sidebar ${open ? "open" : ""}`}>
            <div className="brand">
                <span className="brand-mark">
                    <Icon name="logo" size={20} />
                </span>
                <span>Fundoo Notes</span>
            </div>

            <nav>
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.path}
                        type="button"
                        className={`nav-item ${
                            location.pathname === item.path &&
                            (item.path !== "/dashboard" || selectedLabel === null)
                                ? "active"
                                : ""
                        }`}
                        onClick={() => handleNavigation(item.path)}
                    >
                        <span className="nav-icon">
                            <Icon name={item.icon} size={18} />
                        </span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="sidebar-divider" />

            <div className="sidebar-section-title">
                <span>Labels</span>
                <button
                    type="button"
                    className="icon-button"
                    title="Create a new label"
                    aria-label="Create a new label"
                    onClick={openCreateForm}
                >
                    <Icon name={showLabelInput ? "minus" : "plus"} size={18} />
                </button>
            </div>

            {showLabelInput && (
                <form className="label-form" onSubmit={handleSubmit}>
                    <p className="label-form-heading">
                        {editingLabelId === null ? "New label" : "Rename label"}
                    </p>

                    <input
                        className="input"
                        type="text"
                        placeholder="Label name"
                        value={labelName}
                        onChange={(e) => {
                            setLabelName(e.target.value);
                            setError("");
                        }}
                        maxLength={50}
                        required
                        autoFocus
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
                            onClick={closeForm}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editingLabelId === null ? "Save" : "Update"}
                        </button>
                    </div>
                </form>
            )}

            <div>
                {labels.length === 0 ? (
                    <p className="label-empty">No labels yet</p>
                ) : (
                    labels.map((label) => (
                        <div className="label-row" key={label.id}>
                            <button
                                type="button"
                                className={`nav-item ${
                                    selectedLabel === label.id ? "active" : ""
                                }`}
                                onClick={() => handleLabelSelect(label.id)}
                            >
                                <span className="nav-icon">
                                    <Icon name="label" size={18} />
                                </span>
                                <span>{label.name}</span>
                            </button>

                            <div className="label-actions">
                                <button
                                    type="button"
                                    className="icon-button label-edit"
                                    title="Rename label"
                                    aria-label={`Rename ${label.name}`}
                                    onClick={() => openEditForm(label)}
                                >
                                    <Icon name="edit" size={16} />
                                </button>

                                <button
                                    type="button"
                                    className="icon-button label-delete"
                                    title="Delete label"
                                    aria-label={`Delete ${label.name}`}
                                    onClick={() => onDeleteLabel(label.id)}
                                >
                                    <Icon name="close" size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="sidebar-footer">
                <button
                    type="button"
                    className="nav-item logout-btn"
                    onClick={onLogout}
                >
                    <span className="nav-icon">
                        <Icon name="logout" size={18} />
                    </span>
                    Logout
                </button>
            </div>
        </aside>
    );
}

export default Navbar;
