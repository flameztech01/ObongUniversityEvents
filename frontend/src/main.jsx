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
import PaymentScreen from './screens/PaymentScreen.jsx'
import UploadReceiptScreen from './screens/UploadReceiptScreen.jsx'
import TicketScreen from './screens/TicketScreen.jsx'
import StatusScreen from './screens/StatusScreen.jsx'

const router = createBrowserRouter([
  {path: "/", element: <App />, children: [
    {index: true, element: <RegistrationForm />},
    {path: "/login", element: <LoginScreen />},
    {path: "/payment", element: <PaymentScreen />},
    {path: "/upload-receipt", element: <UploadReceiptScreen />},
    {path: "/ticket", element: <TicketScreen />},
    {path: "/status/:id", element: <StatusScreen />}
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
