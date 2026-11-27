import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";

const notify = vi.fn();

const createObjectUrlMock = vi.fn(() => "blob:attachment");
const revokeObjectUrlMock = vi.fn();

const mocks = vi.hoisted(() => ({
    uploadAttachment: vi.fn(),
    getAllAttachments: vi.fn(),
    viewAttachment: vi.fn(),
    downloadAttachment: vi.fn()
}));

vi.mock("../services/attachmentService", () => ({
    uploadAttachment: mocks.uploadAttachment,
    getAllAttachments: mocks.getAllAttachments,
    viewAttachment: mocks.viewAttachment,
    downloadAttachment: mocks.downloadAttachment
}));

import AttachmentPage from "./AttachmentPage";

let attachments = [];

function renderPage() {
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
                    <Route path="/" element={<AttachmentPage />} />
                </Route>
            </Routes>
        </MemoryRouter>
    );
}

describe("attachment flow", () => {
    let openMock;
    let clickMock;

    afterEach(() => {
        openMock?.mockRestore();
        clickMock?.mockRestore();
    });

    beforeEach(() => {
        vi.clearAllMocks();

        attachments = [{
            id: 10,
            originalFileName: "notes.txt",
            contentType: "text/plain",
            fileSize: 5,
            uploadedAt: new Date().toISOString()
        }];

        Object.defineProperty(URL, "createObjectURL", {
            configurable: true,
            writable: true,
            value: createObjectUrlMock
        });
        Object.defineProperty(URL, "revokeObjectURL", {
            configurable: true,
            writable: true,
            value: revokeObjectUrlMock
        });
        openMock = vi.spyOn(window, "open").mockImplementation(() => null);
        clickMock = vi.spyOn(HTMLAnchorElement.prototype, "click")
            .mockImplementation(() => {});

        mocks.getAllAttachments.mockImplementation(async () => attachments);
        mocks.uploadAttachment.mockImplementation(async (file) => {
            const uploaded = {
                id: attachments.length + 1,
                originalFileName: file.name,
                contentType: file.type,
                fileSize: file.size,
                uploadedAt: new Date().toISOString()
            };
            attachments = [...attachments, uploaded];
            return uploaded;
        });
        mocks.viewAttachment.mockImplementation(async () =>
            new Blob(["hello"], { type: "text/plain" })
        );
        mocks.downloadAttachment.mockImplementation(async () =>
            new Blob(["hello"], { type: "text/plain" })
        );
    });

    it("uploads a selected file and refreshes the attachment list", async () => {
        const user = userEvent.setup();
        renderPage();

        expect(await screen.findByText("notes.txt")).toBeInTheDocument();

        await user.upload(
            screen.getByLabelText("Choose attachment"),
            new File(["hello"], "report.txt", { type: "text/plain" })
        );
        await user.click(
            screen.getByRole("button", { name: "Upload attachment" })
        );

        await waitFor(() => {
            expect(mocks.uploadAttachment).toHaveBeenCalledTimes(1);
        });
        expect(mocks.uploadAttachment.mock.calls[0][0].name)
            .toBe("report.txt");
        expect(await screen.findByText("report.txt")).toBeInTheDocument();
        expect(notify).toHaveBeenCalledWith(
            "Attachment uploaded successfully!"
        );
    });

    it("uploads an Excel workbook", async () => {
        const user = userEvent.setup();
        renderPage();

        await screen.findByText("notes.txt");

        await user.upload(
            screen.getByLabelText("Choose attachment"),
            new File(["excel"], "report.xlsx", {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            })
        );
        await user.click(
            screen.getByRole("button", { name: "Upload attachment" })
        );

        await waitFor(() => {
            expect(mocks.uploadAttachment).toHaveBeenCalledTimes(1);
        });
        expect(mocks.uploadAttachment.mock.calls[0][0].name)
            .toBe("report.xlsx");
        expect(await screen.findByText("report.xlsx")).toBeInTheDocument();
    });

    it("rejects an unsupported file before uploading it", async () => {
        const user = userEvent.setup();
        renderPage();

        await screen.findByText("notes.txt");

        const input = screen.getByLabelText("Choose attachment");
        input.removeAttribute("accept");

        await user.upload(
            input,
            new File(["bad"], "virus.exe", {
                type: "application/x-msdownload"
            })
        );
        await user.click(
            screen.getByRole("button", { name: "Upload attachment" })
        );

        expect(await screen.findByRole("alert"))
            .toHaveTextContent("Unsupported file type");
        expect(mocks.uploadAttachment).not.toHaveBeenCalled();
        expect(notify).toHaveBeenCalledWith(
            expect.stringContaining("Unsupported file type"),
            "error"
        );
    });

    it("views an attachment through the view API", async () => {
        const user = userEvent.setup();
        renderPage();

        expect(await screen.findByText("notes.txt")).toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: "View notes.txt" })
        );

        await waitFor(() => {
            expect(mocks.viewAttachment).toHaveBeenCalledWith(10);
        });
        expect(createObjectUrlMock).toHaveBeenCalled();
        expect(openMock).toHaveBeenCalledWith(
            "blob:attachment",
            "_blank",
            "noopener,noreferrer"
        );
    });

    it("downloads an attachment through the download API", async () => {
        const user = userEvent.setup();
        renderPage();

        expect(await screen.findByText("notes.txt")).toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: "Download notes.txt" })
        );

        await waitFor(() => {
            expect(mocks.downloadAttachment).toHaveBeenCalledWith(10);
        });
        expect(createObjectUrlMock).toHaveBeenCalled();
        expect(revokeObjectUrlMock).toHaveBeenCalledWith("blob:attachment");
    });
});
