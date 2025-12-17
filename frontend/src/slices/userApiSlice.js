import { apiSlice } from "./apiSlice";

const USER_URL = '/users';

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (userData) => ({
                url: `${USER_URL}/register`,
                method: 'POST',
                body: userData,
            })
        }),
        initializePayment: builder.mutation({
            query: (paymentData) => ({
                url: `${USER_URL}/initialize-payment`,
                method: 'POST',
                body: paymentData,
            })
        }),
        paystackWebhook: builder.query({
            query: () => ({
                url: `${USER_URL}/paystack-webhook`,
                method: 'POST',
            })
        }),
        verifyPayment: builder.query({
            query: (reference) => ({
                url: `${USER_URL}/verify-payment/${reference}`,
                method: 'GET',
            })
        }),
        processPayment: builder.query({
            query: () => ({
                url: `${USER_URL}/pay`,
                method: 'POST',
            })
        }),
        verifyTicket: builder.query({
            query: (ticketId) => ({
                url: `${USER_URL}/verify/${ticketId}`,
                method: 'GET',
            })
        }),
        getPaymentStatus: builder.query({
            query: (userId) => ({
                url: `${USER_URL}/status/${userId}`,
                method: 'GET',
            })
        })
    })
})

export const {
    useRegisterUserMutation,
    useInitializePaymentMutation,
    usePaystackWebhookQuery,
    useVerifyPaymentQuery,
    useProcessPaymentQuery,
    useVerifyTicketQuery,
    useGetPaymentStatusQuery,
} = userApiSlice;