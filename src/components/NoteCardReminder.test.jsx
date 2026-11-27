import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import NoteCard from "./NoteCard";
import { toIstInputValue } from "../utils/reminderTime";

const note = {
    id: 10,
    title: "Project",
    description: "Project note",
    pinned: false,
    archived: false,
    trashed: false
};

function renderCard(onSetReminder, onNotify) {
    return render(
        <NoteCard
            note={note}
            labels={[]}
            onPin={vi.fn()}
            onArchive={vi.fn()}
            onTrash={vi.fn()}
            onSetReminder={onSetReminder}
            onAssignLabel={vi.fn()}
            onRemoveLabel={vi.fn()}
            onNotify={onNotify}
        />
    );
}

describe("dashboard reminder card", () => {
    it("sends an IST reminder time to the create flow", async () => {
        const user = userEvent.setup();
        const onSetReminder = vi.fn();
        renderCard(onSetReminder, vi.fn());

        await user.click(screen.getByRole("button", { name: /Remind/ }));

        const value = toIstInputValue(Date.now() + 2 * 86400000);
        fireEvent.change(
            screen.getByLabelText("Reminder date and time"),
            { target: { value } }
        );
        await user.click(screen.getByRole("button", { name: "Set" }));

        expect(onSetReminder).toHaveBeenCalledWith(10, value);
    });

    it("rejects a past IST reminder time", async () => {
        const user = userEvent.setup();
        const onSetReminder = vi.fn();
        const onNotify = vi.fn();
        renderCard(onSetReminder, onNotify);

        await user.click(screen.getByRole("button", { name: /Remind/ }));
        fireEvent.change(
            screen.getByLabelText("Reminder date and time"),
            { target: { value: toIstInputValue(Date.now() - 86400000) } }
        );
        await user.click(screen.getByRole("button", { name: "Set" }));

        expect(onNotify).toHaveBeenCalledWith(
            "Please select a future date and time.",
            "error"
        );
        expect(onSetReminder).not.toHaveBeenCalled();
    });
});
