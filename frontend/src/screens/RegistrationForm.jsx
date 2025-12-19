import React, { useState, useEffect } from 'react'
import { useRegisterUserMutation } from '../slices/userApiSlice.js'
import { useNavigate } from 'react-router-dom'

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    level: '',
    amount: ''
  })
  
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [userData, setUserData] = useState(null)
  
  const navigate = useNavigate()
  const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation()
  
  // Define level-based pricing
  const levelPrices = {
    '100': 1500,
    '200': 2500,
    '300': 3500,
    '400': 4500,
    '500': 5500,
    'alumni': 1000,
    'guest': 2000
  }
  
  useEffect(() => {
    // Auto-calculate amount when level changes
    if (formData.level && levelPrices[formData.level]) {
      setFormData(prev => ({
        ...prev,
        amount: levelPrices[formData.level].toString()
      }))
    }
  }, [formData.level])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.level) {
      newErrors.level = 'Please select your level'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      const registrationResponse = await registerUser(formData).unwrap()
      
      setUserData(registrationResponse)
      setSuccessMessage(registrationResponse.message)
      setIsRegistered(true)
      
      // Clear errors
      setErrors({})
      
    } catch (error) {
      console.error('Registration error:', error)
      setSuccessMessage('')
      
      if (error.data?.error) {
        setErrors({ submit: error.data.error })
      } else if (error.data?.message) {
        setErrors({ submit: error.data.message })
      } else {
        setErrors({ submit: 'Registration failed. Please try again.' })
      }
    }
  }
  
  const handleProceedToPayment = () => {
    // Navigate to payment screen with user data
    navigate('/payment', { 
      state: { 
        userId: userData._id,
        email: userData.email,
        level: userData.level,
        amount: userData.amount
      } 
    })
  }
  
  const levels = [
    { value: '', label: 'Select your level' },
    { value: '100', label: '100 Level - ₦1,500' },
    { value: '200', label: '200 Level - ₦2,500' },
    { value: '300', label: '300 Level - ₦3,500' },
    { value: '400', label: '400 Level - ₦4,500' },
    { value: '500', label: '500 Level - ₦5,500' },
    { value: 'alumni', label: 'Alumni - ₦1,000' },
    { value: 'guest', label: 'Guest - ₦2,000' }
  ]
  
  return (
    <div className="registration-container">
      <div className="registration-card">
        <div className="registration-header">
          <h2 className="registration-title">Event Registration</h2>
          <p className="registration-subtitle">
            Fill in your details to register for the event
          </p>
        </div>
        
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        
        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}
        
        {!isRegistered ? (
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter your full name"
                disabled={isRegistering}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                disabled={isRegistering}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="level" className="form-label">
                Level *
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className={`form-select ${errors.level ? 'error' : ''}`}
                disabled={isRegistering}
              >
                {levels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              {errors.level && <span className="error-text">{errors.level}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="amount" className="form-label">
                Amount *
              </label>
              <div className="amount-display">
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  value={`₦${formData.amount ? parseInt(formData.amount).toLocaleString() : '0'}`}
                  readOnly
                  className="amount-input"
                />
                <span className="amount-note">
                  Amount is automatically calculated based on your level
                </span>
              </div>
            </div>
            
            <button
              type="submit"
              className="submit-btn"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <span className="spinner"></span>
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>
        ) : (
          <div className="registration-success">
            <div className="success-icon">✓</div>
            <h3>Registration Successful!</h3>
            <p>Your registration has been completed successfully.</p>
            
            <div className="user-summary">
              <div className="summary-item">
                <span className="summary-label">Name:</span>
                <span className="summary-value">{userData.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Email:</span>
                <span className="summary-value">{userData.email}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Level:</span>
                <span className="summary-value">{userData.level} Level</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Amount:</span>
                <span className="summary-value">₦{parseInt(userData.amount).toLocaleString()}</span>
              </div>
            </div>
            
            <button
              onClick={handleProceedToPayment}
              className="payment-btn"
            >
              Proceed to Payment
            </button>
            
            <p className="payment-note">
              You will need to verify your email before generating payment account details
            </p>
          </div>
        )}
        
        <div className="registration-footer">
          <p className="footer-text">
            * Amounts: 100L(₦1,500) | 200L(₦2,500) | 300L(₦3,500) | 400L(₦4,500) | 500L(₦5,500)
          </p>
          <p className="footer-text">
            Alumni: ₦1,000 | Guest: ₦2,000
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegistrationForm