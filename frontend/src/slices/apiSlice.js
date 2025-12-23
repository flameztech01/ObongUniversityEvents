import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// apiSlice.js
const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_URL || ''}/api`,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    // Try to get token from Redux state first
    const token = getState().auth.adminInfo?.token;
    
    // If not in Redux, check localStorage
    if (!token) {
      const adminInfo = localStorage.getItem('adminInfo');
      if (adminInfo) {
        const parsed = JSON.parse(adminInfo);
        headers.set('Authorization', `Bearer ${parsed.token}`);
        return headers;
      }
    }
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User', 'Admin'],
  endpoints: (builder) => ({}),
});
