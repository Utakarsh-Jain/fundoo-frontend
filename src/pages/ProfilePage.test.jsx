import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";

const notify = vi.fn();

const mocks = vi.hoisted(() => ({
    getProfile: vi.fn()
}));

vi.mock("../services/profileService", () => ({
    getProfile: mocks.getProfile
}));

import ProfilePage from "./ProfilePage";

// Renders the profile page inside the same outlet context used by the app shell.
function renderPage() {
    return render(
        <MemoryRouter initialEntries={["/"]}>
            <Routes>
                <Route
                    element={<Outlet context={{ notify }} />}
                >
                    <Route path="/" element={<ProfilePage />} />
                </Route>
            </Routes>
        </MemoryRouter>
    );
}

describe("profile page", () => {
    beforeEach(() => {
        mocks.getProfile.mockReset();
        notify.mockClear();
    });

    it("displays the profile fetched from the backend", async () => {
        mocks.getProfile.mockResolvedValue({
            firstName: "Asha Rao",
            email: "asha@example.com"
        });

        renderPage();

        expect(await screen.findByRole("heading", { name: "Asha Rao" }))
            .toBeInTheDocument();
        expect((await screen.findAllByText("asha@example.com")).length)
            .toBeGreaterThan(0);
        expect(mocks.getProfile).toHaveBeenCalledTimes(1);
    });

    it("shows an error when the backend fetch fails", async () => {
        mocks.getProfile.mockRejectedValue({
            response: { data: { message: "Failed to load profile." } }
        });

        renderPage();

        expect(await screen.findByRole("alert"))
            .toHaveTextContent("Failed to load profile.");
        expect(notify).toHaveBeenCalledWith(
            "Failed to load profile.",
            "error"
        );
    });
});
