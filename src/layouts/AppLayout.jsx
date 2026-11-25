import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import {
    createLabel,
    getAllLabels,
    deleteLabel
} from "../services/labelService";
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

    const handleCreateLabel = async (name) => {
        try {
            await createLabel({ name });
            notify("Label created successfully!");
            await fetchLabels();
        } catch (error) {
            notify(
                error.response?.data?.message || "Failed to create label.",
                "error"
            );
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

    const handleLogout = () => {
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
                onCreateLabel={handleCreateLabel}
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
                        ☰
                    </button>

                    <div className="topbar-search">
                        <SearchBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        />
                    </div>

                    <div className="topbar-right">
                        <span className="avatar" title="Your account">
                            U
                        </span>
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
