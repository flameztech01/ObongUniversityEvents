import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useGetUserProfileQuery } from '../slices/userApiSlice'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      try {
        const storedUser = localStorage.getItem('currentUser')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          navigate('/login')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [navigate])

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending_verification': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pending_payment': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getNextAction = (status) => {
    switch (status) {
      case 'pending_payment':
        return { path: '/payment', label: 'Make Payment', variant: 'primary' }
      case 'pending_verification':
        return { path: `/status/${user?._id}`, label: 'Check Status', variant: 'secondary' }
      case 'approved':
        return { path: `/ticket/${user?._id}`, label: 'View Ticket', variant: 'success' }
      case 'rejected':
        return { path: `/status/${user?._id}`, label: 'View Details', variant: 'error' }
      default:
        return { path: '/login', label: 'Check Status', variant: 'secondary' }
    }
  }

  const getButtonVariantClass = (variant) => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-br from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white shadow-lg hover:shadow-xl'
      case 'secondary':
        return 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
      case 'success':
        return 'bg-gradient-to-br from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white shadow-lg hover:shadow-xl'
      case 'error':
        return 'bg-gradient-to-br from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white shadow-lg hover:shadow-xl'
      default:
        return 'bg-gradient-to-br from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white shadow-lg hover:shadow-xl'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5">
        <div className="relative w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>
            <div className="flex items-center gap-5 p-6">
              <div className="w-10 h-10 border-3 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Loading Dashboard</h3>
                <p className="text-sm text-gray-600">Please wait while we load your information...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    navigate('/login')
    return null
  }

  const nextAction = getNextAction(user.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="fixed w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-60 animate-[float_20s_infinite_ease-in-out]"></div>
      <div className="fixed w-72 h-72 -bottom-36 -left-36 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-40 animate-[float_20s_infinite_ease-in-out] [animation-delay:-10s]"></div>
      <div className="fixed w-80 h-80 top-1/2 -right-40 -translate-y-1/2 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-50"></div>
      <div className="fixed w-48 h-48 top-12 left-12 bg-gradient-to-br from-transparent to-blue-50 rotate-45 opacity-30"></div>
      <div className="fixed w-screen h-px bottom-24 left-0 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-50"></div>
      <div className="fixed w-px h-screen top-0 right-24 bg-gradient-to-b from-transparent via-blue-200 to-transparent opacity-50"></div>

      <div className="relative w-full max-w-md z-10">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Card Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-300 rounded-xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-white animate-bounce" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.58,16.8L12,14.5L8.42,16.8L9.5,12.68L6.21,10L10.46,9.54L12,5.68L13.54,9.54L17.79,10L14.5,12.68L15.58,16.8Z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your registration dashboard and ticket management
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {/* Step 1 */}
            <div className={`flex flex-col items-center gap-2 ${user.status === 'pending_payment' || user.status === 'pending_verification' || user.status === 'approved' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                ${user.status === 'pending_payment' || user.status === 'pending_verification' || user.status === 'approved' 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' 
                  : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <span className="text-xs font-medium">Register</span>
            </div>
            <div className="w-10 h-0.5 bg-gray-200 relative overflow-hidden">
              <div className={`absolute top-0 left-0 h-full bg-blue-500 transition-all duration-600
                ${user.status === 'pending_payment' || user.status === 'pending_verification' || user.status === 'approved' ? 'w-full' : 'w-0'}`}></div>
            </div>
            
            {/* Step 2 */}
            <div className={`flex flex-col items-center gap-2 ${user.status === 'pending_verification' || user.status === 'approved' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                ${user.status === 'pending_verification' || user.status === 'approved' 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' 
                  : user.status === 'pending_payment' 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' 
                    : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <span className="text-xs font-medium">Payment</span>
            </div>
            <div className="w-10 h-0.5 bg-gray-200 relative overflow-hidden">
              <div className={`absolute top-0 left-0 h-full bg-blue-500 transition-all duration-600
                ${user.status === 'pending_verification' || user.status === 'approved' ? 'w-full' : 'w-0'}`}></div>
            </div>
            
            {/* Step 3 */}
            <div className={`flex flex-col items-center gap-2 ${user.status === 'approved' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                ${user.status === 'approved' 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' 
                  : 'bg-gray-200 text-gray-500'}`}>
                3
              </div>
              <span className="text-xs font-medium">Approved</span>
            </div>
          </div>

          {/* Ticket Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-6 border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-dashed border-gray-200">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Event Registration</div>
                <div className="text-sm font-mono text-gray-600">ID: {user._id?.slice(-8).toUpperCase()}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(user.status)}`}>
                {user.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Name</span>
                <span className="text-sm font-semibold text-gray-800">{user.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm font-semibold text-gray-800">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ticket Level</span>
                <span className="text-sm font-semibold text-gray-800">{user.level?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-sm font-semibold text-gray-800">₦{user.amount?.toLocaleString()}</span>
              </div>
              {user.paymentReference && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Payment Ref</span>
                  <span className="text-sm font-semibold text-gray-800">{user.paymentReference}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Action Button */}
          <div className="mb-6">
            <Link 
              to={nextAction.path}
              state={{ userId: user._id, userData: user }}
              className={`block w-full py-4 px-8 rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group ${getButtonVariantClass(nextAction.variant)}`}
            >
              <span className="relative z-10">{nextAction.label}</span>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-6 border border-gray-200">
            <div className="flex items-center gap-2.5 mb-5">
              <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20,4H4V6H20V4M20,18H4V20H20V18M20,11H4V13H20V11Z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Check Status</span>
                <Link 
                  to={`/status/${user._id}`}
                  state={{ user }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 hover:bg-blue-50 rounded-md transition-colors"
                >
                  View Details
                </Link>
              </div>
              
              {user.status === 'pending_payment' && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Payment Details</span>
                  <Link 
                    to="/payment"
                    state={{ userId: user._id, userData: user }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    Copy Details
                  </Link>
                </div>
              )}
              
              {user.status === 'pending_verification' && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Upload Receipt</span>
                  <Link 
                    to="/upload-receipt"
                    state={{ userId: user._id, userData: user }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    Upload Now
                  </Link>
                </div>
              )}
              
              {user.status === 'approved' && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Your Ticket</span>
                  <Link 
                    to={`/ticket/${user._id}`}
                    state={{ user }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    Download Ticket
                  </Link>
                </div>
              )}
              
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-600">Need Help?</span>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 hover:bg-blue-50 rounded-md transition-colors"
                  onClick={() => window.open('mailto:support@event.com')}
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
              </svg>
              <p className="text-sm text-gray-700 leading-relaxed">
                Your registration is secured. Keep your payment reference safe for verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add float animation to CSS/global styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
      `}</style>
    </div>
  )
}

export default Dashboard