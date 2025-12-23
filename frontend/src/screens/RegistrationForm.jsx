import React, { useState } from 'react'
import { useRegisterUserMutation } from '../slices/userApiSlice.js'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const RegistrationScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    level: '100'
  })
  
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [userData, setUserData] = useState(null)
  
  const navigate = useNavigate()
  const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation()
  
  // Level mapping to amounts (hidden from user during registration)
  const levelAmounts = {
    '100': 4000,
    '200': 3000,
    '300': 3000,
    '400': 3000,
    '500': 3000
  }
  
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
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters'
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    if (!formData.level) newErrors.level = 'Please select your level'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      // Calculate amount based on level
      const amount = levelAmounts[formData.level] || 3000
      
      const registrationResponse = await registerUser({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        level: formData.level,
        amount: amount // Send amount to backend
      }).unwrap()
      
      setUserData(registrationResponse)
      setSuccessMessage('Registration successful! Check your payment details below.')
      setIsRegistered(true)
      setErrors({})
      
    } catch (error) {
      console.error('Registration error:', error)
      setSuccessMessage('')
      
      if (error.data?.error) {
        setErrors({ submit: error.data.error })
      } else if (error.data?.message) {
        setErrors({ submit: error.data.message })
      } else {
        setErrors({ submit: 'Something went wrong. Please try again.' })
      }
    }
  }
  
  const handleProceedToPayment = () => {
    if (userData?.data) {
      navigate('/payment', { 
        state: { 
          userId: userData.data._id,
          userData: userData.data,
          // Pass the calculated amount to payment screen
          amount: levelAmounts[userData.data.level] || 3000
        } 
      })
    }
  }
  
  const handleGoToLogin = () => {
    navigate('/login')
  }
  
  const levelOptions = [
    { value: '100', label: '100 Level' },
    { value: '200', label: '200 Level' },
    { value: '300', label: '300 Level' },
    { value: '400', label: '400 Level' },
    { value: '500', label: '500 Level' },
  ]
  
  const getLevelLabel = (levelValue) => {
    const option = levelOptions.find(opt => opt.value === levelValue)
    return option ? option.label : 'Unknown Level'
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
              Event Registration
            </h1>
            <p className="text-gray-600 text-sm">
              Secure your spot for an unforgettable experience
            </p>
          </div>
          
          {/* Error/Success Messages */}
          {errors.submit && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-500 rounded-lg border border-red-200 mb-6 animate-[slideDown_0.3s_ease-out]">
              <span className="font-bold text-lg">!</span>
              {errors.submit}
            </div>
          )}
          
          {successMessage && !isRegistered && (
            <div className="flex items-center gap-3 p-4 bg-green-50 text-green-500 rounded-lg border border-green-200 mb-6 animate-[slideDown_0.3s_ease-out]">
              <span className="font-bold text-lg">✓</span>
              {successMessage}
            </div>
          )}
          
          {/* Auth Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <div className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-white text-blue-600 font-medium shadow-sm cursor-default">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7M7.5,13.5L9,12L11,14L15.5,9.5L17,11L11,17L7.5,13.5Z" />
              </svg>
              <span>Register</span>
            </div>
            <div 
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-gray-600 font-medium cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleGoToLogin}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z" />
              </svg>
              <span>Login</span>
            </div>
          </div>
          
          {!isRegistered ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="name" className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  {errors.name && (
                    <span className="text-sm text-red-500 font-medium">{errors.name}</span>
                  )}
                </div>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                  </svg>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium ${errors.name ? 'border-red-500 animate-[shake_0.5s_ease-in-out]' : 'border-gray-200'}`}
                    placeholder="John Doe"
                    disabled={isRegistering}
                    maxLength={100}
                  />
                </div>
              </div>
              
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
                    disabled={isRegistering}
                  />
                </div>
              </div>
              
              {/* Phone Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="phone" className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Phone Number
                  </label>
                  {errors.phone && (
                    <span className="text-sm text-red-500 font-medium">{errors.phone}</span>
                  )}
                </div>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" />
                  </svg>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium ${errors.phone ? 'border-red-500 animate-[shake_0.5s_ease-in-out]' : 'border-gray-200'}`}
                    placeholder="08012345678"
                    disabled={isRegistering}
                  />
                </div>
              </div>
              
              {/* Level Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="level" className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Academic Level
                  </label>
                  {errors.level && (
                    <span className="text-sm text-red-500 font-medium">{errors.level}</span>
                  )}
                </div>
                <div className="relative">
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7,10L12,15L17,10H7Z" />
                  </svg>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className={`w-full pl-4 pr-12 py-4 bg-gray-50 border-2 rounded-lg text-gray-800 appearance-none focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium cursor-pointer ${errors.level ? 'border-red-500' : 'border-gray-200'}`}
                    disabled={isRegistering}
                  >
                    <option value="">Select your level</option>
                    {levelOptions.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Level Note - No price shown */}
              {formData.level && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Selected Level:</span> {getLevelLabel(formData.level)}
                    <br />
                    <span className="text-xs text-gray-500 mt-1 block">
                      Amount payable will be displayed on the next screen
                    </span>
                  </p>
                </div>
              )}
              
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 px-8 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 relative overflow-hidden group shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isRegistering}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isRegistering ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Payment Details</span>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
                      </svg>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              {/* Divider */}
              <div className="flex items-center text-center text-gray-500 text-sm my-4">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-4">Already registered?</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>
              
              {/* Login Button */}
              <button
                type="button"
                onClick={handleGoToLogin}
                className="w-full py-3 px-6 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z" />
                </svg>
                <span>Login to Check Status</span>
              </button>
              
              {/* Info Note */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
                <p className="text-sm text-gray-700">
                  Amount payable is based on your academic level. You'll see the exact amount on the payment screen.
                </p>
              </div>
            </form>
          ) : (
            /* Success Screen */
            <div className="animate-[fadeIn_0.6s_ease-out]">
              {/* Success Graphic */}
              <div className="relative mb-10">
                <div className="w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto animate-[scaleIn_0.6s_cubic-bezier(0.68,-0.55,0.265,1.55)]">
                  <svg className="w-14 h-14 text-white" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="25" fill="none" stroke="currentColor" strokeWidth="2" className="stroke-dasharray-166 stroke-dashoffset-166 animate-[stroke_0.6s_cubic-bezier(0.65,0,0.45,1)_forwards]" />
                    <path fill="none" stroke="currentColor" strokeWidth="2" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="stroke-dasharray-48 stroke-dashoffset-48 animate-[stroke_0.3s_cubic-bezier(0.65,0,0.45,1)_0.8s_forwards]" />
                  </svg>
                </div>
                
                {/* Confetti */}
                <div className="absolute inset-0">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i}
                      className={`absolute w-2.5 h-5 top-0 left-[calc((100%/13)*${i + 1})] rotate-${(360/12) * (i + 1)} opacity-0 animate-[confetti_1s_ease-out_0.3s_forwards]`}
                      style={{ 
                        backgroundColor: `hsl(${(360/12) * (i + 1)}, 100%, 65%)`,
                        transform: `rotate(${(360/12) * (i + 1)}deg)`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              
              {/* Success Content */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                <p className="text-gray-600 mb-8">
                  Your details have been saved. Proceed to view payment instructions.
                </p>
                
                {/* Registration Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-8 border border-gray-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">REGISTRATION DETAILS</span>
                    <span className="text-sm font-mono text-gray-600">#{userData?.data?._id?.slice(-8) || 'PENDING'}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Full Name</span>
                      <span className="text-sm font-semibold text-gray-800">{userData?.data?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="text-sm font-semibold text-gray-800">{userData?.data?.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Phone</span>
                      <span className="text-sm font-semibold text-gray-800">{userData?.data?.phone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Academic Level</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                        {getLevelLabel(userData?.data?.level)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm font-bold text-yellow-600">Payment Pending</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mb-8">
                  <button
                    onClick={handleProceedToPayment}
                    className="w-full py-4 px-8 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 relative overflow-hidden group shadow-lg mb-4"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      <span>View Payment Details</span>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsRegistered(false)}
                      className="flex-1 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
                    >
                      Edit Registration
                    </button>
                    
                    <button
                      onClick={handleGoToLogin}
                      className="flex-1 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium transition-all duration-300 hover:border-gray-300 hover:shadow-md"
                    >
                      Login Instead
                    </button>
                  </div>
                </div>
                
                {/* Success Note */}
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M11,16.5V18H13V16.5H11M12,6.5C10.07,6.5 8.5,8.07 8.5,10H10C10,8.9 10.9,8 12,8C13.1,8 14,8.9 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10C16,8.07 14.93,6.5 12,6.5Z" />
                  </svg>
                  <p className="text-sm text-gray-700">
                    Proceed to payment details to see the exact amount and get OPay payment instructions.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex flex-col items-center gap-2 text-blue-600">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold shadow-lg shadow-blue-200">
                  1
                </div>
                <span className="text-xs font-medium">Register</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-200"></div>
              
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <span className="text-xs font-medium">View Amount & Pay</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-200"></div>
              
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <span className="text-xs font-medium">Upload Receipt</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-200"></div>
              
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <span className="text-xs font-medium">Get Ticket</span>
              </div>
            </div>
            
            {/* Footer Note */}
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
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
        
        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }
        
        @keyframes confetti {
          0% {
            opacity: 0;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: translateY(200px) rotate(360deg);
          }
        }
        
        .stroke-dasharray-166 {
          stroke-dasharray: 166;
        }
        
        .stroke-dashoffset-166 {
          stroke-dashoffset: 166;
        }
        
        .stroke-dasharray-48 {
          stroke-dasharray: 48;
        }
        
        .stroke-dashoffset-48 {
          stroke-dashoffset: 48;
        }
      `}</style>
    </div>
  )
}

export default RegistrationScreen