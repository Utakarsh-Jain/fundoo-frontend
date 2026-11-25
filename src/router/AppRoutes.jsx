
import { Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";

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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/register" />} />
        </Routes>
    );
}

export default AppRoutes;
