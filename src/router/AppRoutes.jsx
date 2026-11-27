import { Routes, Route, Navigate } from "react-router-dom";

import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import DashboardPage from "../pages/DashboardPage";
import ReminderPage from "../pages/ReminderPage";
import ArchivePage from "../pages/ArchivePage";
import TrashPage from "../pages/TrashPage";
import AttachmentPage from "../pages/AttachmentPage";
import ProfilePage from "../pages/ProfilePage";

import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../layouts/AppLayout";

/*
 * Component Name : AppRoutes
 * Description    : Defines public and protected application routes.
 * Author         : Utakarsh Jain
 * Date           : 26/11/2026
 */

function AppRoutes() {

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
            />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Protected Routes with persistent sidebar */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/reminders" element={<ReminderPage />} />
                    <Route path="/archive" element={<ArchivePage />} />
                    <Route path="/trash" element={<TrashPage />} />
                    <Route path="/attachments" element={<AttachmentPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
    );
}

export default AppRoutes;
