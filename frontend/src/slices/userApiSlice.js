import { apiSlice } from "./apiSlice";

const USER_URL = "/users";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Register user
    registerUser: builder.mutation({
      query: (userData) => ({
        url: `${USER_URL}/register`,
        method: "POST",
        body: userData,
      }),
    }),

    // Login user
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: `${USER_URL}/login`,
        method: "POST",
        body: credentials,
      }),
    }),

    // Upload payment receipt
   uploadReceipt: builder.mutation({
      query: ({ userId, formData }) => ({
        url: `${USER_URL}/upload-receipt/${userId}`,
        method: 'POST',
        body: formData,
        // Remove content-type header for FormData (let browser set it)
      }),
    }),

    // Get payment status (protected route)
    getPaymentStatus: builder.query({
      query: (userId) => ({
        url: `${USER_URL}/status/${userId}`,
        method: "GET",
      }),
      providesTags: ['PaymentStatus'],
    }),

    // Verify ticket by scanning QR
    verifyTicket: builder.query({
      query: (ticketId) => ({
        url: `${USER_URL}/verify-ticket/${ticketId}`,
        method: "GET",
      }),
    }),

    // Get user profile (protected route - requires authentication)
    getUserProfile: builder.query({
      query: () => ({
        url: `${USER_URL}/profile`,
        method: "GET",
      }),
      providesTags: ['UserProfile'],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useUploadReceiptMutation,
  useGetPaymentStatusQuery,
  useVerifyTicketQuery,
  useGetUserProfileQuery,
  useLazyGetPaymentStatusQuery,
  useLazyVerifyTicketQuery,
} = userApiSlice;