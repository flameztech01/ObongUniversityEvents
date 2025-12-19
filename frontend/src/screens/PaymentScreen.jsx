// PaymentScreen.js
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useInitializePaymentMutation } from '../slices/userApiSlice.js'


const PaymentScreen = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [verifiedEmail, setVerifiedEmail] = useState('')
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [accountDetails, setAccountDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  
  const [initializePayment] = useInitializePaymentMutation()
  
  const userData = location.state || JSON.parse(localStorage.getItem('userData')) || {}
  
  useEffect(() => {
    if (!userData.userId) navigate('/register')
    if (userData.email) setEmail(userData.email)
  }, [userData, navigate])
  
  const handleVerifyEmail = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    
    if (email !== userData.email) {
      setError('Email does not match registration')
      return
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setVerificationCode(code)
    setShowVerification(true)
    setVerifiedEmail(email)
    setError('')
    
    alert(`Verification code sent to ${email}. Code: ${code}`)
  }
  
  const handleVerifyCode = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }
    
    setIsEmailVerified(true)
    setShowVerification(false)
    setMessage('Email verified successfully!')
    setError('')
  }
  
  const handleGenerateAccountDetails = async () => {
    if (!isEmailVerified) {
      setError('Please verify your email first')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const paymentData = {
        userId: userData.userId,
        email: verifiedEmail || userData.email,
        amount: userData.amount
      }
      
      const paymentResponse = await initializePayment(paymentData).unwrap()
      
      if (paymentResponse.data) {
        const mockAccountDetails = {
          bankName: 'Payment Gateway Bank',
          accountNumber: `90${Math.floor(10000000 + Math.random() * 90000000)}`,
          accountName: 'EVENT REGISTRATION',
          amount: userData.amount,
          reference: paymentResponse.data.reference || `REF-${Date.now()}`,
          expiresIn: '24 hours',
          bankCode: '058'
        }
        
        setAccountDetails(mockAccountDetails)
        setMessage('Account details generated!')
      }
      
    } catch (error) {
      console.error('Payment error:', error)
      setError(error.data?.error || 'Failed to generate details')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleMakePayment = () => {
    window.open('https://paystack.com/pay', '_blank')
  }
  
  const handleCheckPayment = () => {
    navigate('/verify-payment', { 
      state: { 
        reference: accountDetails?.reference,
        userId: userData.userId
      } 
    })
  }
  
  return (
    <div className="app-container">
      <div className="app-wrapper">
        <div className="decor-circle decor-3"></div>
        <div className="decor-square"></div>
        <div className="decor-line line-vertical"></div>
        
        <div className="app-card">
          <div className="card-header">
            <div className="header-icon">
              <svg className="icon-payment" viewBox="0 0 24 24">
                <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
              </svg>
            </div>
            <h1 className="card-title">Complete Payment</h1>
            <p className="card-subtitle">
              Secure your ticket with a quick payment
            </p>
          </div>
          
          {message && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              {message}
            </div>
          )}
          
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">!</span>
              {error}
            </div>
          )}
          
          <div className="order-summary">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Name</span>
                <span className="summary-value">{userData.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Level</span>
                <span className="summary-value tag">{userData.level?.toUpperCase()}</span>
              </div>
              <div className="summary-item highlight">
                <span className="summary-label">Total Amount</span>
                <span className="summary-value amount">
                  ₦{parseInt(userData.amount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          {!isEmailVerified ? (
            <div className="verification-section">
              <h3 className="section-title">
                <svg className="title-icon" viewBox="0 0 24 24">
                  <path d="M22,6C22,4.89 21.1,4 20,4H4C2.89,4 2,4.89 2,6V18C2,19.1 2.9,20 4,20H20C21.1,20 22,19.1 22,18V6M20,6L12,11L4,6H20M20,18H4V8L12,13L20,8V18Z" />
                </svg>
                Verify Your Email
              </h3>
              
              {!showVerification ? (
                <div className="verification-form">
                  <div className="form-field">
                    <label className="field-label">
                      Enter your registered email address
                    </label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24">
                        <path d="M12,15C12.81,15 13.5,14.7 14.11,14.11C14.7,13.5 15,12.81 15,12C15,11.19 14.7,10.5 14.11,9.89C13.5,9.3 12.81,9 12,9C11.19,9 10.5,9.3 9.89,9.89C9.3,10.5 9,11.19 9,12C9,12.81 9.3,13.5 9.89,14.11C10.5,14.7 11.19,15 12,15M12,2C14.75,2 17.1,3 19.05,4.95C21,6.9 22,9.25 22,12V13.45C22,14.45 21.65,15.3 21,16C20.3,16.67 19.5,17 18.5,17C17.3,17 16.31,16.5 15.56,15.5C14.56,16.5 13.38,17 12,17C10.63,17 9.45,16.5 8.46,15.54C7.5,14.55 7,13.38 7,12C7,10.63 7.5,9.45 8.46,8.46C9.45,7.5 10.63,7 12,7C13.38,7 14.55,7.5 15.54,8.46C16.5,9.45 17,10.63 17,12V13.45C17,13.86 17.16,14.22 17.46,14.53C17.76,14.84 18.11,15 18.5,15C18.92,15 19.27,14.84 19.57,14.53C19.87,14.22 20,13.86 20,13.45V12C20,9.81 19.23,7.93 17.65,6.35C16.07,4.77 14.19,4 12,4C9.81,4 7.93,4.77 6.35,6.35C4.77,7.93 4,9.81 4,12C4,14.19 4.77,16.07 6.35,17.65C7.93,19.23 9.81,20 12,20H17V22H12C9.25,22 6.9,21 4.95,19.05C3,17.1 2,14.75 2,12C2,9.25 3,6.9 4.95,4.95C6.9,3 9.25,2 12,2Z" />
                      </svg>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="text-input"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleVerifyEmail}
                    className="btn btn-secondary"
                  >
                    Send Verification Code
                  </button>
                </div>
              ) : (
                <div className="code-verification">
                  <div className="form-field">
                    <label className="field-label">
                      Enter the 6-digit code sent to {verifiedEmail}
                    </label>
                    <div className="code-inputs">
                      {[...Array(6)].map((_, i) => (
                        <input
                          key={i}
                          type="text"
                          maxLength="1"
                          className="code-input"
                          onChange={(e) => {
                            const newCode = verificationCode.split('')
                            newCode[i] = e.target.value
                            setVerificationCode(newCode.join(''))
                            if (e.target.value && i < 5) {
                              e.target.nextSibling?.focus()
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleVerifyCode}
                    className="btn btn-primary"
                  >
                    Verify Code
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="verification-success">
              <div className="success-badge">
                <svg className="badge-icon" viewBox="0 0 24 24">
                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                </svg>
                Email Verified
              </div>
            </div>
          )}
          
          {isEmailVerified && (
            <div className="payment-section">
              <h3 className="section-title">
                <svg className="title-icon" viewBox="0 0 24 24">
                  <path d="M11.5,1L2,6V8H21V6M16,10V17H19V10M2,22H21V19H2M10,10V17H13V10M4,10V17H7V10H4Z" />
                </svg>
                Payment Details
              </h3>
              
              {!accountDetails ? (
                <button
                  onClick={handleGenerateAccountDetails}
                  className="btn btn-primary btn-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Generating Details...
                    </>
                  ) : (
                    'Generate Bank Details'
                  )}
                </button>
              ) : (
                <div className="account-details-card">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Bank Name</span>
                      <span className="detail-value">{accountDetails.bankName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Account Number</span>
                      <span className="detail-value highlight">
                        {accountDetails.accountNumber.match(/.{1,4}/g).join(' ')}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Account Name</span>
                      <span className="detail-value">{accountDetails.accountName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Amount</span>
                      <span className="detail-value amount">
                        ₦{parseInt(accountDetails.amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="detail-item full-width">
                      <span className="detail-label">Reference Code</span>
                      <span className="detail-value reference">
                        {accountDetails.reference}
                      </span>
                    </div>
                  </div>
                  
                  <div className="payment-actions">
                    <button
                      onClick={handleMakePayment}
                      className="btn btn-primary btn-lg"
                    >
                      <span>Make Payment Now</span>
                      <svg className="btn-icon" viewBox="0 0 24 24">
                        <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={handleCheckPayment}
                      className="btn btn-secondary"
                    >
                      Check Payment Status
                    </button>
                  </div>
                  
                  <div className="payment-instructions">
                    <h4 className="instructions-title">
                      <svg className="title-icon" viewBox="0 0 24 24">
                        <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                      </svg>
                      Important Instructions
                    </h4>
                    <ul className="instructions-list">
                      <li>Transfer the exact amount shown above</li>
                      <li>Use the reference code as payment description</li>
                      <li>Payment verification takes 5-10 minutes</li>
                      <li>Keep this reference code for tracking</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="card-footer">
            <div className="progress-indicator">
              <div className="progress-step completed">
                <span className="step-number">1</span>
                <span className="step-label">Register</span>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step active">
                <span className="step-number">2</span>
                <span className="step-label">Payment</span>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <span className="step-number">3</span>
                <span className="step-label">Ticket</span>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/register')}
              className="btn btn-text"
            >
              <svg className="btn-icon-left" viewBox="0 0 24 24">
                <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
              </svg>
              Back to Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentScreen