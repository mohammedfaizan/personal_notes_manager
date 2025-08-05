import React, { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, PinIcon, UserIcon, LogOutIcon, BookmarkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NoteCard from '../components/NoteCard';
import NoteForm from '../components/NoteForm';
import Toast from '../components/ui/Toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [toast, setToast] = useState(null);
  const [categories, setCategories] = useState([]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const loadNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      const response = await api.notes.getAll(params);
      setNotes(response.data.notes);
      const uniqueCategories = [...new Set(response.data.notes.map(note => note.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      showToast('Failed to load notes', 'error');
      console.error('Load notes error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line
  }, [searchTerm, selectedCategory]);

  const handleCreateNote = async (noteData) => {
    try {
      const response = await api.notes.create(noteData);
      setNotes([response.data.note, ...notes]);
      setShowForm(false);
      showToast('Note created successfully', 'success');
    } catch (error) {
      showToast('Failed to create note', 'error');
      console.error('Create note error:', error);
    }
  };

  const handleUpdateNote = async (noteData) => {
    try {
      const response = await api.notes.update(editingNote.id, noteData);
      setNotes(notes.map(note =>
        note.id === editingNote.id ? response.data.note : note
      ));
      setEditingNote(null);
      setShowForm(false);
      showToast('Note updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update note', 'error');
      console.error('Update note error:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.notes.delete(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
      showToast('Note deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete note', 'error');
      console.error('Delete note error:', error);
    }
  };

  const handleTogglePin = async (noteId) => {
    try {
      const response = await api.notes.togglePin(noteId);
      setNotes(notes.map(note =>
        note.id === noteId ? response.data.note : note
      ));
      showToast(response.message, 'success');
    } catch (error) {
      showToast('Failed to toggle pin', 'error');
      console.error('Toggle pin error:', error);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      !searchTerm ||
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const regularNotes = filteredNotes.filter(note => !note.isPinned);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <BookmarkIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">Personal Notes</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserIcon className="w-4 h-4" />
                <span>{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                title="Logout"
              >
                <LogOutIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              New Note
            </button>
          </div>
        </div>
        {/* Notes Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PinIcon className="w-5 h-5 text-yellow-500 fill-current" />
                  Pinned Notes ({pinnedNotes.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinnedNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Regular Notes */}
            {regularNotes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {pinnedNotes.length > 0 ? `Other Notes (${regularNotes.length})` : `All Notes (${regularNotes.length})`}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Empty State */}
            {filteredNotes.length === 0 && !loading && (
              <div className="text-center py-12">
                <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">
                  {searchTerm || selectedCategory ? 'No notes found' : 'No notes yet'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm || selectedCategory
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first note to get started'
                  }
                </p>
                {!searchTerm && !selectedCategory && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Create Your First Note
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      {/* Note Form Modal */}
      {showForm && (
        <NoteForm
          note={editingNote}
          onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
          onCancel={() => {
            setShowForm(false);
            setEditingNote(null);
          }}
        />
      )}
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;