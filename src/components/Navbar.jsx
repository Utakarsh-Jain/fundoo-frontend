import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/*
 * Component Name : Navbar
 * Description    : Provides sidebar navigation and label management.
 * Author         : Utakarsh Jain
 * Date           : 26/11/2026
 */

const NAV_ITEMS = [
    { path: "/dashboard", label: "Notes", icon: "📝" },
    { path: "/reminders", label: "Reminders", icon: "⏰" },
    { path: "/archive", label: "Archive", icon: "📦" },
    { path: "/trash", label: "Trash", icon: "🗑️" }
];

function Navbar({
    labels = [],
    selectedLabel,
    onSelectLabel,
    onCreateLabel,
    onDeleteLabel,
    onLogout,
    open,
    onClose
}) {

    const navigate = useNavigate();
    const location = useLocation();

    const [showLabelInput, setShowLabelInput] = useState(false);
    const [labelName, setLabelName] = useState("");

    const handleCreateLabel = async (e) => {
        e.preventDefault();

        if (!labelName.trim()) {
            return;
        }

        await onCreateLabel(labelName.trim());

        setLabelName("");
        setShowLabelInput(false);
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
                <span className="brand-mark">✦</span>
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
                        <span className="nav-icon">{item.icon}</span>
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
                    onClick={() => setShowLabelInput(!showLabelInput)}
                >
                    {showLabelInput ? "−" : "+"}
                </button>
            </div>

            {showLabelInput && (
                <form className="label-form" onSubmit={handleCreateLabel}>
                    <input
                        className="input"
                        type="text"
                        placeholder="Label name"
                        value={labelName}
                        onChange={(e) => setLabelName(e.target.value)}
                        maxLength={50}
                        required
                        autoFocus
                    />

                    <div className="label-form-actions">
                        <button
                            type="button"
                            className="btn btn-link"
                            onClick={() => {
                                setShowLabelInput(false);
                                setLabelName("");
                            }}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Save
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
                                <span className="nav-icon">🏷️</span>
                                <span>{label.name}</span>
                            </button>

                            <button
                                type="button"
                                className="icon-button label-delete"
                                title="Delete label"
                                aria-label={`Delete ${label.name}`}
                                onClick={() => onDeleteLabel(label.id)}
                            >
                                ×
                            </button>
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
                    <span className="nav-icon">↪</span>
                    Logout
                </button>
            </div>
        </aside>
    );
}

export default Navbar;
