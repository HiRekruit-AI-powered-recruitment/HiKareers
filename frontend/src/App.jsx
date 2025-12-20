import React from 'react';

export default function App() {
  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <div className="max-w-xl w-full bg-white shadow rounded-xl p-8">
        <h1 className="text-3xl font-bold tracking-tight">HireKruit Home</h1>
        <p className="mt-3 text-gray-600">Setup complete. Tailwind + React + Vite running.</p>
        <div className="mt-6">
          <a
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            href="#"
          >
            Test Button
          </a>
        </div>
      </div>
    </div>
  );
}
