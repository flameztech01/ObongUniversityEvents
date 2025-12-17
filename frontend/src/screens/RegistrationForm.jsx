import React, { useState } from 'react'
import { useRegisterUserMutation, useInitializePaymentMutation } from '../slices/userApiSlice.js'

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    level: '',
    amount: ''
  })
  
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [userData, setUserData] = useState(null)
  const [paymentUrl, setPaymentUrl] = useState('')
  
  // RTK Query mutations
  const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation()
  const [initializePayment, { isLoading: isInitializing }] = useInitializePaymentMutation()
  
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
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required'
    } else if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
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
      // Step 1: Register the user
      const registrationResponse = await registerUser(formData).unwrap()
      
      setUserData(registrationResponse)
      setSuccessMessage(registrationResponse.message)
      
      // Step 2: Initialize payment with Paystack
      const paymentData = {
        userId: registrationResponse._id,
        email: registrationResponse.email,
        amount: registrationResponse.amount
      }
      
      const paymentResponse = await initializePayment(paymentData).unwrap()
      setPaymentUrl(paymentResponse.authorization_url)
      
      // Automatically redirect to Paystack payment page
      if (paymentResponse.authorization_url) {
        window.location.href = paymentResponse.authorization_url
      }
      
    } catch (error) {
      console.error('Registration error:', error)
      setSuccessMessage('')
      
      if (error.data?.message) {
        setErrors({ submit: error.data.message })
      } else {
        setErrors({ submit: 'Registration failed. Please try again.' })
      }
    }
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
    <div className="registration-container">
      <div className="registration-card">
        <div className="registration-header">
          <h2 className="registration-title">Event Registration</h2>
          <p className="registration-subtitle">
            Fill in your details to register for the event
          </p>
        </div>
        
        {successMessage && !paymentUrl && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        
        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}
        
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
              Amount (₦) *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`form-input ${errors.amount ? 'error' : ''}`}
              placeholder="Enter amount"
              min="0"
              step="100"
              disabled={isRegistering}
            />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={isRegistering || isInitializing}
          >
            {isRegistering || isInitializing ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              'Register & Proceed to Payment'
            )}
          </button>
        </form>
        
        {userData && (
          <div className="user-info">
            <h3>Registration Details:</h3>
            <p><strong>Name:</strong> {userData.name}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Level:</strong> {userData.level}</p>
            <p><strong>Amount:</strong> ₦{userData.amount}</p>
            <p><strong>Status:</strong> {userData.paid ? 'Paid' : 'Pending Payment'}</p>
          </div>
        )}
        
        {paymentUrl && (
          <div className="payment-redirect">
            <p>Redirecting to payment page...</p>
            <p>If you are not redirected automatically, 
              <a href={paymentUrl} className="payment-link">click here</a>
            </p>
          </div>
        )}
        
        <div className="registration-footer">
          <p className="footer-text">
            * All fields are required. After registration, you will be redirected to Paystack for payment.
          </p>
          <p className="footer-text">
            Your ticket ID will be generated after successful payment.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegistrationForm