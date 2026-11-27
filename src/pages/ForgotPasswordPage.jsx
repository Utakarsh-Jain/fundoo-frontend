import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AuthHero from "../components/ui/AuthHero";
import { requestPasswordReset } from "../services/authService";

function ForgotPasswordPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState(location.state?.email || "");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await requestPasswordReset(email);
            setMessage(
                response.message ||
                "If the account exists, a password reset email has been sent."
            );
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to request a password reset."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <AuthHero
                title="Reset your password with ease."
                description="We will email you a secure link if an account exists for the address you enter."
                tags={[
                    { icon: "mail", label: "Secure link" },
                    { icon: "reminder", label: "Time limited" },
                    { icon: "lock", label: "Private" }
                ]}
            />

            <section className="auth-pane">
                <div className="auth-card">
                    <h2>Forgot password</h2>
                    <p className="auth-subtitle">
                        Enter your email to receive a reset link.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <label className="form-field">
                            <span>Email address</span>
                            <input
                                className="input"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send reset link"}
                        </button>
                    </form>

                    {message && <div className="alert">{message}</div>}

                    <p className="auth-switch">
                        Remembered your password?{" "}
                        <button
                            type="button"
                            className="btn-link"
                            onClick={() => navigate("/login")}
                        >
                            Back to login
                        </button>
                    </p>
                </div>
            </section>
        </div>
    );
}

export default ForgotPasswordPage;
