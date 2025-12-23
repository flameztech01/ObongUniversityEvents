import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetDashboardStatsQuery } from '../slices/adminApiSlice';
import AdminNavbar from '../components/adminNavbar.jsx';

const Statistics = () => {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetDashboardStatsQuery();
  const stats = data?.data || {};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar currentScreen="stats" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar currentScreen="stats" />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Statistics</h2>
            <p className="text-gray-600">Overview of registration and payment data</p>
          </div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.total || 0}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 5.197h-6m0 0h-6" />
              </svg>
            }
            color="blue"
          />

          <StatCard
            title="Pending Payment"
            value={stats.pending_payment || 0}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="yellow"
          />

          <StatCard
            title="Pending Verification"
            value={stats.pending_verification || 0}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="blue"
          />

          <StatCard
            title="Approved"
            value={stats.approved || 0}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {stats.recent_activity?.length > 0 ? (
              stats.recent_activity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                    {activity.type}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-500',
    yellow: 'bg-yellow-100 text-yellow-500',
    green: 'bg-green-100 text-green-500',
    red: 'bg-red-100 text-red-500'
  };

  const textColor = {
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    red: 'text-red-600'
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${textColor[color]}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Statistics;