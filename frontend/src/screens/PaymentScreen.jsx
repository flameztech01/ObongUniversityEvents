import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGetPaymentStatusQuery } from '../slices/userApiSlice.js'

const PaymentScreen = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { userId, userData } = location.state || {}
  
  const { data: paymentStatus, isLoading, refetch } = useGetPaymentStatusQuery(userId, {
    skip: !userId
  })
  
  const [copiedField, setCopiedField] = useState('')
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  
  useEffect(() => {
    // Refresh payment status every 30 seconds
    const interval = setInterval(() => {
      if (userId) refetch()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [userId, refetch])
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }
  
  const handleCopyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedField(field)
        setShowCopySuccess(true)
        setTimeout(() => {
          setShowCopySuccess(false)
          setCopiedField('')
        }, 2000)
      })
      .catch(err => {
        console.error('Failed to copy:', err)
      })
  }
  
  const handleUploadReceipt = () => {
    if (userId) {
      navigate('/upload-receipt', {
        state: {
          userId,
          paymentReference: paymentStatus?.data?.paymentReference,
          amount: paymentStatus?.data?.amount,
          name: paymentStatus?.data?.name
        }
      })
    }
  }
  
  const handleCheckStatus = () => {
    refetch()
  }
  
const paymentDetails = paymentStatus?.data?.paymentDetails || {
  accountNumber: import.meta.env.VITE_OPAY_ACCOUNT_NUMBER || '1234567890',
  accountName: import.meta.env.VITE_OPAY_ACCOUNT_NAME || 'EVENT ORGANIZER',
  bankName: import.meta.env.VITE_OPAY_BANK_NAME || 'OPay'
}
  
  if (isLoading) {
    return (
      <div className="app-container">
        <div className="app-wrapper">
          <div className="app-card">
            <div className="card-header">
              <div className="header-icon">
                <span className="spinner"></span>
              </div>
              <h1 className="card-title">Loading Payment Details</h1>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="app-container">
      <div className="app-wrapper">
        <div className="decor-circle decor-1"></div>
        <div className="decor-circle decor-3"></div>
        <div className="decor-square"></div>
        <div className="decor-line"></div>
        
        <div className="app-card">
          <div className="card-header">
            <div className="header-icon">
              <svg className="icon-payment" viewBox="0 0 24 24">
                <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
              </svg>
            </div>
            <h1 className="card-title">Payment Details</h1>
            <p className="card-subtitle">
              Transfer the exact amount to complete your registration
            </p>
          </div>
          
          {showCopySuccess && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              Copied {copiedField} to clipboard!
            </div>
          )}
          
          <div className="success-content">
            <div className="order-summary">
              <div className="summary-title">
                <svg className="title-icon" viewBox="0 0 24 24">
                  <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                </svg>
                OPay Transfer Details
              </div>
              
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Account Number</span>
                  <div className="detail-value-wrapper">
                    <span className="detail-value highlight">
                      {paymentDetails.accountNumber}
                    </span>
                    <button
                      onClick={() => handleCopyToClipboard(paymentDetails.accountNumber, 'account number')}
                      className="btn btn-text"
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24">
                        <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Account Name</span>
                  <div className="detail-value-wrapper">
                    <span className="detail-value highlight">
                      {paymentDetails.accountName}
                    </span>
                    <button
                      onClick={() => handleCopyToClipboard(paymentDetails.accountName, 'account name')}
                      className="btn btn-text"
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24">
                        <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Bank Name</span>
                  <span className="detail-value highlight">
                    {paymentDetails.bankName}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Amount to Pay</span>
                  <span className="detail-value highlight amount">
                    {formatCurrency(paymentStatus?.data?.amount || 0)}
                  </span>
                </div>
                
                <div className="detail-item full-width">
                  <span className="detail-label">Payment Reference</span>
                  <div className="detail-value-wrapper">
                    <span className="detail-value reference">
                      {paymentStatus?.data?.paymentReference || 'N/A'}
                    </span>
                    <button
                      onClick={() => handleCopyToClipboard(paymentStatus?.data?.paymentReference, 'payment reference')}
                      className="btn btn-text"
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24">
                        <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="payment-instructions">
                <div className="instructions-title">
                  <svg className="note-icon" viewBox="0 0 24 24">
                    <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  Payment Instructions
                </div>
                <ol className="instructions-list">
                  <li>Open your OPay app or any banking app</li>
                  <li>Add a new beneficiary with the account details above</li>
                  <li>Transfer the exact amount: <strong>{formatCurrency(paymentStatus?.data?.amount || 0)}</strong></li>
                  <li>Use the payment reference provided above</li>
                  <li>Take a screenshot of the successful transaction</li>
                  <li>Upload the receipt using the button below</li>
                </ol>
              </div>
            </div>
            
            <div className="ticket-summary">
              <div className="ticket-header">
                <span className="ticket-label">REGISTRATION STATUS</span>
                <span className="ticket-id">#{paymentStatus?.data?._id?.slice(-8) || 'PENDING'}</span>
              </div>
              
              <div className="ticket-details">
                <div className="detail-row">
                  <span className="detail-label">Attendee</span>
                  <span className="detail-value">{paymentStatus?.data?.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{paymentStatus?.data?.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tier</span>
                  <span className="detail-value tag">
                    {paymentStatus?.data?.level?.toUpperCase() || 'BASIC'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className={`detail-value status-${paymentStatus?.data?.status?.replace('_', '-')}`}>
                    {paymentStatus?.data?.status?.replace('_', ' ').toUpperCase() || 'PENDING PAYMENT'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Updated</span>
                  <span className="detail-value">
                    {paymentStatus?.data?.updatedAt ? new Date(paymentStatus.data.updatedAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="payment-actions">
              <button
                onClick={handleUploadReceipt}
                className="btn btn-primary btn-lg"
                disabled={paymentStatus?.data?.status === 'approved'}
              >
                {paymentStatus?.data?.status === 'pending_verification' ? (
                  <>
                    <span>Receipt Already Uploaded</span>
                    <svg className="btn-icon" viewBox="0 0 24 24">
                      <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Upload Payment Receipt</span>
                    <svg className="btn-icon" viewBox="0 0 24 24">
                      <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
                    </svg>
                  </>
                )}
              </button>
              
              <button
                onClick={handleCheckStatus}
                className="btn btn-secondary"
              >
                <span>Refresh Status</span>
                <svg className="btn-icon" viewBox="0 0 24 24">
                  <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                </svg>
              </button>
            </div>
            
            <div className="success-note">
              <svg className="note-icon" viewBox="0 0 24 24">
                <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M11,16.5V18H13V16.5H11M12,6.5C10.07,6.5 8.5,8.07 8.5,10H10C10,8.9 10.9,8 12,8C13.1,8 14,8.9 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10C16,8.07 14.93,6.5 12,6.5Z" />
              </svg>
              <p><strong>Important:</strong> Use the exact payment reference when transferring. It helps us verify your payment quickly.</p>
            </div>
          </div>
          
          <div className="card-footer">
            <div className="progress-indicator">
              <div className="progress-step completed">
                <span className="step-number">1</span>
                <span className="step-label">Register</span>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step active">
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentScreen