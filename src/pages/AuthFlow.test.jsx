import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mocks = vi.hoisted(() => ({
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    resendVerificationEmail: vi.fn(),
    verifyEmail: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    logoutUser: vi.fn(),
    getAllLabels: vi.fn(),
    createLabel: vi.fn(),
    updateLabel: vi.fn(),
    deleteLabel: vi.fn()
}));

vi.mock("../services/authService", () => ({
    registerUser: mocks.registerUser,
    loginUser: mocks.loginUser,
    resendVerificationEmail: mocks.resendVerificationEmail,
    verifyEmail: mocks.verifyEmail,
    requestPasswordReset: mocks.requestPasswordReset,
    resetPassword: mocks.resetPassword,
    logoutUser: mocks.logoutUser
}));

vi.mock("../services/labelService", () => ({
    getAllLabels: mocks.getAllLabels,
    createLabel: mocks.createLabel,
    updateLabel: mocks.updateLabel,
    deleteLabel: mocks.deleteLabel
}));

import ForgotPasswordPage from "./ForgotPasswordPage";
import ResetPasswordPage from "./ResetPasswordPage";
import VerifyEmailPage from "./VerifyEmailPage";
import AppLayout from "../layouts/AppLayout";

describe("auth enhancement flows", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("requests a password reset link", async () => {
        const user = userEvent.setup();
        mocks.requestPasswordReset.mockResolvedValue({
            message: "If the account exists, a password reset email has been sent."
        });

        render(
            <MemoryRouter>
                <ForgotPasswordPage />
            </MemoryRouter>
        );

        await user.type(
            screen.getByLabelText("Email address"),
            "user@example.com"
        );
        await user.click(
            screen.getByRole("button", { name: "Send reset link" })
        );

        await waitFor(() => {
            expect(mocks.requestPasswordReset).toHaveBeenCalledWith(
                "user@example.com"
            );
        });
        expect(await screen.findByText(
            "If the account exists, a password reset email has been sent."
        )).toBeInTheDocument();
    });

    it("rejects a reset attempt without a token", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/reset-password"]}>
                <Routes>
                    <Route
                        path="/reset-password"
                        element={<ResetPasswordPage />}
                    />
                </Routes>
            </MemoryRouter>
        );

        await user.type(
            screen.getByLabelText("New password"),
            "NewPassword123"
        );
        await user.type(
            screen.getByLabelText("Confirm password"),
            "NewPassword123"
        );
        await user.click(
            screen.getByRole("button", { name: "Reset Password" })
        );

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Reset link is invalid or missing."
        );
        expect(mocks.resetPassword).not.toHaveBeenCalled();
    });

    it("submits a password reset with the emailed token", async () => {
        const user = userEvent.setup();
        mocks.resetPassword.mockResolvedValue({
            message: "Password reset successfully."
        });

        render(
            <MemoryRouter initialEntries={[
                "/reset-password?token=reset-token-123"
            ]}>
                <Routes>
                    <Route
                        path="/reset-password"
                        element={<ResetPasswordPage />}
                    />
                    <Route
                        path="/login"
                        element={<div>Login route</div>}
                    />
                </Routes>
            </MemoryRouter>
        );

        await user.type(
            screen.getByLabelText("New password"),
            "NewPassword123"
        );
        await user.type(
            screen.getByLabelText("Confirm password"),
            "NewPassword123"
        );
        await user.click(
            screen.getByRole("button", { name: "Reset Password" })
        );

        await waitFor(() => {
            expect(mocks.resetPassword).toHaveBeenCalledWith(
                "reset-token-123",
                "NewPassword123"
            );
        });
        expect(await screen.findByText("Login route")).toBeInTheDocument();
    });

    it("verifies an email from the link token", async () => {
        mocks.verifyEmail.mockResolvedValue({
            message: "Email verified successfully."
        });

        render(
            <MemoryRouter initialEntries={[
                "/verify-email?token=verify-token-123"
            ]}>
                <Routes>
                    <Route
                        path="/verify-email"
                        element={<VerifyEmailPage />}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText("Email verified successfully."))
            .toBeInTheDocument();
        expect(mocks.verifyEmail).toHaveBeenCalledWith("verify-token-123");
    });

    it("calls the logout API before clearing the local token", async () => {
        const user = userEvent.setup();
        localStorage.setItem("token", "jwt-token");
        mocks.getAllLabels.mockResolvedValue([]);
        mocks.logoutUser.mockResolvedValue({
            message: "Logged out successfully."
        });

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route
                            path="/dashboard"
                            element={<div>Dashboard route</div>}
                        />
                    </Route>
                    <Route
                        path="/login"
                        element={<div>Login route</div>}
                    />
                </Routes>
            </MemoryRouter>
        );

        await user.click(
            await screen.findByRole("button", { name: /logout/i })
        );

        await waitFor(() => {
            expect(mocks.logoutUser).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(localStorage.getItem("token")).toBeNull();
        });
        expect(await screen.findByText("Login route")).toBeInTheDocument();
    });
});
