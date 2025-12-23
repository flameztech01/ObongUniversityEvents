import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetPendingVerificationsQuery,
  useApprovePaymentMutation,
  useRejectPaymentMutation,
  useBulkProcessPaymentsMutation
} from '../slices/adminApiSlice';
import AdminNavbar from '../components/adminNavbar.jsx';

const PendingVerifications = () => {
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, isLoading, refetch } = useGetPendingVerificationsQuery();
  const [approvePayment] = useApprovePaymentMutation();
  const [rejectPayment] = useRejectPaymentMutation();
  const [bulkProcessPayments] = useBulkProcessPaymentsMutation();

  const pendingUsers = data?.data?.users || [];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    
    // Mobile-friendly format
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit'
    });
  };

  const handleToggleSelect = (userId) => {
    if (userId === 'clear') {
      setSelectedUsers([]);
    } else if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await approvePayment({ userId, adminNotes }).unwrap();
      setSuccess('Payment approved successfully!');
      setAdminNotes('');
      setSelectedUser(null);
      setShowApproveModal(false);
      refetch();
    } catch (error) {
      setError(error?.data?.message || 'Failed to approve payment');
    }
  };

  const handleReject = async (userId) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      await rejectPayment({ userId, rejectionReason }).unwrap();
      setSuccess('Payment rejected successfully!');
      setRejectionReason('');
      setSelectedUser(null);
      setShowRejectModal(false);
      refetch();
    } catch (error) {
      setError(error?.data?.message || 'Failed to reject payment');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select users to approve');
      return;
    }

    try {
      await bulkProcessPayments({
        userIds: selectedUsers,
        action: 'approve',
        reason: adminNotes
      }).unwrap();
      
      setSuccess(`Approved ${selectedUsers.length} users successfully!`);
      setSelectedUsers([]);
      setAdminNotes('');
      refetch();
    } catch (error) {
      setError(error?.data?.message || 'Failed to bulk approve');
    }
  };

  const handleBulkReject = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select users to reject');
      return;
    }

    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      await bulkProcessPayments({
        userIds: selectedUsers,
        action: 'reject',
        reason: rejectionReason
      }).unwrap();
      
      setSuccess(`Rejected ${selectedUsers.length} users successfully!`);
      setSelectedUsers([]);
      setRejectionReason('');
      setShowBulkRejectModal(false);
      refetch();
    } catch (error) {
      setError(error?.data?.message || 'Failed to bulk reject');
    }
  };

  React.useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar currentScreen="pending" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar currentScreen="pending" />
      
      <div className="p-4 md:p-6">
        {/* Alert Messages */}
        {(error || success) && (
          <div className={`mb-4 p-3 md:p-4 rounded-lg border ${
            error ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
          }`}>
            <div className="flex items-start">
              {error && (
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {success && (
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm">{error || success}</span>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Pending Verifications</h2>
            <p className="text-sm md:text-base text-gray-600 mt-1">Review and verify payment receipts</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={refetch}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base order-2 sm:order-1"
            >
              Refresh
            </button>
            
            {/* Bulk Actions - Mobile stacked, desktop inline */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2 mb-3 sm:mb-0">
                <button
                  onClick={handleBulkApprove}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  Approve ({selectedUsers.length})
                </button>
                <button
                  onClick={() => setShowBulkRejectModal(true)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Reject ({selectedUsers.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selection Summary - Mobile only */}
        {selectedUsers.length > 0 && (
          <div className="md:hidden mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">
                {selectedUsers.length} selected
              </span>
              <button
                onClick={() => handleToggleSelect('clear')}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {pendingUsers.length === 0 ? (
          <div className="text-center py-8 md:py-12 bg-white rounded-xl border border-gray-200">
            <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2">No pending verifications</h3>
            <p className="text-xs md:text-sm text-gray-600">All payments have been verified.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white shadow-md rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === pendingUsers.length && pendingUsers.length > 0}
                          onChange={() => handleToggleSelect('clear')}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleToggleSelect(user._id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-500">{user.phone || 'No phone'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            ₦{user.amount?.toLocaleString() || '0'}
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
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(user.paymentDate)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowApproveModal(true);
                              }}
                              className="text-green-600 hover:text-green-900 text-sm font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowRejectModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {pendingUsers.map((user) => (
                <div key={user._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  {/* Selection Checkbox */}
                  <div className="flex items-start justify-between mb-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleToggleSelect(user._id)}
                        className="rounded border-gray-300 mr-3"
                      />
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    </label>
                    <span className="text-xs text-gray-500">{formatDate(user.paymentDate)}</span>
                  </div>

                  {/* User Info */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                    {user.phone && (
                      <p className="text-sm text-gray-600">{user.phone}</p>
                    )}
                  </div>

                  {/* Payment Details */}
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Amount</div>
                        <div className="font-medium text-gray-900">₦{user.amount?.toLocaleString() || '0'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Reference</div>
                        <div className="font-medium text-gray-900 truncate">{user.paymentReference}</div>
                      </div>
                    </div>
                    
                    {user.receiptUrl && (
                      <a
                        href={user.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Receipt
                      </a>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowApproveModal(true);
                      }}
                      className="flex-1 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowRejectModal(true);
                      }}
                      className="flex-1 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modals */}
        {/* Approve Modal */}
        {showApproveModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Approve Payment</h3>
              <p className="mb-4 text-sm md:text-base">
                Approve payment for <strong>{selectedUser.name}</strong>?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm md:text-base"
                  rows="3"
                  placeholder="Add notes..."
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedUser(null);
                    setAdminNotes('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm md:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApprove(selectedUser._id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm md:text-base order-1 sm:order-2 mb-3 sm:mb-0"
                >
                  Confirm Approval
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Reject Payment</h3>
              <p className="mb-4 text-sm md:text-base">
                Reject payment for <strong>{selectedUser.name}</strong>?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm md:text-base"
                  rows="3"
                  placeholder="Enter reason..."
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedUser(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm md:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedUser._id)}
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm md:text-base order-1 sm:order-2 mb-3 sm:mb-0"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Reject Modal */}
        {showBulkRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Bulk Reject</h3>
              <p className="mb-4 text-sm md:text-base">
                Reject <strong>{selectedUsers.length}</strong> selected users?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm md:text-base"
                  rows="3"
                  placeholder="Enter reason..."
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowBulkRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm md:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkReject}
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm md:text-base order-1 sm:order-2 mb-3 sm:mb-0"
                >
                  Confirm Bulk Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingVerifications;