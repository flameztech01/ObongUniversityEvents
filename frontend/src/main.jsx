import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { createBrowserRouter, 
  RouterProvider } from 'react-router-dom'

import { Provider } from 'react-redux'
import store from './store.js'

import RegistrationForm from './screens/RegistrationForm.jsx'
import LoginScreen from './screens/LoginScreen.jsx'
import Dashboard from './screens/Dashboard.jsx'
import PaymentScreen from './screens/PaymentScreen.jsx'
import UploadReceiptScreen from './screens/UploadReceiptScreen.jsx'
import TicketScreen from './screens/TicketScreen.jsx'
import TicketWithId from './screens/TicketWithId.jsx'
import StatusScreen from './screens/StatusScreen.jsx'

import PrivateRoute from './components/PrivateRoute.jsx'
import AdminLayout from './screens/AdminLayout.jsx';

import AdminLogin from './adminScreens/adminLoginScreen.jsx';
import AllUsers from './adminScreens/AllUsers.jsx'
import PendingVerifications from './adminScreens/PendingVerifications.jsx'
import Statistics from './adminScreens/Statistics.jsx'

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const router = createBrowserRouter([
  {path: "/", element: <App />, children: [
    {index: true, element: <RegistrationForm />},
    {path: "/dashboard", element: <Dashboard />},
    {path: "/login", element: <LoginScreen />},
    {path: "/payment", element: <PaymentScreen />},
    {path: "/upload-receipt", element: <UploadReceiptScreen />},
    {path: "/ticket", element: <TicketScreen />},
    {path: "/ticket/:id", element: <TicketWithId />},
    {path: "/status/:userId", element: <StatusScreen />},

     // Update your routing like this:
     {path: '/admin/login' , element: <AdminLogin />},
     {path: 'admin/users', element: <AllUsers />},
     {path: 'admin/pending-verifications' , element: <PendingVerifications />},
     {path: 'admin/statistics' , element: <Statistics />},
  ]},
])

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <StrictMode>
    <RouterProvider
    router={router} />
  </StrictMode>,
  </Provider>
)
