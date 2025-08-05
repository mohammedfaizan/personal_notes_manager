import React, { useState } from 'react';
import { PinIcon, PencilIcon, TrashIcon } from 'lucide-react';

const NoteCard = ({ note, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  const shouldTruncate = note.content.length > maxLength;

  const colorClasses = {
    default: 'bg-white border-gray-200',
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    pink: 'bg-pink-50 border-pink-200',
  };

  return (
    <div className={`${colorClasses[note.color]} border-2 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 relative`}>
      
      <div className="mb-2">
        <h3 className="font-semibold text-gray-800 text-lg leading-tight">{note.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          
          <span className="text-xs text-gray-500">
            {new Date(note.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-gray-700 whitespace-pre-wrap">
          {shouldTruncate && !isExpanded
            ? note.content.substring(0, maxLength) + '...'
            : note.content
          }
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-500 text-sm mt-1 hover:underline"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          
          <button
            onClick={() => onEdit(note)}
            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
            title="Edit note"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
            title="Delete note"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-gray-500">
          Updated {new Date(note.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default NoteCard;