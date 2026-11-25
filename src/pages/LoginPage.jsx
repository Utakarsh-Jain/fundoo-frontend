
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

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Updates login form fields.
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Authenticates user and stores JWT token.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await loginUser(formData);

            setToken(response.token);
            navigate("/dashboard");
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
        <div>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p>{message}</p>

            <p>
                Don't have an account?{" "}
                <button onClick={() => navigate("/register")}>
                    Register
                </button>
            </p>
        </div>
    );
}

export default LoginPage;
