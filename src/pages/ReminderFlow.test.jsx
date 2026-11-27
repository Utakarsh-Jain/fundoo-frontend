import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";

const notify = vi.fn();

const mocks = vi.hoisted(() => ({
    getAllReminders: vi.fn(),
    createReminder: vi.fn(),
    updateReminder: vi.fn(),
    deleteReminder: vi.fn(),
    getAllNotes: vi.fn()
}));

vi.mock("../services/reminderService", () => ({
    getAllReminders: mocks.getAllReminders,
    createReminder: mocks.createReminder,
    updateReminder: mocks.updateReminder,
    deleteReminder: mocks.deleteReminder
}));

vi.mock("../services/noteService", () => ({
    getAllNotes: mocks.getAllNotes
}));

import ReminderPage from "./ReminderPage";

let reminders = [];
let notes = [];

function toInputValue(value) {
    const date = new Date(value);
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts.map((part) => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

function futureInput(days) {
    return toInputValue(Date.now() + days * 86400000);
}

function renderPage() {
    return render(
        <MemoryRouter initialEntries={["/reminders"]}>
            <Routes>
                <Route
                    element={
                        <Outlet context={{ searchQuery: "", notify }} />
                    }
                >
                    <Route path="/reminders" element={<ReminderPage />} />
                </Route>
            </Routes>
        </MemoryRouter>
    );
}

describe("reminder management flow", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        notify.mockClear();

        reminders = [{
            id: 1,
            noteId: 10,
            noteTitle: "Project",
            reminderTime: new Date(Date.now() + 86400000).toISOString()
        }];

        notes = [
            { id: 10, title: "Project", description: "Project note" },
            { id: 11, title: "Other", description: "Other note" }
        ];

        mocks.getAllReminders.mockImplementation(async () => reminders);
        mocks.getAllNotes.mockImplementation(async () => notes);
        mocks.createReminder.mockImplementation(
            async ({ noteId, reminderTime }) => {
                const note = notes.find((item) => item.id === noteId);
                const created = {
                    id: reminders.length + 1,
                    noteId,
                    noteTitle: note.title,
                    reminderTime
                };
                reminders = [...reminders, created];
                return created;
            }
        );
        mocks.updateReminder.mockImplementation(
            async (reminderId, { reminderTime }) => {
                reminders = reminders.map((reminder) =>
                    reminder.id === reminderId
                        ? { ...reminder, reminderTime }
                        : reminder
                );
                return reminders.find(
                    (reminder) => reminder.id === reminderId
                );
            }
        );
        mocks.deleteReminder.mockImplementation(async (reminderId) => {
            reminders = reminders.filter(
                (reminder) => reminder.id !== reminderId
            );
        });
    });

    it("lists reminders from the API", async () => {
        renderPage();

        expect(await screen.findByRole("heading", { name: "Project" }))
            .toBeInTheDocument();
        expect(screen.getByLabelText("Reminder time for Other"))
            .toBeInTheDocument();
        expect(screen.queryByLabelText("Reminder time for Project"))
            .not.toBeInTheDocument();
        expect(screen.getByText(/All times are shown in IST/))
            .toBeInTheDocument();
    });

    it("updates a reminder and refreshes the list", async () => {
        const user = userEvent.setup();
        renderPage();

        await screen.findByRole("heading", { name: "Project" });
        await user.click(
            screen.getByRole("button", { name: "Edit reminder for Project" })
        );

        const input = screen.getByLabelText(
            "New reminder time for Project"
        );
        const nextTime = futureInput(3);
        fireEvent.change(input, { target: { value: nextTime } });
        await user.click(screen.getByRole("button", { name: "Update" }));

        await waitFor(() => {
            expect(mocks.updateReminder).toHaveBeenCalledWith(1, {
                reminderTime: nextTime
            });
        });
        expect(screen.queryByLabelText("New reminder time for Project"))
            .not.toBeInTheDocument();
    });

    it("deletes a reminder and refreshes the list", async () => {
        const user = userEvent.setup();
        renderPage();

        await screen.findByRole("heading", { name: "Project" });
        await user.click(
            screen.getByRole("button", { name: "Delete reminder for Project" })
        );

        await waitFor(() => {
            expect(mocks.deleteReminder).toHaveBeenCalledWith(1);
        });
        await waitFor(() => {
            expect(screen.queryByRole("button", {
                name: "Edit reminder for Project"
            })).not.toBeInTheDocument();
        });
        expect(screen.getByLabelText("Reminder time for Project"))
            .toBeInTheDocument();
    });

    it("rejects a past update time before calling the API", async () => {
        const user = userEvent.setup();
        renderPage();

        await screen.findByRole("heading", { name: "Project" });
        await user.click(
            screen.getByRole("button", { name: "Edit reminder for Project" })
        );

        const pastTime = toInputValue(Date.now() - 86400000);
        fireEvent.change(
            screen.getByLabelText("New reminder time for Project"),
            { target: { value: pastTime } }
        );
        await user.click(screen.getByRole("button", { name: "Update" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Please select a future date and time."
        );
        expect(mocks.updateReminder).not.toHaveBeenCalled();
    });

    it("still creates reminders after the listing flow change", async () => {
        const user = userEvent.setup();
        renderPage();

        const input = await screen.findByLabelText("Reminder time for Other");
        const reminderTime = futureInput(4);
        fireEvent.change(input, { target: { value: reminderTime } });
        await user.click(screen.getByRole("button", { name: "Set" }));

        await waitFor(() => {
            expect(mocks.createReminder).toHaveBeenCalledWith({
                noteId: 11,
                reminderTime
            });
        });
        expect(await screen.findByRole("button", {
            name: "Edit reminder for Other"
        })).toBeInTheDocument();
    });
});
