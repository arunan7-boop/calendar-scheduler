import { useAuth } from '../../hooks/useAuth';

export default function ClientDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Calendar Scheduler</h1>
          <button onClick={logout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
        <div className="card">
          <p className="text-gray-600">TODO: List your bookings here</p>
        </div>
      </main>
    </div>
  );
}
