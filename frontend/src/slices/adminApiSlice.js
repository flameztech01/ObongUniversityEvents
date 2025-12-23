  import { apiSlice } from "./apiSlice";

  const ADMIN_URL = "/admin";

  export const adminApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      // Admin authentication
      loginAdmin: builder.mutation({
        query: (credentials) => ({
          url: `${ADMIN_URL}/login`,
          method: "POST",
          body: credentials,
        }),
      }),

      // Get dashboard statistics
      getDashboardStats: builder.query({
        query: () => ({
          url: `${ADMIN_URL}/stats`,
          method: "GET",
        }),
        providesTags: ['DashboardStats'],
      }),

      // Get all pending verifications
      getPendingVerifications: builder.query({
        query: () => ({
          url: `${ADMIN_URL}/pending-verifications`,
          method: "GET",
        }),
        providesTags: ['PendingVerifications'],
      }),

      // Approve payment and generate ticket
      approvePayment: builder.mutation({
        query: ({ userId, adminNotes }) => ({
          url: `${ADMIN_URL}/approve/${userId}`,
          method: "PUT",
          body: { adminNotes },
        }),
        invalidatesTags: ['PendingVerifications', 'AllUsers', 'DashboardStats'],
      }),

      // Reject payment
      rejectPayment: builder.mutation({
        query: ({ userId, rejectionReason }) => ({
          url: `${ADMIN_URL}/reject/${userId}`,
          method: "PUT",
          body: { rejectionReason },
        }),
        invalidatesTags: ['PendingVerifications', 'AllUsers', 'DashboardStats'],
      }),

      // Get all users with pagination
      getAllUsers: builder.query({
        query: ({ page = 1, limit = 20, status, search } = {}) => {
          const params = new URLSearchParams();
          params.append('page', page);
          params.append('limit', limit);
          if (status) params.append('status', status);
          if (search) params.append('search', search);
          
          return {
            url: `${ADMIN_URL}/users?${params.toString()}`,
            method: "GET",
          };
        },
        providesTags: ['AllUsers'],
      }),

      // Get user details by ID
      getUserDetails: builder.query({
        query: (userId) => ({
          url: `${ADMIN_URL}/users/${userId}`,
          method: "GET",
        }),
        providesTags: (result, error, userId) => [{ type: 'UserDetails', id: userId }],
      }),

      // Search users
      searchUsers: builder.query({
        query: (searchQuery) => ({
          url: `${ADMIN_URL}/search?query=${encodeURIComponent(searchQuery)}`,
          method: "GET",
        }),
      }),

      // Export users data
      exportUsers: builder.mutation({
        query: (format = 'json') => ({
          url: `${ADMIN_URL}/export?format=${format}`,
          method: "GET",
          responseHandler: (response) => {
            if (format === 'csv') {
              return response.blob();
            }
            return response.json();
          },
          cache: "no-cache",
        }),
      }),

      // Get analytics data
      getAnalytics: builder.query({
        query: ({ startDate, endDate } = {}) => {
          const params = new URLSearchParams();
          if (startDate) params.append('startDate', startDate);
          if (endDate) params.append('endDate', endDate);
          
          return {
            url: `${ADMIN_URL}/analytics?${params.toString()}`,
            method: "GET",
          };
        },
      }),

      // Update user information (admin only)
      updateUser: builder.mutation({
        query: ({ userId, userData }) => ({
          url: `${ADMIN_URL}/users/${userId}`,
          method: "PUT",
          body: userData,
        }),
        invalidatesTags: (result, error, { userId }) => [
          'AllUsers',
          { type: 'UserDetails', id: userId },
          'DashboardStats'
        ],
      }),

      // Resend ticket email
      resendTicketEmail: builder.mutation({
        query: (userId) => ({
          url: `${ADMIN_URL}/resend-ticket/${userId}`,
          method: "POST",
        }),
      }),

      // Bulk approve/reject
      bulkProcessPayments: builder.mutation({
        query: ({ userIds, action, reason }) => ({
          url: `${ADMIN_URL}/bulk-process`,
          method: "POST",
          body: { userIds, action, reason },
        }),
        invalidatesTags: ['PendingVerifications', 'AllUsers', 'DashboardStats'],
      }),
    }),
  });

  export const {
    useLoginAdminMutation,
    useGetDashboardStatsQuery,
    useGetPendingVerificationsQuery,
    useApprovePaymentMutation,
    useRejectPaymentMutation,
    useGetAllUsersQuery,
    useLazyGetAllUsersQuery,
    useGetUserDetailsQuery,
    useSearchUsersQuery,
    useLazySearchUsersQuery,
    useExportUsersMutation,
    useGetAnalyticsQuery,
    useUpdateUserMutation,
    useResendTicketEmailMutation,
    useBulkProcessPaymentsMutation,
    useLazyGetDashboardStatsQuery,
    useLazyGetPendingVerificationsQuery,
    useLazyGetAnalyticsQuery,
  } = adminApiSlice;