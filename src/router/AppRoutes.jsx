import { Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProtectedRoute from "../components/ProtectedRoute";

/*
 * Component Name : AppRoutes
 * Description    : Defines public and protected application routes.
 * Author         : Utakarsh Jain
 * Date           : 25/11/2026
 */

function AppRoutes() {
    return (
        <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
    );
}

export default AppRoutes;