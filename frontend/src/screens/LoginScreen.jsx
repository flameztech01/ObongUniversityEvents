import React, { useState } from 'react'
import { useLoginUserMutation } from '../slices/userApiSlice.js'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const LoginScreen = () => {
  const [formData, setFormData] = useState({
    email: ''
  })
  
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  
  const navigate = useNavigate()
  const [loginUser, { isLoading: isLoggingIn }] = useLoginUserMutation()
  
  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setIsLoading(true)
      const loginResponse = await loginUser({
        email: formData.email.toLowerCase().trim(),
      }).unwrap()
      
      // Navigate based on user status
      if (loginResponse.data) {
        const user = loginResponse.data
        
        if (user.status === 'pending_payment') {
          navigate('/payment', {
            state: {
              userId: user._id,
              userData: user
            }
          })
        } else if (user.status === 'pending_verification') {
          navigate(`/status/${user._id}`, {
            state: { user }
          })
        } else if (user.status === 'approved') {
          navigate(`/ticket/${user._id}`, {
            state: { user }
          })
        } else if (user.status === 'rejected') {
          navigate(`/status/${user._id}`, {
            state: { user }
          })
        } else {
          navigate('/dashboard')
        }
      }
      
    } catch (error) {
      console.error('Login error:', error)
      
      if (error.data?.error) {
        setErrors({ submit: error.data.error })
      } else if (error.data?.message) {
        setErrors({ submit: error.data.message })
      } else {
        setErrors({ submit: 'Something went wrong. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleGoToRegister = () => {
    navigate('/')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="fixed w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-60 animate-[float_20s_infinite_ease-in-out]"></div>
      <div className="fixed w-72 h-72 -bottom-36 -left-36 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-40 animate-[float_20s_infinite_ease-in-out] [animation-delay:-10s]"></div>
      <div className="fixed w-48 h-48 top-12 left-12 bg-gradient-to-br from-transparent to-blue-50 rotate-45 opacity-30"></div>
      <div className="fixed w-screen h-px bottom-24 left-0 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-50"></div>
      <div className="fixed w-px h-screen top-0 right-24 bg-gradient-to-b from-transparent via-blue-200 to-transparent opacity-50"></div>

      <div className="relative w-full max-w-md z-10">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Card Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-300 rounded-xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-white animate-bounce" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.58,16.8L12,14.5L8.42,16.8L9.5,12.68L6.21,10L10.46,9.54L12,5.68L13.54,9.54L17.79,10L14.5,12.68L15.58,16.8Z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
              Event Access
            </h1>
            <p className="text-gray-600 text-sm">
              Login to check your registration status and ticket
            </p>
          </div>
          
          {/* Error Message */}
          {errors.submit && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-500 rounded-lg border border-red-200 mb-6 animate-[slideDown_0.3s_ease-out]">
              <span className="font-bold text-lg">!</span>
              {errors.submit}
            </div>
          )}
          
          {/* Auth Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <div 
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-gray-600 font-medium cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleGoToRegister}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7M7.5,13.5L9,12L11,14L15.5,9.5L17,11L11,17L7.5,13.5Z" />
              </svg>
              <span>Register</span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-white text-blue-600 font-medium shadow-sm cursor-default">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z" />
              </svg>
              <span>Login</span>
            </div>
          </div>
          
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Email Address
                </label>
                {errors.email && (
                  <span className="text-sm text-red-500 font-medium">{errors.email}</span>
                )}
              </div>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium ${errors.email ? 'border-red-500 animate-[shake_0.5s_ease-in-out]' : 'border-gray-200'}`}
                  placeholder="john@example.com"
                  disabled={isLoggingIn || isLoading}
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 px-8 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 relative overflow-hidden group shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isLoggingIn || isLoading}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isLoggingIn || isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Checking Status...</span>
                  </>
                ) : (
                  <>
                    <span>Access My Account</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z" />
                    </svg>
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            {/* Divider */}
            <div className="flex items-center text-center text-gray-500 text-sm my-4">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4">Don't have an account?</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
            
            {/* Register Button */}
            <button
              type="button"
              onClick={handleGoToRegister}
              className="w-full py-3 px-6 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              <span>Register Instead</span>
            </button>
            
            {/* Info Note */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
              </svg>
              <p className="text-sm text-gray-700">
                Enter the email you used during registration to check your status, upload receipt, or download ticket.
              </p>
            </div>
          </form>
          
          {/* Status Examples */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-base font-semibold text-gray-800 mb-4">What you can check:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Payment Status Example */}
              <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3 transition-all duration-200 hover:bg-gray-100 hover:transform hover:-translate-y-1">
                <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Payment Status</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">Check if payment is pending, verified, or rejected</p>
                </div>
              </div>
              
              {/* Upload Receipt Example */}
              <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3 transition-all duration-200 hover:bg-gray-100 hover:transform hover:-translate-y-1">
                <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7M7.5,13.5L9,12L11,14L15.5,9.5L17,11L11,17L7.5,13.5Z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Upload Receipt</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">Submit payment proof if you haven't already</p>
                </div>
              </div>
              
              {/* Download Ticket Example */}
              <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3 transition-all duration-200 hover:bg-gray-100 hover:transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.58,16.8L12,14.5L8.42,16.8L9.5,12.68L6.21,10L10.46,9.54L12,5.68L13.54,9.54L17.79,10L14.5,12.68L15.58,16.8Z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Download Ticket</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">Access your QR ticket once approved</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
              </svg>
              <p className="text-sm text-gray-700">
                Need help? Contact support at support@event.com or call 0800-123-4567
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  )
}

export default LoginScreen