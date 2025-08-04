import { useState } from "react";
import API from "../api";

export default function NoteForm({ onNoteAdded }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const addNote = async (e) => {
    e.preventDefault();
    await API.post("/notes", { title, content });
    setTitle("");
    setContent("");
    onNoteAdded();
  };

  return (
    <form onSubmit={addNote} className="mb-4">
      <input 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="Title" 
        className="border p-2 mr-2"
      />
      <input 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
        placeholder="Content" 
        className="border p-2 mr-2"
      />
      <button className="bg-green-500 text-white px-3 py-1 rounded">Add</button>
    </form>
  );
}
