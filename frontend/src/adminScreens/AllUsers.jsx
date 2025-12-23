import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllUsersQuery, useExportUsersMutation } from '../slices/adminApiSlice';
import AdminNavbar from '../components/adminNavbar.jsx';

const AllUsers = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  const { data, isLoading, refetch } = useGetAllUsersQuery({ 
    page, 
    limit: 20, 
    search: searchTerm 
  });
  
  const [exportUsers] = useExportUsersMutation();
  
  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || {};

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
      case 'pending_verification': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExport = async (format = 'json') => {
    try {
      const result = await exportUsers(format).unwrap();
      
      if (format === 'csv') {
        const url = window.URL.createObjectURL(result);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const dataStr = JSON.stringify(result, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar currentScreen="users" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar currentScreen="users" />
      
      <div className="p-4 md:p-6">
        {/* Header Section */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">All Users</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage all registered users</p>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 md:h-5 md:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={refetch}
              className="px-3 py-2 md:px-4 md:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Refresh
            </button>
            
            {/* Export Buttons - Stack on mobile, side by side on desktop */}
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('json')}
                className="px-3 py-2 md:px-4 md:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm whitespace-nowrap"
              >
                Export JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="px-3 py-2 md:px-4 md:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm whitespace-nowrap"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {users.length === 0 ? (
          <div className="text-center py-8 md:py-12 bg-white rounded-xl border border-gray-200">
            <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 5.197h-6m0 0h-6" />
            </svg>
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2">No users found</h3>
            <p className="text-xs md:text-sm text-gray-600">
              {searchTerm ? 'Try a different search term' : 'No users have registered yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white shadow-md rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{user.ticketId || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            ₦{user.amount?.toLocaleString() || '0'}
                          </div>
                          <div className="text-xs text-gray-500">{user.level}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {user.status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {users.map((user) => (
                <div key={user._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    {/* User Info */}
                    <div>
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                    </div>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Ticket ID</div>
                        <div className="font-medium text-gray-900">{user.ticketId || 'N/A'}</div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Payment</div>
                        <div className="font-medium text-gray-900">₦{user.amount?.toLocaleString() || '0'}</div>
                        <div className="text-xs text-gray-500">{user.level}</div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {user.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Registered</div>
                        <div className="font-medium text-gray-900">
                          {formatDate(user.createdAt).split(',')[0]}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(user.createdAt).split(',')[1]}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="w-full py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 px-4 md:px-6 py-4 bg-white shadow-sm rounded-xl border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="text-xs md:text-sm text-gray-700">
                    Showing <span className="font-medium">{((page - 1) * 20) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(page * 20, pagination.totalUsers)}</span> of{' '}
                    <span className="font-medium">{pagination.totalUsers}</span> users
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      <span className="px-2 text-xs md:text-sm text-gray-700">Page</span>
                      <span className="px-3 py-1.5 text-xs md:text-sm bg-blue-500 text-white rounded-lg font-medium">
                        {page} of {pagination.totalPages}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= pagination.totalPages}
                      className="px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                    >
                      Next
                    </button>
                  </div>
                </div>
                
                {/* Mobile Page Numbers */}
                <div className="md:hidden flex justify-center gap-1 mt-4">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-full text-xs ${
                          page === pageNum
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {pagination.totalPages > 5 && (
                    <span className="px-2 text-xs text-gray-500 self-center">...</span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllUsers;