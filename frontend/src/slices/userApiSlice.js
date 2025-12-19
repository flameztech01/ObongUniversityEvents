import { apiSlice } from "./apiSlice";

const USER_URL = "/users";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (userData) => ({
        url: `${USER_URL}/register`,
        method: "POST",
        body: userData,
      }),
    }),
    initializePayment: builder.mutation({
      query: (paymentData) => ({
        url: `${USER_URL}/initialize-payment`,
        method: "POST",
        body: paymentData,
      }),
    }),
    paystackWebhook: builder.mutation({
      // Changed from query to mutation
      query: (webhookData) => ({
        // Added parameter for webhook data
        url: `${USER_URL}/paystack-webhook`,
        method: "POST",
        body: webhookData, // Added body for webhook data
      }),
    }),
    verifyPayment: builder.query({
      query: (reference) => ({
        url: `${USER_URL}/verify-payment/${reference}`,
        method: "GET",
      }),
    }),
    processPayment: builder.mutation({
      // Changed from query to mutation
      query: (paymentData) => ({
        // Added parameter for payment data
        url: `${USER_URL}/pay`,
        method: "POST",
        body: paymentData, // Added body for payment data
      }),
    }),
    verifyTicket: builder.query({
      query: (ticketId) => ({
        url: `${USER_URL}/verify/${ticketId}`,
        method: "GET",
      }),
    }),
    getPaymentStatus: builder.query({
      query: (userId) => ({
        url: `${USER_URL}/status/${userId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useInitializePaymentMutation,
  usePaystackWebhookMutation, // Changed from usePaystackWebhookQuery
  useVerifyPaymentQuery,
  useProcessPaymentMutation, // Changed from useProcessPaymentQuery
  useVerifyTicketQuery,
  useGetPaymentStatusQuery,
} = userApiSlice;
