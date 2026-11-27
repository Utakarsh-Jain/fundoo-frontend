import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../services/authService";

function VerifyEmailPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const attempted = useRef(false);

    const [status, setStatus] = useState(token ? "verifying" : "error");
    const [message, setMessage] = useState(
        token ? "" : "Verification link is invalid or missing."
    );

    useEffect(() => {
        if (!token || attempted.current) {
            return;
        }

        attempted.current = true;

        verifyEmail(token)
            .then((response) => {
                setStatus("success");
                setMessage(
                    response.message || "Email verified successfully."
                );
            })
            .catch((error) => {
                setStatus("error");
                setMessage(
                    error.response?.data?.message ||
                    "Unable to verify your email."
                );
            });
    }, [token]);

    return (
        <div className="auth-shell">
            <section className="auth-hero">
                <div className="auth-logo">
                    <span className="auth-logo-mark">✦</span>
                    Fundoo Notes
                </div>

                <div className="auth-hero-copy">
                    <h1>One small step to secure notes.</h1>
                    <p>
                        Email verification keeps your account protected and
                        your reminders tied to the right inbox.
                    </p>
                    <div className="auth-hero-tags">
                        <span>✉️ Verified email</span>
                        <span>🔐 Safer access</span>
                        <span>✦ Ready to note</span>
                    </div>
                </div>

                <div className="auth-hero-footer">
                    Simple, focused and made for your everyday thoughts.
                </div>
            </section>

            <section className="auth-pane">
                <div className="auth-card">
                    <h2>Verify email</h2>
                    <p className="auth-subtitle">
                        Confirming your email address.
                    </p>

                    <div
                        className={`alert ${
                            status === "success" ? "success" : ""
                        }`}
                        role="status"
                    >
                        {status === "verifying"
                            ? "Verifying your email..."
                            : message}
                    </div>

                    {status !== "verifying" && (
                        <p className="auth-switch">
                            <button
                                type="button"
                                className="btn-link"
                                onClick={() => navigate("/login")}
                            >
                                Continue to login
                            </button>
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}

export default VerifyEmailPage;
