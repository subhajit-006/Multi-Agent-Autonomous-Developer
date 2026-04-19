'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import TodoForm from '@/components/TodoForm';

export default function TodoDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [todo, setTodo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const response = await axios.get(`/api/v1/todos/${params.id}`);
        setTodo(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch todo');
        setLoading(false);
        console.error(err);
      }
    };

    fetchTodo();
  }, [params.id]);

  const handleUpdate = async (title: string, description: string) => {
    try {
      const response = await axios.put(`/api/v1/todos/${params.id}`, {
        title,
        description,
        completed: todo.completed,
      });
      setTodo(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to update todo');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/v1/todos/${params.id}`);
      router.push('/');
    } catch (err) {
      setError('Failed to delete todo');
      console.error(err);
    }
  };

  const handleToggleComplete = async () => {
    try {
      const response = await axios.put(`/api/v1/todos/${params.id}`, {
        completed: !todo.completed,
      });
      setTodo(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to update todo');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!todo) {
    return <div className="text-center py-8">Todo not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Todo</h1>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex items-center space-x-4">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
          className="h-5 w-5"
        />
        <span className={todo.completed ? 'line-through text-gray-400' : ''}>
          {todo.title}
        </span>
      </div>

      <TodoForm
        onSubmit={handleUpdate}
        initialTitle={todo.title}
        initialDescription={todo.description}
        buttonText="Update Todo"
      />
    </div>
  );
}