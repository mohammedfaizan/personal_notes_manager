import { useEffect, useState } from "react";
import API from "../api";
import NoteForm from "../components/NoteForm";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);

  const fetchNotes = async () => {
    const res = await API.get("/notes");
    setNotes(res.data);
  };

  const deleteNote = async (id) => {
    await API.delete(`/notes/${id}`);
    fetchNotes();
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="p-6">
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
