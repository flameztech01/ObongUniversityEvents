// components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  useLoginAdminMutation,
  useGetPendingVerificationsQuery,
  useApprovePaymentMutation,
  useRejectPaymentMutation,
  useGetAllUsersQuery,
  useGetDashboardStatsQuery,
  useExportUsersMutation,
  useResendTicketEmailMutation,
  useUpdateUserMutation,
  useBulkProcessPaymentsMutation
} from '../slices/adminApiSlice';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useDispatch } from 'react-redux';
import { setAdminCredentials, adminLogout } from '../slices/authSlice'; // Add this import

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('login'); // 'login', 'pending', 'users', 'stats'
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check if already logged in
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setScreen('pending');
    }
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // API Hooks
  const [loginAdmin, { isLoading: isLoggingIn }] = useLoginAdminMutation();
  const [approvePayment] = useApprovePaymentMutation();
  const [rejectPayment] = useRejectPaymentMutation();
  const [exportUsers] = useExportUsersMutation();
  const [resendTicketEmail] = useResendTicketEmailMutation();
  const [updateUser] = useUpdateUserMutation();
  const [bulkProcessPayments] = useBulkProcessPaymentsMutation();

  const { data: pendingData, isLoading: pendingLoading, refetch: refetchPending } = useGetPendingVerificationsQuery();
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useGetAllUsersQuery({ 
    page, 
    limit: 20, 
    search: searchTerm 
  });
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useGetDashboardStatsQuery();

  const dispatch = useDispatch();

 const handleLogin = async (e) => {
  e.preventDefault();
  setErrorMessage('');
  setSuccessMessage('');

  try {
    const response = await loginAdmin(loginData).unwrap();
    
    if (response.success) {
      // Store in Redux state
      dispatch(setAdminCredentials({
        token: response.token,
        user: response.data // or response.user
      }));
      
      setSuccessMessage('Login successful!');
      setScreen('pending');
    }
  } catch (error) {
    setErrorMessage(error?.data?.message || 'Login failed. Please check your credentials.');
  }
};

