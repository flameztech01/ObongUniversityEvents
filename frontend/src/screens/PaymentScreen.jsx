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
  
  // Get user data from navigation state or localStorage
  const userData = location.state || JSON.parse(localStorage.getItem('userData')) || {}
  
  useEffect(() => {
    // If no user data, redirect to registration
    if (!userData.userId) {
      navigate('/register')
    }
    
    // Set initial email from user data
    if (userData.email) {
      setEmail(userData.email)
    }
  }, [userData, navigate])
  
  const handleVerifyEmail = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    
    // Check if email matches registered email
    if (email !== userData.email) {
      setError('Email does not match registration email')
      return
    }
    
    // Generate verification code (in real app, send via email)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setVerificationCode(code)
    setShowVerification(true)
    setVerifiedEmail(email)
    setError('')
    
    // Show verification code (in production, this would be sent via email)
    alert(`Verification code sent to ${email}. Code: ${code}`)
  }
  
  const handleVerifyCode = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code')
      return
    }
    
    // For demo purposes, we'll assume any 6-digit code is valid
    // In production, verify against sent code
    
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
      
      if (paymentResponse.data && paymentResponse.data.authorization_url) {
        // For Paystack, you would typically redirect to the authorization URL
        // But since you want to display account details, we'll simulate it
        
        // Generate mock account details (Paystack doesn't provide static account numbers)
        const mockAccountDetails = {
          bankName: 'Paystack Virtual Bank',
          accountNumber: `90${Math.floor(10000000 + Math.random() * 90000000)}`,
          accountName: 'EVENT TICKETING',
          amount: userData.amount,
          reference: paymentResponse.data.reference,
          expiresIn: '24 hours'
        }
        
        setAccountDetails(mockAccountDetails)
        setMessage('Account details generated successfully!')
      }
      
    } catch (error) {
      console.error('Payment initialization error:', error)
      setError(error.data?.error || error.data?.message || 'Failed to generate account details')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleMakePayment = () => {
    if (accountDetails) {
      // In real implementation, redirect to Paystack payment page
      // For now, we'll simulate opening a new payment window
      window.open('https://paystack.com/pay/virtual-account', '_blank')
    }
  }
  
  const handleCheckPayment = () => {
    // Navigate to payment verification page
    navigate('/verify-payment', { 
      state: { 
        reference: accountDetails?.reference,
        userId: userData.userId
      } 
    })
  }
  
  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h2 className="payment-title">Payment Details</h2>
          <p className="payment-subtitle">
            Complete your payment to get your event ticket
          </p>
        </div>
        
        {message && (
          <div className="success-message">
            {message}
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="payment-summary">
          <h3>Order Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Name:</span>
              <span className="summary-value">{userData.name || 'N/A'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Level:</span>
              <span className="summary-value">{userData.level} Level</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Amount:</span>
              <span className="summary-value highlight">₦{parseInt(userData.amount || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="verification-section">
          <h3>Email Verification</h3>
          
          {!isEmailVerified ? (
            <>
              <div className="form-group">
                <label className="form-label">
                  Enter your registered email to verify
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="Enter your email"
                  disabled={showVerification}
                />
              </div>
              
              {!showVerification ? (
                <button
                  onClick={handleVerifyEmail}
                  className="verify-btn"
                >
                  Verify Email
                </button>
              ) : (
                <div className="verification-code-section">
                  <label className="form-label">
                    Enter 6-digit verification code sent to {verifiedEmail}
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="form-input"
                    placeholder="Enter verification code"
                    maxLength="6"
                  />
                  <button
                    onClick={handleVerifyCode}
                    className="verify-code-btn"
                  >
                    Verify Code
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="verification-success">
              <span className="success-icon">✓</span>
              <span>Email verified: {verifiedEmail}</span>
            </div>
          )}
        </div>
        
        {isEmailVerified && (
          <div className="account-section">
            <h3>Bank Transfer Details</h3>
            
            {!accountDetails ? (
              <button
                onClick={handleGenerateAccountDetails}
                className="generate-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Account Details'}
              </button>
            ) : (
              <>
                <div className="account-details">
                  <div className="account-item">
                    <span className="account-label">Bank Name:</span>
                    <span className="account-value">{accountDetails.bankName}</span>
                  </div>
                  <div className="account-item">
                    <span className="account-label">Account Number:</span>
                    <span className="account-value highlight">{accountDetails.accountNumber}</span>
                  </div>
                  <div className="account-item">
                    <span className="account-label">Account Name:</span>
                    <span className="account-value">{accountDetails.accountName}</span>
                  </div>
                  <div className="account-item">
                    <span className="account-label">Amount to Pay:</span>
                    <span className="account-value highlight">₦{parseInt(accountDetails.amount).toLocaleString()}</span>
                  </div>
                  <div className="account-item">
                    <span className="account-label">Reference:</span>
                    <span className="account-value code">{accountDetails.reference}</span>
                  </div>
                  <div className="account-item">
                    <span className="account-label">Valid for:</span>
                    <span className="account-value">{accountDetails.expiresIn}</span>
                  </div>
                </div>
                
                <div className="payment-actions">
                  <button
                    onClick={handleMakePayment}
                    className="pay-btn"
                  >
                    Make Payment Now
                  </button>
                  
                  <button
                    onClick={handleCheckPayment}
                    className="check-btn"
                  >
                    Check Payment Status
                  </button>
                </div>
                
                <div className="payment-instructions">
                  <h4>Payment Instructions:</h4>
                  <ol>
                    <li>Transfer exactly ₦{parseInt(accountDetails.amount).toLocaleString()} to the account above</li>
                    <li>Use the reference code: <strong>{accountDetails.reference}</strong> as payment description</li>
                    <li>Payment will be verified automatically within 5-10 minutes</li>
                    <li>Click "Check Payment Status" after making payment</li>
                  </ol>
                </div>
              </>
            )}
          </div>
        )}
        
        <div className="payment-footer">
          <button
            onClick={() => navigate('/register')}
            className="back-btn"
          >
            Back to Registration
          </button>
          <p className="support-text">
            Need help? Contact support at support@example.com
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentScreen