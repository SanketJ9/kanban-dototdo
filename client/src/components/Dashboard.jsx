import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, selectTaskStats, selectTasksLoading } from '../redux/taskSlice';
import Navbar from './Navbar';

export default function Dashboard() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  
  // Read our automatically calculated stats from Redux!
  const stats = useSelector(selectTaskStats);
  const loading = useSelector(selectTasksLoading);

  // Ask Redux to fetch the tasks from the backend when Dashboard loads
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  if (!user) return null;

  // Configuration for our stat cards
  const statCards = [
    { label: 'Total Tasks', value: stats.total, color: '#6366f1' },       // Indigo
    { label: 'Completed Tasks', value: stats.completed, color: '#22c55e' }, // Green
    { label: 'Pending Tasks', value: stats.pending, color: '#f59e0b' },    // Orange
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Hi, {user.name}!</h1>
        
        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading your stats...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((card, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-500">{card.label}</span>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: card.color }}
                  ></div>
                </div>
                
                <h2 
                  className="text-5xl font-bold" 
                  style={{ color: card.color }}
                >
                  {card.value}
                </h2>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}