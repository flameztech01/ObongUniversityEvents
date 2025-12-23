// src/admin/components/AdminNavbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminNavbar = ({ pendingCount, onLogout }) => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/admin" className="text-xl font-bold text-gray-800 hover:text-gray-900">
                Admin Dashboard
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/admin/pending-verifications"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
              >
                Pending Verifications
                {pendingCount > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </Link>
              <Link
                to="/admin/users"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
              >
                All Users
              </Link>
              <Link
                to="/admin/statistics"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
              >
                Statistics
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;