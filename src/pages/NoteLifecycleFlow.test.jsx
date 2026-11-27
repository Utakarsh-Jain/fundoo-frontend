import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";

const notify = vi.fn();

const mocks = vi.hoisted(() => ({
    getAllNotes: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
    restoreNote: vi.fn(),
    permanentlyDeleteNote: vi.fn(),
    togglePin: vi.fn(),
    toggleArchive: vi.fn(),
    toggleTrash: vi.fn(),
    createReminder: vi.fn(),
    assignLabelToNote: vi.fn(),
    removeLabelFromNote: vi.fn()
}));

vi.mock("../services/noteService", () => ({
    getAllNotes: mocks.getAllNotes,
    createNote: mocks.createNote,
    updateNote: mocks.updateNote,
    restoreNote: mocks.restoreNote,
    permanentlyDeleteNote: mocks.permanentlyDeleteNote,
    togglePin: mocks.togglePin,
    toggleArchive: mocks.toggleArchive,
    toggleTrash: mocks.toggleTrash
}));

vi.mock("../services/reminderService", () => ({
    createReminder: mocks.createReminder
}));

vi.mock("../services/labelService", () => ({
    assignLabelToNote: mocks.assignLabelToNote,
    removeLabelFromNote: mocks.removeLabelFromNote
}));

import DashboardPage from "./DashboardPage";
import TrashPage from "./TrashPage";

let notes = [];

function renderPage(Page) {
    return render(
        <MemoryRouter initialEntries={["/"]}>
            <Routes>
                <Route
                    element={
                        <Outlet
                            context={{
                                labels: [],
                                selectedLabel: null,
                                searchQuery: "",
                                notify
                            }}
                        />
                    }
                >
                    <Route path="/" element={<Page />} />
                </Route>
            </Routes>
        </MemoryRouter>
    );
}

describe("note lifecycle flow", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        notes = [{
            id: 10,
            title: "Project",
            description: "Project note",
            pinned: false,
            archived: false,
            trashed: false
        }];

        mocks.getAllNotes.mockImplementation(async () => notes);
        mocks.updateNote.mockImplementation(async (noteId, noteData) => {
            notes = notes.map((note) => note.id === noteId
                ? { ...note, ...noteData }
                : note);
            return notes.find((note) => note.id === noteId);
        });
        mocks.restoreNote.mockImplementation(async (noteId) => {
            notes = notes.map((note) => note.id === noteId
                ? { ...note, trashed: false }
                : note);
            return notes.find((note) => note.id === noteId);
        });
        mocks.permanentlyDeleteNote.mockImplementation(async (noteId) => {
            notes = notes.filter((note) => note.id !== noteId);
        });
    });

    it("updates a note and refreshes the dashboard", async () => {
        const user = userEvent.setup();
        renderPage(DashboardPage);

        await screen.findByRole("heading", { name: "Project" });
        await user.click(screen.getByRole("button", { name: /Edit/ }));

        fireEvent.change(
            screen.getByLabelText("Edit title for Project"),
            { target: { value: "Updated Project" } }
        );
        await user.click(screen.getByRole("button", { name: "Save" }));

        await waitFor(() => {
            expect(mocks.updateNote).toHaveBeenCalledWith(10, {
                title: "Updated Project",
                description: "Project note"
            });
        });
        expect(await screen.findByRole("heading", { name: "Updated Project" }))
            .toBeInTheDocument();
    });

    it("restores a trashed note from the trash page", async () => {
        const user = userEvent.setup();
        notes = [{
            id: 20,
            title: "Deleted",
            description: "Deleted note",
            pinned: false,
            archived: false,
            trashed: true
        }];
        renderPage(TrashPage);

        await screen.findByRole("heading", { name: "Deleted" });
        await user.click(screen.getByRole("button", { name: /Restore/ }));

        await waitFor(() => {
            expect(mocks.restoreNote).toHaveBeenCalledWith(20);
        });
        await waitFor(() => {
            expect(screen.queryByRole("heading", { name: "Deleted" }))
                .not.toBeInTheDocument();
        });
    });

    it("permanently deletes a trashed note from the trash page", async () => {
        const user = userEvent.setup();
        notes = [{
            id: 20,
            title: "Deleted",
            description: "Deleted note",
            pinned: false,
            archived: false,
            trashed: true
        }];
        renderPage(TrashPage);

        await screen.findByRole("heading", { name: "Deleted" });
        await user.click(
            screen.getByRole("button", { name: /Delete forever/ })
        );

        await waitFor(() => {
            expect(mocks.permanentlyDeleteNote).toHaveBeenCalledWith(20);
        });
        expect(await screen.findByText("Trash is empty")).toBeInTheDocument();
    });
});
