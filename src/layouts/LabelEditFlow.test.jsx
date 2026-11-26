import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useOutletContext } from "react-router-dom";

const mocks = vi.hoisted(() => ({
    getAllLabels: vi.fn(),
    createLabel: vi.fn(),
    updateLabel: vi.fn(),
    deleteLabel: vi.fn()
}));

vi.mock("../services/labelService", () => mocks);

import AppLayout from "./AppLayout";

let labels = [];

function LabelProbe() {
    const { labels: contextLabels } = useOutletContext();

    return (
        <div data-testid="label-list">
            {contextLabels.map((label) => label.name).join(",")}
        </div>
    );
}

function renderLayout() {
    return render(
        <MemoryRouter initialEntries={["/dashboard"]}>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route path="dashboard" element={<LabelProbe />} />
                </Route>
            </Routes>
        </MemoryRouter>
    );
}

describe("label edit flow", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        labels = [
            { id: 1, name: "Work" },
            { id: 2, name: "Personal" }
        ];

        mocks.getAllLabels.mockImplementation(async () => labels);
        mocks.createLabel.mockImplementation(async ({ name }) => {
            const created = { id: 3, name };
            labels = [...labels, created];
            return created;
        });
        mocks.updateLabel.mockImplementation(async (labelId, { name }) => {
            labels = labels.map((label) =>
                label.id === labelId ? { ...label, name } : label
            );
            return { id: labelId, name };
        });
        mocks.deleteLabel.mockResolvedValue(undefined);
    });

    it("renames a label and refreshes the sidebar", async () => {
        const user = userEvent.setup();
        renderLayout();

        expect(await screen.findByTestId("label-list")).toHaveTextContent(
            "Work,Personal"
        );

        await user.click(screen.getByRole("button", { name: "Rename Work" }));

        const input = screen.getByPlaceholderText("Label name");
        expect(input).toHaveValue("Work");

        await user.clear(input);
        await user.type(input, "Office");
        await user.click(screen.getByRole("button", { name: "Update" }));

        await waitFor(() => {
            expect(mocks.updateLabel).toHaveBeenCalledWith(1, {
                name: "Office"
            });
        });

        expect(await screen.findByTestId("label-list")).toHaveTextContent(
            "Office,Personal"
        );
        expect(screen.getByRole("status")).toHaveTextContent(
            "Label updated successfully!"
        );
    });

    it("rejects a duplicate name before calling the API", async () => {
        const user = userEvent.setup();
        renderLayout();

        await screen.findByTestId("label-list");
        await user.click(screen.getByRole("button", { name: "Rename Work" }));

        const input = screen.getByPlaceholderText("Label name");
        await user.clear(input);
        await user.type(input, "personal");
        await user.click(screen.getByRole("button", { name: "Update" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "You already have a label with this name."
        );
        expect(mocks.updateLabel).not.toHaveBeenCalled();
    });

    it("shows the server duplicate error and keeps the form open", async () => {
        mocks.updateLabel.mockRejectedValueOnce({
            response: { data: { message: "Label already exists" } }
        });

        const user = userEvent.setup();
        renderLayout();

        await screen.findByTestId("label-list");
        await user.click(screen.getByRole("button", { name: "Rename Work" }));

        const input = screen.getByPlaceholderText("Label name");
        await user.clear(input);
        await user.type(input, "Projects");
        await user.click(screen.getByRole("button", { name: "Update" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Label already exists"
        );
        expect(screen.getByPlaceholderText("Label name")).toBeInTheDocument();
        expect(screen.getByRole("status")).toHaveTextContent(
            "Label already exists"
        );
    });

    it("still creates labels after the shared save handler change", async () => {
        const user = userEvent.setup();
        renderLayout();

        await screen.findByTestId("label-list");
        await user.click(
            screen.getByRole("button", { name: "Create a new label" })
        );
        await user.type(screen.getByPlaceholderText("Label name"), "Ideas");
        await user.click(screen.getByRole("button", { name: "Save" }));

        await waitFor(() => {
            expect(mocks.createLabel).toHaveBeenCalledWith({ name: "Ideas" });
        });

        expect(await screen.findByTestId("label-list")).toHaveTextContent(
            "Work,Personal,Ideas"
        );
    });
});
