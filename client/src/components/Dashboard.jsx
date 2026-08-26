import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, selectTaskStats, selectTasksLoading } from '../redux/taskSlice';
import Navbar from './Navbar';

export default function Dashboard() {
  const { user, token } = useAuth();
  const dispatch = useDispatch();
  const stats = useSelector(selectTaskStats);
  const loading = useSelector(selectTasksLoading);

  // Fetch tasks into Redux store (stats are derived from the tasks array)
  useEffect(() => {
    if (token) dispatch(fetchTasks());
  }, [token, dispatch]);

  if (!user) return null;

  const statCards = [
    { label: 'Total Tasks', value: stats.total, color: '#6366f1' },
    { label: 'Backlog', value: stats.backlog, color: '#f59e0b' },
    { label: 'To Do', value: stats.todo, color: '#3b82f6' },
    { label: 'Ongoing', value: stats.ongoing, color: '#a855f7' },
    { label: 'Completed', value: stats.completed, color: '#22c55e' },
    { label: 'Pending', value: stats.pending, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-500">Here's a summary of your tasks</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <p className="text-gray-400">Loading stats...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">{card.label}</span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: card.color }}
                  ></div>
                </div>
                <p className="text-4xl font-bold" style={{ color: card.color }}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}