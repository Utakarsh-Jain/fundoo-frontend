import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import Icon from "../components/ui/Icon";
import {
    createLabel,
    updateLabel,
    getAllLabels,
    deleteLabel
} from "../services/labelService";
import { logoutUser } from "../services/authService";
import { removeToken } from "../utils/token";

/*
 * Component Name : AppLayout
 * Description    : Provides persistent sidebar, top bar and feedback UI.
 * Author         : Utakarsh Jain
 * Date           : 26/11/2026
 */

function AppLayout() {

    const navigate = useNavigate();

    const [labels, setLabels] = useState([]);
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const notify = useCallback((message, type = "success") => {
        setToast({ message, type });
    }, []);

    const fetchLabels = useCallback(() => getAllLabels()
        .then((response) => {
            setLabels(Array.isArray(response) ? response : []);
        })
        .catch((error) => {
            notify(
                error.response?.data?.message || "Failed to fetch labels.",
                "error"
            );
        }), [notify]);

    const handleSaveLabel = async (name, labelId = null) => {
        const isUpdate = labelId !== null;

        try {
            if (isUpdate) {
                await updateLabel(labelId, { name });
            } else {
                await createLabel({ name });
            }

            notify(
                isUpdate
                    ? "Label updated successfully!"
                    : "Label created successfully!"
            );
            await fetchLabels();

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message
                || `Failed to ${isUpdate ? "update" : "create"} label.`;

            notify(message, "error");

            return { success: false, message };
        }
    };

    const handleDeleteLabel = async (labelId) => {
        try {
            await deleteLabel(labelId);

            if (selectedLabel === labelId) {
                setSelectedLabel(null);
            }

            notify("Label deleted successfully!");
            await fetchLabels();
        } catch (error) {
            notify(
                error.response?.data?.message || "Failed to delete label.",
                "error"
            );
        }
    };

    const handleLogout = async () => {
        await logoutUser().catch(() => null);
        removeToken();
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        fetchLabels();
    }, [fetchLabels]);

    useEffect(() => {
        if (!toast) {
            return undefined;
        }

        const timer = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(timer);
    }, [toast]);

    return (
        <div className="app-shell">
            {sidebarOpen && (
                <div
                    className="scrim visible"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Navbar
                labels={labels}
                selectedLabel={selectedLabel}
                onSelectLabel={setSelectedLabel}
                onSaveLabel={handleSaveLabel}
                onDeleteLabel={handleDeleteLabel}
                onLogout={handleLogout}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="main-area">
                <header className="topbar">
                    <button
                        type="button"
                        className="menu-toggle"
                        aria-label="Open navigation"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Icon name="menu" size={20} />
                    </button>

                    <div className="topbar-search">
                        <SearchBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        />
                    </div>

                    <div className="topbar-right">
                        <button
                            type="button"
                            className="avatar"
                            title="Your account"
                            aria-label="Open profile"
                            onClick={() => navigate("/profile")}
                        >
                            U
                        </button>
                    </div>
                </header>

                <Outlet context={{
                    selectedLabel,
                    setSelectedLabel,
                    labels,
                    refreshLabels: fetchLabels,
                    searchQuery,
                    notify
                }} />
            </div>

            {toast && (
                <div className={`toast ${toast.type}`} role="status">
                    {toast.message}
                </div>
            )}
        </div>
    );
}

export default AppLayout;
