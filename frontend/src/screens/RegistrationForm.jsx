import React, { useState } from 'react'
import { useRegisterUserMutation } from '../slices/userApiSlice.js'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const RegistrationScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    level: 'basic'
  })
  
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [userData, setUserData] = useState(null)
  
  const navigate = useNavigate()
  const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation()
  
  const levelPrices = {
    'basic': 5000,
    'standard': 10000,
    'premium': 15000,
    'vip': 25000
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
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      const registrationResponse = await registerUser({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        level: formData.level,
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
          userData: userData.data
        } 
      })
    }
  }
  
  const handleGoToLogin = () => {
    navigate('/login')
  }
  
  const levels = [
    { value: 'basic', label: 'Basic - ₦5,000' },
    { value: 'standard', label: 'Standard - ₦10,000' },
    { value: 'premium', label: 'Premium - ₦15,000' },
    { value: 'vip', label: 'VIP - ₦25,000' }
  ]
  
  return (
    <div className="app-container">
      <div className="app-wrapper">
        <div className="decor-circle decor-1"></div>
        <div className="decor-circle decor-2"></div>
        <div className="decor-square"></div>
        <div className="decor-line"></div>
        <div className="decor-line line-vertical"></div>
        
        <div className="app-card">
          <div className="card-header">
            <div className="header-icon">
              <svg className="icon-ticket" viewBox="0 0 24 24">
                <path d="M15.58,16.8L12,14.5L8.42,16.8L9.5,12.68L6.21,10L10.46,9.54L12,5.68L13.54,9.54L17.79,10L14.5,12.68L15.58,16.8Z" />
              </svg>
            </div>
            <h1 className="card-title">Event Registration</h1>
            <p className="card-subtitle">
              Secure your spot for an unforgettable experience
            </p>
          </div>
          
          {errors.submit && (
            <div className="alert alert-error">
              <span className="alert-icon">!</span>
              {errors.submit}
            </div>
          )}
          
          {successMessage && !isRegistered && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              {successMessage}
            </div>
          )}
          
          <div className="auth-tabs">
            <div className="auth-tab active">
              <svg className="tab-icon" viewBox="0 0 24 24">
                <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7M7.5,13.5L9,12L11,14L15.5,9.5L17,11L11,17L7.5,13.5Z" />
              </svg>
              <span>Register</span>
            </div>
            <div className="auth-tab" onClick={handleGoToLogin}>
              <svg className="tab-icon" viewBox="0 0 24 24">
                <path d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z" />
              </svg>
              <span>Login</span>
            </div>
          </div>
          
          {!isRegistered ? (
            <form onSubmit={handleSubmit} className="app-form">
              <div className="form-field">
                <div className="field-header">
                  <label htmlFor="name" className="field-label">
                    Full Name
                  </label>
                  {errors.name && (
                    <span className="field-error">{errors.name}</span>
                  )}
                </div>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24">
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                  </svg>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`text-input ${errors.name ? 'input-error' : ''}`}
                    placeholder="John Doe"
                    disabled={isRegistering}
                    maxLength={100}
                  />
                </div>
              </div>
              
              <div className="form-field">
                <div className="field-header">
                  <label htmlFor="email" className="field-label">
                    Email Address
                  </label>
                  {errors.email && (
                    <span className="field-error">{errors.email}</span>
                  )}
                </div>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24">
                    <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                  </svg>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`text-input ${errors.email ? 'input-error' : ''}`}
                    placeholder="john@example.com"
                    disabled={isRegistering}
                  />
                </div>
              </div>
              
              <div className="form-field">
                <div className="field-header">
                  <label htmlFor="phone" className="field-label">
                    Phone Number
                  </label>
                  {errors.phone && (
                    <span className="field-error">{errors.phone}</span>
                  )}
                </div>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24">
                    <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" />
                  </svg>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`text-input ${errors.phone ? 'input-error' : ''}`}
                    placeholder="08012345678"
                    disabled={isRegistering}
                  />
                </div>
              </div>
              
              <div className="form-field">
                <div className="field-header">
                  <label htmlFor="level" className="field-label">
                    Ticket Tier
                  </label>
                  {errors.level && (
                    <span className="field-error">{errors.level}</span>
                  )}
                </div>
                <div className="select-wrapper">
                  <svg className="select-icon" viewBox="0 0 24 24">
                    <path d="M7,10L12,15L17,10H7Z" />
                  </svg>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className={`select-input ${errors.level ? 'input-error' : ''}`}
                    disabled={isRegistering}
                  >
                    {levels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {formData.level && (
                <div className="form-note">
                  <svg className="note-icon" viewBox="0 0 24 24">
                    <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M13,17H11V15H13V17M13,13H11V7H13V13Z" />
                  </svg>
                  <p>
                    <strong>Selected Tier:</strong> {levels.find(l => l.value === formData.level)?.label.split(' - ')[0]} • 
                    <strong> Amount:</strong> {formatCurrency(levelPrices[formData.level] || 0)}
                  </p>
                </div>
              )}
              
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <svg className="btn-icon" viewBox="0 0 24 24">
                      <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
                    </svg>
                  </>
                )}
              </button>
              
              <div className="form-divider">
                <span>Already registered?</span>
              </div>
              
              <button
                type="button"
                onClick={handleGoToLogin}
                className="btn btn-secondary"
              >
                <svg className="btn-icon" viewBox="0 0 24 24">
                  <path d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z" />
                </svg>
                <span>Login to Check Status</span>
              </button>
              
              <div className="form-note">
                <svg className="note-icon" viewBox="0 0 24 24">
                  <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
                <p>After registration, you'll receive OPay payment details. Upload your receipt to complete the process.</p>
              </div>
            </form>
          ) : (
            <div className="success-screen">
              <div className="success-graphic">
                <div className="success-circle">
                  <svg className="checkmark" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="25" fill="none" />
                    <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                  </svg>
                </div>
                <div className="confetti">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className={`confetti-piece piece-${i + 1}`}></div>
                  ))}
                </div>
              </div>
              
              <div className="success-content">
                <h2 className="success-title">Registration Confirmed!</h2>
                <p className="success-message">
                  Your registration is pending payment verification
                </p>
                
                <div className="ticket-summary">
                  <div className="ticket-header">
                    <span className="ticket-label">REGISTRATION</span>
                    <span className="ticket-id">#{userData?.data?._id?.slice(-8) || 'PENDING'}</span>
                  </div>
                  
                  <div className="ticket-details">
                    <div className="detail-row">
                      <span className="detail-label">Attendee</span>
                      <span className="detail-value">{userData?.data?.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{userData?.data?.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{userData?.data?.phone}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Tier</span>
                      <span className="detail-value tag">
                        {userData?.data?.level?.toUpperCase() || 'BASIC'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status</span>
                      <span className="detail-value status-pending">Payment Pending</span>
                    </div>
                  </div>
                </div>
                
                <div className="action-group">
                  <button
                    onClick={handleProceedToPayment}
                    className="btn btn-primary btn-lg"
                  >
                    <span>View Payment Details</span>
                    <svg className="btn-icon" viewBox="0 0 24 24">
                      <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                    </svg>
                  </button>
                  
                  <div className="action-group-secondary">
                    <button
                      onClick={() => setIsRegistered(false)}
                      className="btn btn-secondary"
                    >
                      Edit Registration
                    </button>
                    
                    <button
                      onClick={handleGoToLogin}
                      className="btn btn-outline"
                    >
                      Login Instead
                    </button>
                  </div>
                </div>
                
                <div className="success-note">
                  <svg className="note-icon" viewBox="0 0 24 24">
                    <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M11,16.5V18H13V16.5H11M12,6.5C10.07,6.5 8.5,8.07 8.5,10H10C10,8.9 10.9,8 12,8C13.1,8 14,8.9 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10C16,8.07 14.93,6.5 12,6.5Z" />
                  </svg>
                  <p>Proceed to payment details to get OPay account information and instructions.</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="card-footer">
            <div className="progress-indicator">
              <div className="progress-step active">
                <span className="step-number">1</span>
                <span className="step-label">Register</span>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <span className="step-number">2</span>
                <span className="step-label">Pay via OPay</span>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <span className="step-number">3</span>
                <span className="step-label">Upload Receipt</span>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <span className="step-number">4</span>
                <span className="step-label">Get Ticket</span>
              </div>
            </div>
            
            <div className="form-note">
              <svg className="note-icon" viewBox="0 0 24 24">
                <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
              </svg>
              <p>Need help? Contact support at support@event.com or call 0800-123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrationScreen