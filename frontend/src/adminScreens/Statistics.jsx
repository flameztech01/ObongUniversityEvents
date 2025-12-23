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
    
    // Mobile-friendly date format
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today, ' + date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return 'Yesterday, ' + date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit',
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
      
      <div className="p-4 md:p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard Statistics</h2>
            <p className="text-sm md:text-base text-gray-600 mt-1">Overview of registration and payment data</p>
          </div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base self-start sm:self-center"
          >
            Refresh
          </button>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <StatCard
            title="Total Users"
            value={stats.total || 0}
            icon={
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 5.197h-6m0 0h-6" />
              </svg>
            }
            color="blue"
          />

          <StatCard
            title="Pending Payment"
            value={stats.pending_payment || 0}
            icon={
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="yellow"
          />

          <StatCard
            title="Pending Verification"
            value={stats.pending_verification || 0}
            icon={
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="blue"
          />

          <StatCard
            title="Approved"
            value={stats.approved || 0}
            icon={
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />
        </div>

        {/* Additional Stats (if available) */}
        {(stats.rejected || stats.total_payments) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {stats.rejected !== undefined && (
              <StatCard
                title="Rejected"
                value={stats.rejected || 0}
                icon={
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
                color="red"
                compact
              />
            )}
            
            {stats.total_payments !== undefined && (
              <StatCard
                title="Total Payments"
                value={`₦${(stats.total_payments || 0).toLocaleString()}`}
                icon={
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="green"
                compact
              />
            )}
          </div>
        )}

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-800">Recent Activity</h3>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
              {stats.recent_activity?.length || 0} activities
            </span>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            {stats.recent_activity?.length > 0 ? (
              <>
                {/* Mobile stacked view */}
                <div className="md:hidden space-y-3">
                  {stats.recent_activity.slice(0, 3).map((activity, index) => (
                    <div key={index} className="p-3 border border-gray-100 rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-white text-gray-800 border border-gray-200">
                          {activity.type}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-900">{activity.description}</p>
                    </div>
                  ))}
                </div>
                
                {/* Desktop view */}
                <div className="hidden md:block space-y-4">
                  {stats.recent_activity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800 ml-4 flex-shrink-0">
                        {activity.type}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Show "View More" on mobile if more than 3 activities */}
                {stats.recent_activity.length > 3 && (
                  <div className="md:hidden pt-2">
                    <button
                      onClick={() => {
                        // You could add a modal or separate view for all activities
                        console.log('View all activities');
                      }}
                      className="w-full py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      View All {stats.recent_activity.length} Activities
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 md:py-8">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm md:text-base">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Summary (Mobile only) */}
        {stats.recent_activity?.length > 0 && (
          <div className="mt-6 md:hidden">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Summary</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{stats.total || 0}</div>
                  <div className="text-xs text-gray-600">Total Users</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{stats.approved || 0}</div>
                  <div className="text-xs text-gray-600">Approved</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, compact = false }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-500 border-blue-100',
    yellow: 'bg-yellow-50 text-yellow-500 border-yellow-100',
    green: 'bg-green-50 text-green-500 border-green-100',
    red: 'bg-red-50 text-red-500 border-red-100'
  };

  const textColor = {
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    red: 'text-red-600'
  };

  const bgColor = {
    blue: 'bg-blue-600',
    yellow: 'bg-yellow-600',
    green: 'bg-green-600',
    red: 'bg-red-600'
  };

  return (
    <div className={`bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 ${compact ? 'h-full' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-xs md:text-sm text-gray-600 ${compact ? 'mb-1' : 'mb-2'}`}>{title}</p>
          <p className={`font-bold ${compact ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'} ${textColor[color]}`}>
            {value}
          </p>
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${colorClasses[color]} border`}>
          {icon}
        </div>
      </div>
      
      {/* Optional progress bar for compact cards */}
      {compact && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>100%</span>
          </div>
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${bgColor[color]} rounded-full`}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;