import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { setToken } from "../utils/token";

/*
 * Component Name : LoginPage
 * Description    : Handles user login and JWT authentication.
 * Author         : Utakarsh Jain
 * Date           : 25/11/2026
 */

function LoginPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: "", password: "" });
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

    return (
        <div className="auth-shell">
            <section className="auth-hero">
                <div className="auth-logo">
                    <span className="auth-logo-mark">✦</span>
                    Fundoo Notes
                </div>

                <div className="auth-hero-copy">
                    <h1>Your ideas, beautifully organised.</h1>
                    <p>
                        A calm home for every note, label and reminder — always
                        in sync with your account.
                    </p>
                    <div className="auth-hero-tags">
                        <span>✎ Quick notes</span>
                        <span>🏷️ Smart labels</span>
                        <span>⏰ Reminders</span>
                    </div>
                </div>

                <div className="auth-hero-footer">
                    Simple, focused and made for your everyday thoughts.
                </div>
            </section>

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
                    </form>

                    {message && <div className="alert">{message}</div>}

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
