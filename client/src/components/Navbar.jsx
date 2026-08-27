import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const linkClass = ({ isActive }) =>
    `cursor-pointer transition-colors pb-3 -mb-3 ${
      isActive
        ? 'text-gray-900 font-medium border-b-2 border-gray-900'
        : 'text-gray-500 hover:text-gray-700'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-full border-2 border-gray-900"></div>
          <span className="font-bold text-lg text-gray-900">Kanban</span>
        </div>
        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/tasks" className={linkClass}>Tasks</NavLink>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="flex items-center gap-3">
          {user.profileImage ? (
            <img
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profileImage}`}
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              {user.name.charAt(0)}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors cursor-pointer"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
