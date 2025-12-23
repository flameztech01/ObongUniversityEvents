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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
            {success}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Pending Verifications</h2>
            <p className="text-gray-600">Review and verify payment receipts</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refetch}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
            {selectedUsers.length > 0 && (
              <>
                <button
                  onClick={handleBulkApprove}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Approve Selected ({selectedUsers.length})
                </button>
                <button
                  onClick={() => setShowBulkRejectModal(true)}
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
        )}

        {/* Modals */}
        {showApproveModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Approve Payment</h3>
              <p className="mb-4">
                Approve payment for <strong>{selectedUser.name}</strong>?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  rows="3"
                  placeholder="Add notes..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedUser(null);
                    setAdminNotes('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApprove(selectedUser._id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {showRejectModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Reject Payment</h3>
              <p className="mb-4">
                Reject payment for <strong>{selectedUser.name}</strong>?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  rows="3"
                  placeholder="Enter reason..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedUser(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedUser._id)}
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {showBulkRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Bulk Reject</h3>
              <p className="mb-4">
                Reject <strong>{selectedUsers.length}</strong> selected users?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  rows="3"
                  placeholder="Enter reason..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowBulkRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkReject}
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  Confirm
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