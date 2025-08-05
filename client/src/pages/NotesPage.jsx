import { useEffect, useState } from "react";
import API from "../services/api";
import NoteForm from "../components/NoteForm";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);

  const fetchNotes = async () => {
    const res = await API.get("/notes");
    setNotes(res.data);
  };

  const fetchUser = async () => {
    const res = await API.get("/auth/user");
    setUser(res.data);
  };

  const deleteNote = async (id) => {
    await API.delete(`/notes/${id}`);
    fetchNotes();
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  useEffect(() => {
    fetchNotes();
    fetchUser();
  }, []);

  return (
    <div className="p-6">
      {user && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl">Welcome, {user.name} ({user.email})</h2>
          <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
        </div>
      )}
      <h1 className="text-2xl mb-4">Your Notes</h1>
      <NoteForm onNoteAdded={fetchNotes} />
      <ul>
        {notes.map(note => (
          <li key={note._id} className="border p-3 mb-2 rounded flex justify-between">
            <div>
              <h3 className="font-bold">{note.title}</h3>
              <p>{note.content}</p>
            </div>
            <button 
              onClick={() => deleteNote(note._id)} 
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
