import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import AuthHero from "../components/ui/AuthHero";
import { resetPassword } from "../services/authService";

function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!token) {
            setMessage("Reset link is invalid or missing.");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await resetPassword(
                token,
                formData.newPassword
            );
            navigate("/login", {
                replace: true,
                state: {
                    message:
                        response.message || "Password reset successfully."
                }
            });
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to reset your password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <AuthHero
                title="Choose a fresh password."
                description="Use at least six characters and keep it unique to your Fundoo account."
                tags={[
                    { icon: "lock", label: "New start" },
                    { icon: "check", label: "Quick step" },
                    { icon: "note", label: "Back to notes" }
                ]}
            />

            <section className="auth-pane">
                <div className="auth-card">
                    <h2>Reset password</h2>
                    <p className="auth-subtitle">
                        Set a new password for your account.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <label className="form-field">
                            <span>New password</span>
                            <input
                                className="input"
                                type="password"
                                name="newPassword"
                                placeholder="At least 6 characters"
                                value={formData.newPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                                minLength={6}
                                required
                            />
                        </label>

                        <label className="form-field">
                            <span>Confirm password</span>
                            <input
                                className="input"
                                type="password"
                                name="confirmPassword"
                                placeholder="Repeat your new password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                                minLength={6}
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>

                    {message && (
                        <div className="alert" role="alert">
                            {message}
                        </div>
                    )}

                    <p className="auth-switch">
                        Need a new link?{" "}
                        <button
                            type="button"
                            className="btn-link"
                            onClick={() => navigate("/forgot-password")}
                        >
                            Request another
                        </button>
                    </p>
                </div>
            </section>
        </div>
    );
}

export default ResetPasswordPage;
