import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { 
  useGetPaymentStatusQuery, 
  useUploadReceiptMutation 
} from '../slices/userApiSlice.js'

const StatusScreen = () => {
  const { userId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [receiptUrl, setReceiptUrl] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  
  // Get user data from location state or fetch from API
  const { data: userData, isLoading, error, refetch } = useGetPaymentStatusQuery(userId)
  const [uploadReceipt, { isLoading: isUploading }] = useUploadReceiptMutation()
  
  const user = location.state?.user || userData?.data
  const status = user?.status || 'unknown'
  
  useEffect(() => {
    if (userData) {
      console.log('User data fetched:', userData)
    }
  }, [userData])
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const handleReceiptChange = (e) => {
    const value = e.target.value
    setReceiptUrl(value)
    if (uploadError) setUploadError('')
  }
  
  const handleReceiptSubmit = async (e) => {
    e.preventDefault()
    
    if (!receiptUrl.trim()) {
      setUploadError('Please enter a receipt URL')
      return
    }
    
    // Basic URL validation
    try {
      new URL(receiptUrl)
    } catch {
      setUploadError('Please enter a valid URL')
      return
    }
    
    try {
      const response = await uploadReceipt({
        userId,
        receiptUrl: receiptUrl.trim()
      }).unwrap()
      
      setUploadSuccess('Receipt uploaded successfully! Awaiting admin verification.')
      setReceiptUrl('')
      setUploadError('')
      
      // Refresh user data
      setTimeout(() => {
        refetch()
      }, 1000)
      
    } catch (error) {
      console.error('Upload error:', error)
      if (error.data?.error) {
        setUploadError(error.data.error)
      } else if (error.data?.message) {
        setUploadError(error.data.message)
      } else {
        setUploadError('Failed to upload receipt. Please try again.')
      }
    }
  }
  
  const handleGoToLogin = () => {
    navigate('/login')
  }
  
  const handleGoToRegister = () => {
    navigate('/')
  }
  
  const getStatusIcon = () => {
    switch (status) {
      case 'pending_payment':
        return '⏳'
      case 'pending_verification':
        return '📤'
      case 'approved':
        return '✅'
      case 'rejected':
        return '❌'
      default:
        return '❓'
    }
  }
  
  const getStatusColor = () => {
    switch (status) {
      case 'pending_payment':
        return '#ffc107'
      case 'pending_verification':
        return '#17a2b8'
      case 'approved':
        return '#28a745'
      case 'rejected':
        return '#dc3545'
      default:
        return '#6c757d'
    }
  }
  
  const getStatusMessage = () => {
    switch (status) {
      case 'pending_payment':
        return 'Payment Required'
      case 'pending_verification':
        return 'Awaiting Payment Verification'
      case 'approved':
        return 'Payment Verified - Ticket Approved'
      case 'rejected':
        return 'Payment Rejected'
      default:
        return 'Unknown Status'
    }
  }
  
  const getActionButton = () => {
    if (!user) return null
    
    switch (status) {
      case 'pending_payment':
        return (
          <button
            onClick={() => navigate('/payment', { state: { userId, userData: user } })}
            className="btn btn-primary btn-lg"
          >
            <span>Make Payment</span>
            <svg className="btn-icon" viewBox="0 0 24 24">
              <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
            </svg>
          </button>
        )
      
      case 'approved':
        return (
          <button
            onClick={() => navigate(`/ticket/${userId}`, { state: { user } })}
            className="btn btn-success btn-lg"
          >
            <span>View My Ticket</span>
            <svg className="btn-icon" viewBox="0 0 24 24">
              <path d="M15.58,16.8L12,14.5L8.42,16.8L9.5,12.68L6.21,10L10.46,9.54L12,5.68L13.54,9.54L17.79,10L14.5,12.68L15.58,16.8Z" />
            </svg>
          </button>
        )
      
      default:
        return null
    }
  }
  
  if (isLoading) {
    return (
      <div className="app-container">
        <div className="app-wrapper">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your status...</p>
          </div>
        </div>
      </div>
    )
  }
  
  if (error || !user) {
    return (
      <div className="app-container">
        <div className="app-wrapper">
          <div className="app-card">
            <div className="card-header">
              <div className="header-icon error">
                <svg viewBox="0 0 24 24">
                  <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
              </div>
              <h1 className="card-title">User Not Found</h1>
              <p className="card-subtitle">
                Unable to find registration information
              </p>
            </div>
            
            <div className="error-content">
              <p>This could be because:</p>
              <ul className="error-list">
                <li>The user ID is incorrect</li>
                <li>The registration has expired</li>
                <li>You need to register first</li>
              </ul>
              
              <div className="action-group">
                <button onClick={handleGoToLogin} className="btn btn-primary">
                  Try Login Instead
                </button>
                <button onClick={handleGoToRegister} className="btn btn-secondary">
                  Register New Account
                </button>
              </div>
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
            <h1 className="card-title">Registration Status</h1>
            <p className="card-subtitle">
              Track your registration progress and payment status
            </p>
          </div>
          
          {/* Status Banner */}
          <div 
            className="status-banner"
            style={{ backgroundColor: getStatusColor() + '20', borderColor: getStatusColor() }}
          >
            <div className="status-icon">
              <span style={{ fontSize: '24px' }}>{getStatusIcon()}</span>
            </div>
            <div className="status-content">
              <h3 className="status-title">{getStatusMessage()}</h3>
              <p className="status-description">
                {status === 'pending_payment' && 'Complete payment to proceed with registration'}
                {status === 'pending_verification' && 'Your payment receipt is being reviewed by admin'}
                {status === 'approved' && 'Your registration is complete! Download your ticket below'}
                {status === 'rejected' && 'Your payment was rejected. Please contact support'}
              </p>
            </div>
          </div>
          
          {/* User Information */}
          <div className="user-info-section">
            <h3 className="section-title">
              <svg className="section-icon" viewBox="0 0 24 24">
                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
              Attendee Information
            </h3>
            
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{user.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{user.phone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ticket Tier</span>
                <span className="info-value tag">{user.level?.toUpperCase()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Amount</span>
                <span className="info-value amount">{formatCurrency(user.amount)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Reference</span>
                <span className="info-value reference">{user.paymentReference}</span>
              </div>
            </div>
          </div>
          
          {/* Payment Details */}
          {status === 'pending_payment' && user.paymentDetails && (
            <div className="payment-details-section">
              <h3 className="section-title">
                <svg className="section-icon" viewBox="0 0 24 24">
                  <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                </svg>
                Payment Instructions
              </h3>
              
              <div className="payment-instructions">
                <p>Please make payment to the following OPay account:</p>
                
                <div className="payment-card">
                  <div className="payment-row">
                    <span className="payment-label">Account Number:</span>
                    <span className="payment-value highlight">{user.paymentDetails.accountNumber}</span>
                  </div>
                  <div className="payment-row">
                    <span className="payment-label">Account Name:</span>
                    <span className="payment-value">{user.paymentDetails.accountName}</span>
                  </div>
                  <div className="payment-row">
                    <span className="payment-label">Bank Name:</span>
                    <span className="payment-value">{user.paymentDetails.bankName}</span>
                  </div>
                  <div className="payment-row">
                    <span className="payment-label">Amount:</span>
                    <span className="payment-value amount">{formatCurrency(user.paymentDetails.amount)}</span>
                  </div>
                  <div className="payment-row">
                    <span className="payment-label">Reference:</span>
                    <span className="payment-value reference">{user.paymentDetails.reference}</span>
                  </div>
                </div>
                
                <div className="payment-note">
                  <svg className="note-icon" viewBox="0 0 24 24">
                    <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  <p><strong>Important:</strong> Use the exact reference number above when making payment</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Receipt Upload */}
          {(status === 'pending_payment' || status === 'pending_verification') && (
            <div className="upload-section">
              <h3 className="section-title">
                <svg className="section-icon" viewBox="0 0 24 24">
                  <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
                </svg>
                Upload Payment Receipt
              </h3>
              
              {uploadSuccess && (
                <div className="alert alert-success">
                  <span className="alert-icon">✓</span>
                  {uploadSuccess}
                </div>
              )}
              
              {uploadError && (
                <div className="alert alert-error">
                  <span className="alert-icon">!</span>
                  {uploadError}
                </div>
              )}
              
              {user.receiptUrl ? (
                <div className="receipt-uploaded">
                  <div className="receipt-info">
                    <svg className="receipt-icon" viewBox="0 0 24 24">
                      <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z" />
                    </svg>
                    <div>
                      <p><strong>Receipt Already Uploaded</strong></p>
                      <p className="small">Uploaded on: {formatDate(user.paymentDate)}</p>
                      <a 
                        href={user.receiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="receipt-link"
                      >
                        View Receipt
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReceiptSubmit} className="upload-form">
                  <div className="form-field">
                    <label htmlFor="receiptUrl" className="field-label">
                      Receipt URL
                    </label>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19L12,15H9V10H15V15L13,19H10Z" />
                      </svg>
                      <input
                        type="url"
                        id="receiptUrl"
                        value={receiptUrl}
                        onChange={handleReceiptChange}
                        className="text-input"
                        placeholder="https://example.com/receipt.jpg"
                        disabled={isUploading || status !== 'pending_payment'}
                      />
                    </div>
                    <p className="field-help">
                      Paste the URL of your payment receipt screenshot or photo
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isUploading || !receiptUrl.trim() || status !== 'pending_payment'}
                  >
                    {isUploading ? (
                      <>
                        <span className="spinner"></span>
                        Uploading...
                      </>
                    ) : (
                      'Upload Receipt'
                    )}
                  </button>
                  
                  {status !== 'pending_payment' && (
                    <div className="form-note">
                      <svg className="note-icon" viewBox="0 0 24 24">
                        <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M13,17H11V15H13V17M13,13H11V7H13V13Z" />
                      </svg>
                      <p>Receipt upload is only available when payment status is "pending_payment"</p>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
          
          {/* Timeline */}
          <div className="timeline-section">
            <h3 className="section-title">Registration Timeline</h3>
            
            <div className="timeline">
              <div className={`timeline-step ${status === 'pending_payment' ? 'active' : (['pending_verification', 'approved', 'rejected'].includes(status) ? 'completed' : '')}`}>
                <div className="step-marker">1</div>
                <div className="step-content">
                  <h4>Registration</h4>
                  <p>Completed registration process</p>
                </div>
              </div>
              
              <div className={`timeline-step ${status === 'pending_payment' ? 'current' : (status === 'pending_verification' ? 'active' : (['approved', 'rejected'].includes(status) ? 'completed' : ''))}`}>
                <div className="step-marker">2</div>
                <div className="step-content">
                  <h4>Payment</h4>
                  <p>
                    {status === 'pending_payment' && 'Make payment to complete registration'}
                    {status === 'pending_verification' && 'Payment made, receipt uploaded'}
                    {['approved', 'rejected'].includes(status) && 'Payment completed'}
                  </p>
                </div>
              </div>
              
              <div className={`timeline-step ${status === 'pending_verification' ? 'current' : (['approved', 'rejected'].includes(status) ? 'completed' : '')}`}>
                <div className="step-marker">3</div>
                <div className="step-content">
                  <h4>Verification</h4>
                  <p>
                    {status === 'pending_verification' && 'Admin reviewing your payment'}
                    {status === 'approved' && 'Payment verified successfully'}
                    {status === 'rejected' && 'Payment rejected - contact support'}
                  </p>
                </div>
              </div>
              
              <div className={`timeline-step ${['approved', 'rejected'].includes(status) ? 'completed' : ''}`}>
                <div className="step-marker">4</div>
                <div className="step-content">
                  <h4>Ticket</h4>
                  <p>
                    {status === 'approved' && 'Ticket generated and ready'}
                    {status === 'rejected' && 'Ticket not issued'}
                    {!['approved', 'rejected'].includes(status) && 'Awaiting verification'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="action-section">
            {getActionButton()}
            
            <div className="secondary-actions">
              <button onClick={() => navigate('/login')} className="btn btn-secondary">
                Back to Login
              </button>
              <button onClick={() => navigate('/register')} className="btn btn-outline">
                Register New
              </button>
            </div>
          </div>
          
          <div className="card-footer">
            <div className="form-note">
              <svg className="note-icon" viewBox="0 0 24 24">
                <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
              </svg>
              <p>For any issues, contact support at support@event.com or call 0800-123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusScreen