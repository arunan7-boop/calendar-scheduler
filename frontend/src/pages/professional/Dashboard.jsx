import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function ProfessionalDashboard() {
  const { user, logout } = useAuth();
  const [view, setView] = useState('week'); // 'day', 'week', 'month'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Calendar Scheduler</h1>
          <button onClick={logout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Schedule</h2>
          <div className="space-x-2">
            <button
              onClick={() => setView('day')}
              className={`btn ${view === 'day' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              className={`btn ${view === 'week' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Week
            </button>
            <button
              onClick={() => setView('month')}
              className={`btn ${view === 'month' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Month
            </button>
          </div>
        </div>
        <div className="card">
          <p className="text-gray-600">TODO: Show {view} view calendar here</p>
        </div>
      </main>
    </div>
  );
}
