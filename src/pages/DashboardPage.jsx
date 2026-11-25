import { useEffect, useState } from "react";
import { getAllNotes } from "../services/noteService";

/*
 * Component Name : DashboardPage
 * Description    : Fetches and displays notes of the authenticated user.
 * Author         : Utkarsh Jain
 * Date           : 25/11/2026
 */

function DashboardPage() {

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

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

    useEffect(() => {
        fetchNotes();
    }, []);

    if (loading) {
        return <p>Loading notes...</p>;
    }

    return (
        <div>
            <h1>Fundoo Notes</h1>
            <h2>My Notes</h2>

            {message && <p>{message}</p>}

            {notes.length === 0 ? (
                <p>No notes available.</p>
            ) : (
                notes.map((note) => (
                    <div key={note.id}>
                        <h3>{note.title}</h3>
                        <p>{note.description}</p>

                        <p>
                            {note.pinned && "Pinned"}
                            {note.archived && " | Archived"}
                            {note.trashed && " | Trashed"}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}

export default DashboardPage;