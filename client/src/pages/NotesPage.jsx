import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Loader2, Plus, Trash2, Edit2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { getBookDetails } from '../services/openLibraryService';

const NoteItem = ({ note }) => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [noteText, setNoteText] = useState(note.noteText);

    // Fetch book title using ID
    const { data: book } = useQuery({
        queryKey: ['book', note.googleBookId],
        queryFn: () => getBookDetails(note.googleBookId),
        staleTime: 1000 * 60 * 60,
    });

    const updateMutation = useMutation({
        mutationFn: async () => {
            await api.put(`/notes/update/${note._id}`, { noteText });
        },
        onSuccess: () => {
            toast.success('Note updated');
            setIsEditing(false);
            queryClient.invalidateQueries(['myNotes']);
        },
        onError: () => toast.error('Failed to update note')
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/notes/delete/${note._id}`);
        },
        onSuccess: () => {
            toast.success('Note deleted');
            queryClient.invalidateQueries(['myNotes']);
        },
        onError: () => toast.error('Failed to delete note')
    });

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="font-bold text-gray-900 mb-2 truncate">
                {book?.volumeInfo?.title || 'Loading book...'}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
                {new Date(note.createdAt).toLocaleDateString()}
            </p>

            <div className="flex-grow">
                {isEditing ? (
                    <textarea
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                    />
                ) : (
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{note.noteText}</p>
                )}
            </div>

            <div className="mt-4 flex justify-end space-x-2 pt-4 border-t border-gray-50">
                {isEditing ? (
                    <button
                        onClick={() => updateMutation.mutate()}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Save size={16} />
                    </button>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                        <Edit2 size={16} />
                    </button>
                )}
                <button
                    onClick={() => { if (confirm('Delete note?')) deleteMutation.mutate() }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

const NotesPage = () => {
    const { data: notes, isLoading } = useQuery({
        queryKey: ['myNotes'],
        queryFn: async () => {
            const res = await api.get('/notes/my');
            return res.data;
        }
    });

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>

            {notes?.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map(note => (
                        <NoteItem key={note._id} note={note} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 mb-4">You haven't added any notes yet.</p>
                    <p className="text-sm text-gray-400">Add notes from a book's detail page.</p>
                </div>
            )}
        </div>
    );
};

export default NotesPage;
