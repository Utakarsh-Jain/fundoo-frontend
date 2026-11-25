import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

/*
 * Component Name : RegisterPage
 * Description    : Handles new user registration.
 * Author         : Utakarsh Jain
 * Date           : 25/11/2026
 */

function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        email: "",
        password: ""
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
        setLoading(true);
        setMessage("");

        try {
            await registerUser(formData);
            navigate("/login", { replace: true });
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Registration failed. Please try again."
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
                    <h1>Start with a blank page. End with clarity.</h1>
                    <p>
                        Create your free account and keep every thought, task
                        and reminder in one tidy place.
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
                    <h2>Create your account</h2>
                    <p className="auth-subtitle">
                        It only takes a minute to get organised.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <label className="form-field">
                            <span>First name</span>
                            <input
                                className="input"
                                type="text"
                                name="firstName"
                                placeholder="Your first name"
                                value={formData.firstName}
                                onChange={handleChange}
                                autoComplete="given-name"
                                required
                            />
                        </label>

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
                                placeholder="Choose a password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    {message && <div className="alert">{message}</div>}

                    <p className="auth-switch">
                        Already have an account?{" "}
                        <button
                            type="button"
                            className="btn-link"
                            onClick={() => navigate("/login")}
                        >
                            Login instead
                        </button>
                    </p>
                </div>
            </section>
        </div>
    );
}

export default RegisterPage;