const handleLogout = () => {
  dispatch(adminLogout());
  setScreen('login');
  setSuccessMessage('Logged out successfully');
};

  const handleApprove = async (userId) => {
    try {
      await approvePayment({ userId, adminNotes }).unwrap();
      setSuccessMessage('Payment approved successfully!');
      setAdminNotes('');
      refetchPending();
      refetchUsers();
      refetchStats();
      setShowApproveModal(false);
    } catch (error) {
      setErrorMessage(error?.data?.message || 'Failed to approve payment');
    }
  };

  const handleReject = async (userId) => {
    if (!rejectionReason.trim()) {
      setErrorMessage('Please provide a rejection reason');
      return;
    }

    try {
      await rejectPayment({ userId, rejectionReason }).unwrap();
      setSuccessMessage('Payment rejected successfully!');
      setRejectionReason('');
      refetchPending();
      refetchUsers();
      refetchStats();
      setShowRejectModal(false);
    } catch (error) {
      setErrorMessage(error?.data?.message || 'Failed to reject payment');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.length === 0) {
      setErrorMessage('Please select users to approve');
      return;
    }

    try {
      await bulkProcessPayments({
        userIds: selectedUsers,
        action: 'approve',
        reason: adminNotes
      }).unwrap();
      
      setSuccessMessage(`Approved ${selectedUsers.length} users successfully!`);
      setSelectedUsers([]);
      setAdminNotes('');
      refetchPending();
      refetchUsers();
      refetchStats();
    } catch (error) {
      setErrorMessage(error?.data?.message || 'Failed to bulk approve');
    }
  };

  const handleBulkReject = async () => {
    if (selectedUsers.length === 0) {
      setErrorMessage('Please select users to reject');
      return;
    }

    if (!rejectionReason.trim()) {
      setErrorMessage('Please provide a rejection reason');
      return;
    }

    try {
      await bulkProcessPayments({
        userIds: selectedUsers,
        action: 'reject',
        reason: rejectionReason
      }).unwrap();
      
      setSuccessMessage(`Rejected ${selectedUsers.length} users successfully!`);
      setSelectedUsers([]);
      setRejectionReason('');
      refetchPending();
      refetchUsers();
      refetchStats();
    } catch (error) {
      setErrorMessage(error?.data?.message || 'Failed to bulk reject');
    }
  };

  const handleExport = async (format = 'json') => {
    try {
      const result = await exportUsers(format).unwrap();
      
      if (format === 'csv') {
        // Create download link for CSV
        const url = window.URL.createObjectURL(result);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Download JSON file
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
      
      setSuccessMessage(`Export completed successfully!`);
    } catch (error) {
      setErrorMessage(error?.data?.message || 'Export failed');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
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

  // Login Screen
  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Portal</h1>
              <p className="text-gray-600">Sign in to manage registrations</p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard Layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setScreen('pending')}
                  className={`${
                    screen === 'pending'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Pending Verifications
                  {pendingData?.count > 0 && (
                    <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {pendingData.count}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setScreen('users')}
                  className={`${
                    screen === 'users'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  All Users
                </button>
                <button
                  onClick={() => setScreen('stats')}
                  className={`${
                    screen === 'stats'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Statistics
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Messages */}
      {(errorMessage || successMessage) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          {errorMessage && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
              {successMessage}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {screen === 'pending' && (
          <PendingVerificationsScreen
            data={pendingData}
            loading={pendingLoading}
            onApprove={(user) => {
              setSelectedUser(user);
              setShowApproveModal(true);
            }}
            onReject={(user) => {
              setSelectedUser(user);
              setShowRejectModal(true);
            }}
            onViewDetails={(user) => {
              setSelectedUser(user);
              setShowUserModal(true);
            }}
            selectedUsers={selectedUsers}
            onToggleSelect={(userId) => {
              if (selectedUsers.includes(userId)) {
                setSelectedUsers(selectedUsers.filter(id => id !== userId));
              } else {
                setSelectedUsers([...selectedUsers, userId]);
              }
            }}
            onBulkApprove={handleBulkApprove}
            onBulkReject={() => {
              if (selectedUsers.length > 0) {
                setShowRejectModal(true);
              }
            }}
            onRefresh={refetchPending}
          />
        )}

        {screen === 'users' && (
          <AllUsersScreen
            data={usersData}
            loading={usersLoading}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            page={page}
            onPageChange={setPage}
            onViewDetails={(user) => {
              setSelectedUser(user);
              setShowUserModal(true);
            }}
            onExport={handleExport}
            onRefresh={refetchUsers}
          />
        )}

        {screen === 'stats' && (
          <StatisticsScreen
            data={statsData}
            loading={statsLoading}
            onRefresh={refetchStats}
          />
        )}
      </main>

      {/* Modals */}
      {showRejectModal && (
        <RejectModal
          user={selectedUser}
          reason={rejectionReason}
          onReasonChange={setRejectionReason}
          onConfirm={() => selectedUser ? handleReject(selectedUser._id) : handleBulkReject()}
          onCancel={() => {
            setShowRejectModal(false);
            setSelectedUser(null);
            setRejectionReason('');
          }}
          isBulk={!selectedUser}
          selectedCount={selectedUsers.length}
        />
      )}

      {showApproveModal && (
        <ApproveModal
          user={selectedUser}
          notes={adminNotes}
          onNotesChange={setAdminNotes}
          onConfirm={() => handleApprove(selectedUser._id)}
          onCancel={() => {
            setShowApproveModal(false);
            setSelectedUser(null);
            setAdminNotes('');
          }}
        />
      )}

      {showUserModal && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          onResendTicket={async () => {
            try {
              await resendTicketEmail(selectedUser._id).unwrap();
              setSuccessMessage('Ticket email resent successfully!');
            } catch (error) {
              setErrorMessage('Failed to resend ticket email');
            }
          }}
          onUpdateUser={async (userData) => {
            try {
              await updateUser({ userId: selectedUser._id, userData }).unwrap();
              setSuccessMessage('User updated successfully!');
              refetchUsers();
            } catch (error) {
              setErrorMessage('Failed to update user');
            }
          }}
        />
      )}
    </div>
  );
};

// Pending Verifications Screen Component
const PendingVerificationsScreen = ({ 
  data, 
  loading, 
  onApprove, 
  onReject, 
  onViewDetails,
  selectedUsers,
  onToggleSelect,
  onBulkApprove,
  onBulkReject,
  onRefresh 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const pendingUsers = data?.data?.users || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pending Verifications</h2>
          <p className="text-gray-600">Review and verify payment receipts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
          {selectedUsers.length > 0 && (
            <>
              <button
                onClick={onBulkApprove}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Approve Selected ({selectedUsers.length})
              </button>
              <button
                onClick={onBulkReject}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Reject Selected ({selectedUsers.length})
              </button>
            </>
          )}
        </div>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending verifications</h3>
          <p className="text-gray-600">All payments have been verified.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === pendingUsers.length && pendingUsers.length > 0}
                      onChange={() => {
                        if (selectedUsers.length === pendingUsers.length) {
                          onToggleSelect('clear');
                        } else {
                          pendingUsers.forEach(user => onToggleSelect(user._id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => onToggleSelect(user._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-500">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(user.amount || 0)}
                      </div>
                      <div className="text-sm text-gray-500">Ref: {user.paymentReference}</div>
                      {user.receiptUrl && (
                        <a
                          href={user.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          View Receipt
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.paymentDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onViewDetails(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onApprove(user)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(user)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// All Users Screen Component
const AllUsersScreen = ({ 
  data, 
  loading, 
  searchTerm, 
  onSearch, 
  page, 
  onPageChange, 
  onViewDetails, 
  onExport, 
  onRefresh 
}) => {
  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || {};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">All Users</h2>
          <p className="text-gray-600">Manage all registered users</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => onExport('json')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={() => onExport('csv')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 5.197h-6m0 0h-6" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try a different search term' : 'No users have registered yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.ticketId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(user.amount || 0)}
                      </div>
                      <div className="text-xs text-gray-500">{user.level}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onViewDetails(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * 20, pagination.totalUsers)}</span> of{' '}
                  <span className="font-medium">{pagination.totalUsers}</span> users
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm bg-blue-500 text-white rounded">
                    {page}
                  </span>
                  <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= pagination.totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Statistics Screen Component
const StatisticsScreen = ({ data, loading, onRefresh }) => {
  const stats = data?.data || {};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Statistics</h2>
          <p className="text-gray-600">Overview of registration and payment data</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 5.197h-6m0 0h-6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payment</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending_payment || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Verification</p>
              <p className="text-3xl font-bold text-blue-600">{stats.pending_verification || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {stats.recent_activity?.map((activity, index) => (
            <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div>
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                {activity.type}
              </span>
            </div>
          )) || (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Modal Components
const RejectModal = ({ user, reason, onReasonChange, onConfirm, onCancel, isBulk, selectedCount }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {isBulk ? `Reject ${selectedCount} Users` : 'Reject Payment'}
          </h3>
          {!isBulk && user && (
            <p className="text-sm text-gray-600 mb-4">
              Reject payment for <span className="font-medium">{user.name}</span> ({user.email})?
            </p>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rejection
            </label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows="3"
              placeholder="Please provide a reason for rejection..."
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              {isBulk ? `Reject ${selectedCount} Users` : 'Reject Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ApproveModal = ({ user, notes, onNotesChange, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Approve Payment</h3>
          {user && (
            <p className="text-sm text-gray-600 mb-4">
              Approve payment for <span className="font-medium">{user.name}</span> ({user.email})?
            </p>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows="3"
              placeholder="Add any notes for this approval..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Approve Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDetailsModal = ({ user, onClose, onResendTicket, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        level: user.level || 'basic'
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSave = () => {
    onUpdateUser(editData);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">User Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900">{user.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900">{user.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900">{user.phone || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Level</label>
              {isEditing ? (
                <select
                  value={editData.level}
                  onChange={(e) => setEditData({...editData, level: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              ) : (
                <p className="text-gray-900 uppercase">{user.level}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
              <p className="text-gray-900">
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(user.amount || 0)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Reference</label>
              <p className="text-gray-900 font-mono">{user.paymentReference}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                {user.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ticket ID</label>
              <p className="text-gray-900 font-mono">{user.ticketId || 'Not generated yet'}</p>
            </div>
          </div>

          {user.receiptUrl && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Receipt</label>
              <a
                href={user.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View Receipt
              </a>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              {user.status === 'approved' && user.ticketId && (
                <button
                  onClick={onResendTicket}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Resend Ticket
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Edit User
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;