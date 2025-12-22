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
          // Navigate to payment page
          navigate('/payment', {
            state: {
              userId: user._id,
              userData: user
            }
          })
        } else if (user.status === 'pending_verification') {
          // Navigate to status page
          navigate(`/status/${user._id}`, {
            state: { user }
          })
        } else if (user.status === 'approved') {
          // Navigate to ticket page
          navigate(`/ticket/${user._id}`, {
            state: { user }
          })
        } else if (user.status === 'rejected') {
          // Navigate to status page
          navigate(`/status/${user._id}`, {
            state: { user }
          })
        } else {
          // Default to dashboard
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
            <h1 className="card-title">Event Access</h1>
            <p className="card-subtitle">
              Login to check your registration status and ticket
            </p>
          </div>
          
          {errors.submit && (
            <div className="alert alert-error">
              <span className="alert-icon">!</span>
              {errors.submit}
            </div>
          )}
          
          <div className="auth-tabs">
            <div className="auth-tab" onClick={handleGoToRegister}>
              <svg className="tab-icon" viewBox="0 0 24 24">
                <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7M7.5,13.5L9,12L11,14L15.5,9.5L17,11L11,17L7.5,13.5Z" />
              </svg>
              <span>Register</span>
            </div>
            <div className="auth-tab active">
              <svg className="tab-icon" viewBox="0 0 24 24">
                <path d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z" />
              </svg>
              <span>Login</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="app-form">
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
                  disabled={isLoggingIn || isLoading}
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoggingIn || isLoading}
            >
              {isLoggingIn || isLoading ? (
                <>
                  <span className="spinner"></span>
                  Checking Status...
                </>
              ) : (
                <>
                  <span>Access My Account</span>
                  <svg className="btn-icon" viewBox="0 0 24 24">
                    <path d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z" />
                  </svg>
                </>
              )}
            </button>
            
            <div className="form-divider">
              <span>Don't have an account?</span>
            </div>
            
            <button
              type="button"
              onClick={handleGoToRegister}
              className="btn btn-secondary"
            >
              <svg className="btn-icon" viewBox="0 0 24 24">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              <span>Register Instead</span>
            </button>
            
            <div className="form-note">
              <svg className="note-icon" viewBox="0 0 24 24">
                <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
              </svg>
              <p>Enter the email you used during registration to check your status, upload receipt, or download ticket.</p>
            </div>
          </form>
          
          <div className="status-examples">
            <h3 className="examples-title">What you can check:</h3>
            <div className="examples-grid">
              <div className="example-item">
                <div className="example-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
                  </svg>
                </div>
                <div className="example-content">
                  <h4>Payment Status</h4>
                  <p>Check if payment is pending, verified, or rejected</p>
                </div>
              </div>
              
              <div className="example-item">
                <div className="example-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7M7.5,13.5L9,12L11,14L15.5,9.5L17,11L11,17L7.5,13.5Z" />
                  </svg>
                </div>
                <div className="example-content">
                  <h4>Upload Receipt</h4>
                  <p>Submit payment proof if you haven't already</p>
                </div>
              </div>
              
              <div className="example-item">
                <div className="example-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M15.58,16.8L12,14.5L8.42,16.8L9.5,12.68L6.21,10L10.46,9.54L12,5.68L13.54,9.54L17.79,10L14.5,12.68L15.58,16.8Z" />
                  </svg>
                </div>
                <div className="example-content">
                  <h4>Download Ticket</h4>
                  <p>Access your QR ticket once approved</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card-footer">
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

export default LoginScreen