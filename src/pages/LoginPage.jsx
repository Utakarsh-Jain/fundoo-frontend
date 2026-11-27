import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthHero from "../components/ui/AuthHero";
import { loginUser, resendVerificationEmail } from "../services/authService";
import { setToken } from "../utils/token";

/*
 * Component Name : LoginPage
 * Description    : Handles user login and JWT authentication.
 * Author         : Utakarsh Jain
 * Date           : 25/11/2026
 */

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [message, setMessage] = useState(
        location.state?.message || ""
    );
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await loginUser(formData);
            setToken(response.token);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!formData.email) {
            setMessage("Enter your email address first.");
            return;
        }

        setResending(true);
        setMessage("");

        try {
            const response = await resendVerificationEmail(formData.email);
            setMessage(
                response.message ||
                "If the account exists, a verification email has been sent."
            );
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to resend the verification email."
            );
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-shell">
            <AuthHero
                title="Your ideas, beautifully organised."
                description="A calm home for every note, label and reminder — always in sync with your account."
                tags={[
                    { icon: "edit", label: "Quick notes" },
                    { icon: "label", label: "Smart labels" },
                    { icon: "reminder", label: "Reminders" }
                ]}
            />

            <section className="auth-pane">
                <div className="auth-card">
                    <h2>Welcome back</h2>
                    <p className="auth-subtitle">
                        Log in to pick up right where you left off.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <label className="form-field">
                            <span>Email address</span>
                            <input
                                className="input"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                        </label>

                        <label className="form-field">
                            <span>Password</span>
                            <input
                                className="input"
                                type="password"
                                name="password"
                                placeholder="Your password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        <div className="auth-form-links">
                            <button
                                type="button"
                                className="btn-link"
                                onClick={() => navigate("/forgot-password", {
                                    state: { email: formData.email }
                                })}
                            >
                                Forgot password?
                            </button>
                        </div>
                    </form>

                    {message && <div className="alert">{message}</div>}

                    {/verif/i.test(message) && (
                        <div className="auth-form-links">
                            <button
                                type="button"
                                className="btn-link"
                                onClick={handleResendVerification}
                                disabled={resending}
                            >
                                {resending
                                    ? "Sending..."
                                    : "Resend verification email"}
                            </button>
                        </div>
                    )}

                    <p className="auth-switch">
                        Don&apos;t have an account?{" "}
                        <button
                            type="button"
                            className="btn-link"
                            onClick={() => navigate("/register")}
                        >
                            Create one
                        </button>
                    </p>
                </div>
            </section>
        </div>
    );
}

export default LoginPage;
