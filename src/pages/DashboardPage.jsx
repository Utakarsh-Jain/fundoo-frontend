import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import {
    getAllNotes,
    createNote,
    togglePin,
    toggleArchive,
    toggleTrash
} from "../services/noteService";
/*
 * Component Name : DashboardPagee
 * Description    : Displays notes and handles note creation and pinning.
 * Author         : Utakarsh Jain
 * Date           : 25/11/2026
 */

function DashboardPage() {

    const [notes, setNotes] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: ""
    });

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");
    // Fetches notes from the backend API.
    const fetchNotes = async () => {
        try {
            const response = await getAllNotes();
            setNotes(response);
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to fetch notes."
            );
        } finally {
            setLoading(false);
        }
    };

    // Updates note form fields.
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Creates a new note and refreshes the dashboard.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setCreating(true);
        setMessage("");

        try {
            await createNote(formData);

            setFormData({
                title: "",
                description: ""
            });

            setMessage("Note created successfully!");
            await fetchNotes();
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to create note."
            );
        } finally {
            setCreating(false);
        }
    };

    // Toggles pin status and refreshes the dashboard.
    const handlePin = async (noteId) => {
        try {
            await togglePin(noteId);
            setMessage("Note pin status updated successfully!");
            await fetchNotes();
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to update pin status."
            );
        }
    };
    // Toggles archive status and refreshes the dashboard.
    const handleArchive = async (noteId) => {
        try {
            await toggleArchive(noteId);
            setMessage("Note archive status updated successfully!");
            await fetchNotes();
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to update archive status."
            );
        }
    };
    // Toggles trash status and refreshes the dashboard.
    const handleTrash = async (noteId) => {
        try {
            await toggleTrash(noteId);
            setMessage("Note trash status updated successfully!");
            await fetchNotes();
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to update trash status."
            );
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    if (loading) {
        return <p>Loading notes...</p>;
    }
    // Filters notes based on title and description.

    // Filters notes based on search query and pin status.
    const filteredNotes = notes.filter((note) => {
        const query = searchQuery.toLowerCase();

        const matchesSearch =
            note.title.toLowerCase().includes(query) ||
            (note.description || "").toLowerCase().includes(query);

        const matchesFilter =
            filter === "all" ||
            (filter === "pinned" && note.pinned) ||
            (filter === "unpinned" && !note.pinned);

        return matchesSearch && matchesFilter;
    });
    return (
        <div>
            <h1>Fundoo Notes</h1>
            <h2>My Notes</h2>
            <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />
            <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                >
                <option value="all">All Notes</option>
                <option value="pinned">Pinned Notes</option>
                <option value="unpinned">Unpinned Notes</option>
            </select>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="title"
                    placeholder="Note Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />

                <textarea
                    name="description"
                    placeholder="Note Description"
                    value={formData.description}
                    onChange={handleChange}
                />

                <button type="submit" disabled={creating}>
                    {creating ? "Creating..." : "Create Note"}
                </button>
            </form>

            {message && <p>{message}</p>}

            {filteredNotes.length === 0 ? (
                <p>No notes available.</p>
            ) : (
                filteredNotes.map((note) => (
                    <div key={note.id}>
                        <h3>{note.title}</h3>
                        <p>{note.description}</p>

                        <p>
                            {note.pinned && "Pinned"}
                            {note.archived && " | Archived"}
                            {note.trashed && " | Trashed"}
                        </p>

                        <button onClick={() => handlePin(note.id)}>
                            {note.pinned ? "Unpin" : "Pin"}
                        </button>
                        <button onClick={() => handleArchive(note.id)}>
                            {note.archived ? "Unarchive" : "Archive"}
                        </button>
                        <button onClick={() => handleTrash(note.id)}>
                            {note.trashed ? "Restore" : "Trash"}
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

export default DashboardPage;
