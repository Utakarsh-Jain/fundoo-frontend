import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthHero from "../components/ui/AuthHero";
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
            navigate("/login", {
                replace: true,
                state: {
                    message:
                        "Account created. Check your email to verify your account."
                }
            });
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
            <AuthHero
                title="Start with a blank page. End with clarity."
                description="Create your free account and keep every thought, task and reminder in one tidy place."
                tags={[
                    { icon: "edit", label: "Quick notes" },
                    { icon: "label", label: "Smart labels" },
                    { icon: "reminder", label: "Reminders" }
                ]}
            />

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
