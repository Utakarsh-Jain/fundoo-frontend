import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import Icon from "../components/ui/Icon";
import LoadingState from "../components/ui/LoadingState";
import PageHeader from "../components/ui/PageHeader";
import { getProfile } from "../services/profileService";

/*
 * Component Name : ProfilePage
 * Description    : Loads and displays the authenticated user's backend profile.
 * Author         : Utakarsh Jain
 * Date           : 27/11/2026
 */

// Builds the avatar initials from the backend-provided name.
const getInitials = (name) => {
    const parts = (name || "").trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.charAt(0) || "?";
    const second = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";

    return `${first}${second}`.toUpperCase();
};

function ProfilePage() {
    const { notify } = useOutletContext() || {};

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetches the current user's profile from the backend API.
    const loadProfile = useCallback(() => {
        setLoading(true);
        setError("");

        return getProfile()
            .then((response) => {
                setProfile({
                    name: response.firstName || "",
                    email: response.email || ""
                });
            })
            .catch((fetchError) => {
                const message = fetchError.response?.data?.message
                    || "Failed to load profile.";

                setError(message);

                if (notify) {
                    notify(message, "error");
                }
            })
            .finally(() => setLoading(false));
    }, [notify]);

    useEffect(() => {
        Promise.resolve().then(loadProfile);
    }, [loadProfile]);

    if (loading) {
        return (
            <main className="page-content profile-page">
                <PageHeader
                    title="Profile"
                    description="Manage how your account appears across your workspace."
                />
                <LoadingState label="Loading profile..." />
            </main>
        );
    }

    if (error) {
        return (
            <main className="page-content profile-page">
                <PageHeader
                    title="Profile"
                    description="Manage how your account appears across your workspace."
                />
                <section className="profile-card profile-error" role="alert">
                    <h2>Unable to load profile</h2>
                    <p>{error}</p>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={loadProfile}
                    >
                        Try again
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="page-content profile-page">
            <PageHeader
                title="Profile"
                description="Manage how your account appears across your workspace."
            />

            <div className="profile-layout">
                <section className="profile-card profile-summary">
                    <div className="profile-avatar">{getInitials(profile.name)}</div>
                    <h2>{profile.name}</h2>
                    <p className="profile-email">
                        <Icon name="mail" size={15} />
                        {profile.email}
                    </p>
                </section>

                <section className="profile-card profile-details-card">
                    <h2>Profile details</h2>
                    <p className="profile-card-hint">
                        These details are loaded from your account.
                    </p>

                    <dl className="profile-detail-list">
                        <div>
                            <dt>Name</dt>
                            <dd>{profile.name}</dd>
                        </div>
                        <div>
                            <dt>Email address</dt>
                            <dd>{profile.email}</dd>
                        </div>
                    </dl>

                    <button
                        type="button"
                        className="btn btn-link profile-refresh"
                        onClick={loadProfile}
                    >
                        Refresh profile
                    </button>
                </section>
            </div>
        </main>
    );
}

export default ProfilePage;
