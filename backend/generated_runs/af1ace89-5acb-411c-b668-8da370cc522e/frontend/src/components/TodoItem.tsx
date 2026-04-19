'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TodoItemProps {
  todo: {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    created_at: string;
  };
  onDelete: (id: number) => void;
  onToggleComplete: (id: number, completed: boolean) => void;
}

export default function TodoItem({ todo, onDelete, onToggleComplete }: TodoItemProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEdit = () => {
    router.push(`/todos/${todo.id}`);
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggleComplete(todo.id, todo.completed)}
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <div className="flex-1">
            <h3 className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {todo.title}
            </h3>
            {isExpanded && todo.description && (
              <p className="mt-1 text-gray-600 text-sm">{todo.description}</p>
            )}
            {todo.description && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Created: {new Date(todo.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex flex-col space-y-2 ml-4">
          <button
            onClick={handleEdit}
            className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}