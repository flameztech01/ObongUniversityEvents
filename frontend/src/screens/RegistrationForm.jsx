// RegistrationForm.js
import React, { useState } from 'react'
import { useRegisterUserMutation } from '../slices/userApiSlice.js'
import { useNavigate } from 'react-router-dom'


const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    level: ''
  })
  
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [userData, setUserData] = useState(null)
  
  const navigate = useNavigate()
  const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation()
  
  const levelPrices = {
    '100': 1500,
    '200': 2500,
    '300': 3500,
    '400': 4500,
    '500': 5500,
    'alumni': 1000,
    'guest': 2000
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
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.level) newErrors.level = 'Please select your level'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      const amount = levelPrices[formData.level]
      
      const registrationResponse = await registerUser({
        name: formData.name,
        email: formData.email,
        level: formData.level,
        amount: amount
      }).unwrap()
      
      setUserData(registrationResponse)
      setSuccessMessage('Registration successful!')
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
    navigate('/payment', { 
      state: { 
        userId: userData._id,
        email: userData.email,
        level: userData.level,
        amount: userData.amount,
        name: userData.name
      } 
    })
  }
  
  const levels = [
    { value: '', label: 'Select your level' },
    { value: '100', label: '100 Level' },
    { value: '200', label: '200 Level' },
    { value: '300', label: '300 Level' },
    { value: '400', label: '400 Level' },
    { value: '500', label: '500 Level' },
    { value: 'alumni', label: 'Alumni' },
    { value: 'guest', label: 'Guest' }
  ]
  
  return (
    <div className="app-container">
      <div className="app-wrapper">
        {/* Decorative elements */}
        <div className="decor-circle decor-1"></div>
        <div className="decor-circle decor-2"></div>
        <div className="decor-line"></div>
        
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
                  <label htmlFor="level" className="field-label">
                    Student Level
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
              
              <div className="form-note">
                <svg className="note-icon" viewBox="0 0 24 24">
                  <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
                <p>Payment amount is determined by your selected level</p>
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
                  Your ticket has been reserved successfully
                </p>
                
                <div className="ticket-summary">
                  <div className="ticket-header">
                    <span className="ticket-label">E-TICKET</span>
                    <span className="ticket-id">#{userData._id?.slice(-8)}</span>
                  </div>
                  
                  <div className="ticket-details">
                    <div className="detail-row">
                      <span className="detail-label">Attendee</span>
                      <span className="detail-value">{userData.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{userData.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Level</span>
                      <span className="detail-value tag">{userData.level.toUpperCase()}</span>
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
                    <span>Proceed to Payment</span>
                    <svg className="btn-icon" viewBox="0 0 24 24">
                      <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => setIsRegistered(false)}
                    className="btn btn-secondary"
                  >
                    Edit Details
                  </button>
                </div>
                
                <div className="success-note">
                  <svg className="note-icon" viewBox="0 0 24 24">
                    <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M11,16.5V18H13V16.5H11M12,6.5C10.07,6.5 8.5,8.07 8.5,10H10C10,8.9 10.9,8 12,8C13.1,8 14,8.9 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10C16,8.07 14.93,6.5 12,6.5Z" />
                  </svg>
                  <p>You'll receive a confirmation email shortly</p>
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
                <span className="step-label">Payment</span>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <span className="step-number">3</span>
                <span className="step-label">Ticket</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrationForm