// src/admin/AdminLayout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { adminLogout } from "../slices/authSlice";
import AdminNavbar from "../components/adminNavbar";
import AdminLogin from "../adminScreens/adminLoginScreen.jsx";
import PendingVerifications from "../adminScreens/PendingVerifications.jsx";
import AllUsers from "../adminScreens/AllUsers";
import Statistics from "../adminScreens/Statistics.jsx";
import { Outlet } from "react-router-dom";

// Import API hooks
import {
  useGetPendingVerificationsQuery,
  useGetAllUsersQuery,
  useGetDashboardStatsQuery,
  useApprovePaymentMutation,
  useRejectPaymentMutation,
  useExportUsersMutation,
  useResendTicketEmailMutation,
  useUpdateUserMutation,
  useBulkProcessPaymentsMutation,
} from "../slices/adminApiSlice";

const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [screen, setScreen] = useState("login");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // API Hooks
  const [approvePayment] = useApprovePaymentMutation();
  const [rejectPayment] = useRejectPaymentMutation();
  const [exportUsers] = useExportUsersMutation();
  const [resendTicketEmail] = useResendTicketEmailMutation();
  const [updateUser] = useUpdateUserMutation();
  const [bulkProcessPayments] = useBulkProcessPaymentsMutation();

  const {
    data: pendingData,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = useGetPendingVerificationsQuery();
  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useGetAllUsersQuery({
    page,
    limit: 20,
    search: searchTerm,
  });
  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetDashboardStatsQuery();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      setScreen("pending");
    }
  }, []);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleLogout = () => {
    dispatch(adminLogout());
    setScreen("login");
    setSuccessMessage("Logged out successfully");
  };

  const handleLoginSuccess = () => {
    setSuccessMessage("Login successful!");
    setScreen("pending");
  };

  const handleApprove = async (userId) => {
    try {
      await approvePayment({ userId, adminNotes }).unwrap();
      setSuccessMessage("Payment approved successfully!");
      setAdminNotes("");
      refetchPending();
      refetchUsers();
      refetchStats();
      setShowApproveModal(false);
      setSelectedUser(null);
    } catch (error) {
      setErrorMessage(error?.data?.message || "Failed to approve payment");
    }
  };

  const handleReject = async (userId) => {
    if (!rejectionReason.trim()) {
      setErrorMessage("Please provide a rejection reason");
      return;
    }

    try {
      await rejectPayment({ userId, rejectionReason }).unwrap();
      setSuccessMessage("Payment rejected successfully!");
      setRejectionReason("");
      refetchPending();
      refetchUsers();
      refetchStats();
      setShowRejectModal(false);
      setSelectedUser(null);
      setShowBulkRejectModal(false);
    } catch (error) {
      setErrorMessage(error?.data?.message || "Failed to reject payment");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.length === 0) {
      setErrorMessage("Please select users to approve");
      return;
    }

    try {
      await bulkProcessPayments({
        userIds: selectedUsers,
        action: "approve",
        reason: adminNotes,
      }).unwrap();

      setSuccessMessage(`Approved ${selectedUsers.length} users successfully!`);
      setSelectedUsers([]);
      setAdminNotes("");
      refetchPending();
      refetchUsers();
      refetchStats();
    } catch (error) {
      setErrorMessage(error?.data?.message || "Failed to bulk approve");
    }
  };

  const handleBulkReject = async () => {
    if (selectedUsers.length === 0) {
      setErrorMessage("Please select users to reject");
      return;
    }

    if (!rejectionReason.trim()) {
      setErrorMessage("Please provide a rejection reason");
      return;
    }

    try {
      await bulkProcessPayments({
        userIds: selectedUsers,
        action: "reject",
        reason: rejectionReason,
      }).unwrap();

      setSuccessMessage(`Rejected ${selectedUsers.length} users successfully!`);
      setSelectedUsers([]);
      setRejectionReason("");
      setShowBulkRejectModal(false);
      refetchPending();
      refetchUsers();
      refetchStats();
    } catch (error) {
      setErrorMessage(error?.data?.message || "Failed to bulk reject");
    }
  };

  const handleExport = async (format = "json") => {
    try {
      const result = await exportUsers(format).unwrap();

      if (format === "csv") {
        const url = window.URL.createObjectURL(result);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users_export_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const dataStr = JSON.stringify(result, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = window.URL.createObjectURL(dataBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users_export_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      setSuccessMessage(`Export completed successfully!`);
    } catch (error) {
      setErrorMessage(error?.data?.message || "Export failed");
    }
  };

  const handleToggleSelect = (userId) => {
    if (userId === "clear") {
      setSelectedUsers([]);
    } else if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "pending_verification":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Login Screen
  if (screen === "login") {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        successMessage={successMessage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar
        screen={screen}
        setScreen={setScreen}
        pendingCount={pendingData?.count || 0}
        onLogout={handleLogout}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet /> {/* This renders the child route component */}
      </main>

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
        {screen === "pending" && (
          <PendingVerifications
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
            onToggleSelect={handleToggleSelect}
            onBulkApprove={handleBulkApprove}
            onBulkReject={() => {
              if (selectedUsers.length > 0) {
                setShowBulkRejectModal(true);
              }
            }}
            onRefresh={refetchPending}
          />
        )}

        {screen === "users" && (
          <AllUsers
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

        {screen === "stats" && (
          <Statistics
            data={statsData}
            loading={statsLoading}
            onRefresh={refetchStats}
          />
        )}
      </main>

      {/* ========== MODALS ========== */}

      {/* Approve Modal */}
      {showApproveModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Approve Payment</h3>
            <p className="mb-4">
              Approve payment for <strong>{selectedUser.name}</strong> (
              {selectedUser.email})?
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
                placeholder="Add any notes..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedUser(null);
                  setAdminNotes("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(selectedUser._id)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Confirm Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal (Single User) */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reject Payment</h3>
            <p className="mb-4">
              Reject payment for <strong>{selectedUser.name}</strong> (
              {selectedUser.email})?
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
                placeholder="Enter reason for rejection..."
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedUser(null);
                  setRejectionReason("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedUser._id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                disabled={!rejectionReason.trim()}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Reject Modal */}
      {showBulkRejectModal && selectedUsers.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Bulk Reject Users</h3>
            <p className="mb-4">
              Reject <strong>{selectedUsers.length}</strong> selected user(s)?
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
                placeholder="Enter reason for rejection..."
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBulkRejectModal(false);
                  setRejectionReason("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkReject}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                disabled={!rejectionReason.trim()}
              >
                Reject {selectedUsers.length} Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold">User Details</h3>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedUser.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedUser.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedUser.phone || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Level:</span>{" "}
                    {selectedUser.level}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Payment Information</h4>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Amount:</span> ₦
                    {selectedUser.amount?.toLocaleString() || "0"}
                  </p>
                  <p>
                    <span className="font-medium">Reference:</span>{" "}
                    {selectedUser.paymentReference || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(
                        selectedUser.status
                      )}`}
                    >
                      {selectedUser.status?.replace("_", " ").toUpperCase()}
                    </span>
                  </p>
                  {selectedUser.receiptUrl && (
                    <p>
                      <span className="font-medium">Receipt:</span>{" "}
                      <a
                        href={selectedUser.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Receipt
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Timestamps</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Registered:</span>{" "}
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </p>
                {selectedUser.paymentDate && (
                  <p>
                    <span className="font-medium">Payment Date:</span>{" "}
                    {new Date(selectedUser.paymentDate).toLocaleString()}
                  </p>
                )}
                {selectedUser.approvedAt && (
                  <p>
                    <span className="font-medium">Approved:</span>{" "}
                    {new Date(selectedUser.approvedAt).toLocaleString()}
                  </p>
                )}
                {selectedUser.rejectedAt && (
                  <p>
                    <span className="font-medium">Rejected:</span>{" "}
                    {new Date(selectedUser.rejectedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              {selectedUser.status === "pending_verification" && (
                <>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      setShowApproveModal(true);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
