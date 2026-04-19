'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import axios from 'axios';
import TodoForm from '@/components/TodoForm';
import TodoItem from '@/components/TodoItem';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function Home() {
  const router = useRouter();
  const { data: todos, mutate } = useSWR('/api/v1/todos', fetcher);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (title: string, description: string) => {
    try {
      const response = await axios.post('/api/v1/todos', {
        title,
        description,
        completed: false,
      });
      mutate([...todos, response.data]);
      setError(null);
    } catch (err) {
      setError('Failed to create todo');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/v1/todos/${id}`);
      mutate(todos.filter((todo: any) => todo.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete todo');
      console.error(err);
    }
  };

  const handleToggleComplete = async (id: number, completed: boolean) => {
    try {
      const response = await axios.put(`/api/v1/todos/${id}`, {
        completed: !completed,
      });
      mutate(todos.map((todo: any) => (todo.id === id ? response.data : todo)));
      setError(null);
    } catch (err) {
      setError('Failed to update todo');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Minimal Todo App</h1>

      <TodoForm onSubmit={handleCreate} />

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {todos?.map((todo: any) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onDelete={handleDelete}
            onToggleComplete={handleToggleComplete}
          />
        ))}
      </div>
    </div>
  );
}