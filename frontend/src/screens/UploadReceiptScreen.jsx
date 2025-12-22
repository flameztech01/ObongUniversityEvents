import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUploadReceiptMutation, useGetPaymentStatusQuery } from '../slices/userApiSlice.js'

const UploadReceiptScreen = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { userId, paymentReference, amount, name } = location.state || {}
  
  const [uploadReceipt, { isLoading: isUploading }] = useUploadReceiptMutation()
  const { data: paymentStatus, refetch, isLoading: isLoadingStatus } = useGetPaymentStatusQuery(userId, {
    skip: !userId,
    pollingInterval: 5000, // Poll every 5 seconds to check status
  })
  
  const [receiptUrl, setReceiptUrl] = useState('')
  const [uploadMethod, setUploadMethod] = useState('link')
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [previewImage, setPreviewImage] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  // Check if payment is already approved and redirect
  useEffect(() => {
    if (paymentStatus?.data?.status === 'approved') {
      // Redirect to ticket screen
      setTimeout(() => {
        navigate(`/ticket/${userId}`, { 
          state: { user: paymentStatus.data }
        })
      }, 1000)
    }
    
    if (paymentStatus?.data?.receiptUrl) {
      setReceiptUrl(paymentStatus.data.receiptUrl)
      setIsSubmitted(true)
    }
  }, [paymentStatus, navigate, userId])
  
  // Auto-redirect after successful upload
  useEffect(() => {
    if (isSubmitted && paymentStatus?.data?.status === 'pending_verification') {
      // Start polling for status updates
      const checkStatusInterval = setInterval(() => {
        refetch()
      }, 5000)
      
      return () => clearInterval(checkStatusInterval)
    }
  }, [isSubmitted, paymentStatus, refetch])
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!receiptUrl.trim()) {
      newErrors.receiptUrl = 'Receipt URL or image is required'
    }
    
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
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
        // In a real app, you would upload to cloud storage and get URL
        // For demo, we'll use a fake URL
        setReceiptUrl(`data:${file.type};base64,${reader.result.split(',')[1]}`)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      const result = await uploadReceipt({
        userId,
        receiptUrl
      }).unwrap()
      
      setSuccessMessage('Receipt uploaded successfully! Awaiting admin verification.')
      setErrors({})
      setIsSubmitted(true)
      
      // Start polling for status updates
      const checkStatus = async () => {
        try {
          await refetch()
        } catch (error) {
          console.error('Error checking status:', error)
        }
      }
      
      // Check status every 5 seconds
      const statusInterval = setInterval(checkStatus, 5000)
      
      // Clear interval after 30 minutes
      setTimeout(() => {
        clearInterval(statusInterval)
      }, 30 * 60 * 1000)
      
      return () => clearInterval(statusInterval)
      
    } catch (error) {
      console.error('Upload error:', error)
      
      if (error.data?.error) {
        setErrors({ submit: error.data.error })
      } else if (error.data?.message) {
        setErrors({ submit: error.data.message })
      } else {
        setErrors({ submit: 'Upload failed. Please try again.' })
      }
    }
  }
  
  const handleViewStatus = () => {
    if (userId) {
      navigate(`/status/${userId}`)
    }
  }
  
  const handleCheckNow = () => {
    refetch()
  }
  
  // Show loading screen while checking status
  if (isLoadingStatus && isSubmitted) {
    return (
      <div className="app-container">
        <div className="app-wrapper">
          <div className="app-card">
            <div className="card-header">
              <div className="header-icon">
                <svg className="icon-payment" viewBox="0 0 24 24">
                  <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2Z" />
                </svg>
              </div>
              <h1 className="card-title">Checking Verification Status</h1>
              <p className="card-subtitle">
                Please wait while we check your payment verification...
              </p>
            </div>
            
            <div className="loading-content">
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
              <p className="loading-message">
                Your receipt has been submitted. We're checking if it's been verified yet.
              </p>
              <button
                onClick={handleCheckNow}
                className="btn btn-secondary"
              >
                Check Now
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Show status checking screen if receipt is already submitted
  if (isSubmitted && paymentStatus?.data?.status === 'pending_verification') {
    return (
      <div className="app-container">
        <div className="app-wrapper">
          <div className="decor-circle decor-1"></div>
          <div className="decor-circle decor-2"></div>
          
          <div className="app-card">
            <div className="card-header">
              <div className="header-icon">
                <svg className="icon-payment" viewBox="0 0 24 24">
                  <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2Z" />
                </svg>
              </div>
              <h1 className="card-title">Awaiting Verification</h1>
              <p className="card-subtitle">
                Your receipt is being reviewed by our team
              </p>
            </div>
            
            <div className="verification-status">
              <div className="status-animation">
                <div className="pulse-circle"></div>
                <div className="status-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2Z" />
                  </svg>
                </div>
              </div>
              
              <div className="status-content">
                <h3 className="status-title">Verification in Progress</h3>
                <p className="status-description">
                  Our team is reviewing your payment receipt. This usually takes 24-48 hours.
                  You'll be automatically redirected to your ticket once approved.
                </p>
                
                <div className="verification-details">
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value status-pending">Under Review</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Submitted:</span>
                    <span className="detail-value">
                      {paymentStatus?.data?.paymentDate ? 
                        new Date(paymentStatus.data.paymentDate).toLocaleDateString() : 
                        'Just now'}
                    </span>
                  </div>
                </div>
                
                <div className="action-buttons">
                  <button
                    onClick={handleCheckNow}
                    className="btn btn-primary"
                  >
                    <svg className="btn-icon" viewBox="0 0 24 24">
                      <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                    </svg>
                    Check Status Now
                  </button>
                  
                  <button
                    onClick={handleViewStatus}
                    className="btn btn-secondary"
                  >
                    View Full Status
                  </button>
                </div>
              </div>
            </div>
            
            <div className="auto-redirect-notice">
              <svg className="notice-icon" viewBox="0 0 24 24">
                <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M13,17H11V15H13V17M13,13H11V7H13V13Z" />
              </svg>
              <p>
                <strong>Note:</strong> This page will automatically redirect to your ticket 
                once verification is complete. No need to refresh!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Show rejected status
  if (paymentStatus?.data?.status === 'rejected') {
    return (
      <div className="app-container">
        <div className="app-wrapper">
          <div className="app-card">
            <div className="card-header">
              <div className="header-icon error">
                <svg viewBox="0 0 24 24">
                  <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
                </svg>
              </div>
              <h1 className="card-title">Payment Rejected</h1>
              <p className="card-subtitle">
                Your payment receipt was not approved
              </p>
            </div>
            
            <div className="rejection-content">
              <div className="rejection-reason">
                <h3>Reason for Rejection:</h3>
                <p>{paymentStatus.data.rejectionReason || 'Payment details could not be verified'}</p>
              </div>
              
              <div className="action-buttons">
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setReceiptUrl('')
                    setSuccessMessage('')
                  }}
                  className="btn btn-primary"
                >
                  Upload New Receipt
                </button>
                
                <button
                  onClick={handleViewStatus}
                  className="btn btn-secondary"
                >
                  View Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Original form if not submitted or still pending payment
  if (!userId) {
    return (
      <div className="app-container">
        <div className="app-wrapper">
          <div className="app-card">
            <div className="card-header">
              <div className="header-icon">
                <svg className="icon-payment" viewBox="0 0 24 24">
                  <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
              </div>
              <h1 className="card-title">Invalid Access</h1>
              <p className="card-subtitle">
                Please register first to upload receipt
              </p>
              <button
                onClick={() => navigate('/')}
                className="btn btn-primary"
              >
                Go to Registration
              </button>
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
        
        <div className="app-card">
          <div className="card-header">
            <div className="header-icon">
              <svg className="icon-payment" viewBox="0 0 24 24">
                <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
              </svg>
            </div>
            <h1 className="card-title">Upload Receipt</h1>
            <p className="card-subtitle">
              Upload your payment receipt for verification
            </p>
          </div>
          
          {errors.submit && (
            <div className="alert alert-error">
              <span className="alert-icon">!</span>
              {errors.submit}
            </div>
          )}
          
          {successMessage && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              {successMessage}
            </div>
          )}
          
          <div className="success-content">
            <div className="ticket-summary">
              <div className="ticket-header">
                <span className="ticket-label">PAYMENT DETAILS</span>
                <span className="ticket-id">#{userId?.slice(-8)}</span>
              </div>
              
              <div className="ticket-details">
                <div className="detail-row">
                  <span className="detail-label">Attendee</span>
                  <span className="detail-value">{name || paymentStatus?.data?.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Reference</span>
                  <span className="detail-value reference">
                    {paymentReference || paymentStatus?.data?.paymentReference}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount Paid</span>
                  <span className="detail-value highlight amount">
                    {formatCurrency(amount || paymentStatus?.data?.amount || 0)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Current Status</span>
                  <span className={`detail-value status-${paymentStatus?.data?.status?.replace('_', '-')}`}>
                    {paymentStatus?.data?.status?.replace('_', ' ').toUpperCase() || 'PENDING PAYMENT'}
                  </span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="app-form">
              <div className="form-field">
                <div className="field-header">
                  <label className="field-label">
                    Upload Method
                  </label>
                </div>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="uploadMethod"
                      value="link"
                      checked={uploadMethod === 'link'}
                      onChange={(e) => setUploadMethod(e.target.value)}
                      disabled={isUploading}
                    />
                    <span>Paste Image URL</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="uploadMethod"
                      value="file"
                      checked={uploadMethod === 'file'}
                      onChange={(e) => setUploadMethod(e.target.value)}
                      disabled={isUploading}
                    />
                    <span>Upload File</span>
                  </label>
                </div>
              </div>
              
              {uploadMethod === 'link' ? (
                <div className="form-field">
                  <div className="field-header">
                    <label htmlFor="receiptUrl" className="field-label">
                      Receipt Image URL
                    </label>
                    {errors.receiptUrl && (
                      <span className="field-error">{errors.receiptUrl}</span>
                    )}
                  </div>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24">
                      <path d="M14,13V17H10V13H7L12,8L17,13H14M14,2H10V4H14M2,15H4V19H14V21H2M20,9H14V11H20V20H14V22H20A2,2 0 0,0 22,20V11A2,2 0 0,0 20,9Z" />
                    </svg>
                    <input
                      type="url"
                      id="receiptUrl"
                      name="receiptUrl"
                      value={receiptUrl}
                      onChange={(e) => setReceiptUrl(e.target.value)}
                      className={`text-input ${errors.receiptUrl ? 'input-error' : ''}`}
                      placeholder="https://example.com/receipt.jpg"
                      disabled={isUploading}
                    />
                  </div>
                  <div className="form-note">
                    <svg className="note-icon" viewBox="0 0 24 24">
                      <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                    </svg>
                    <p>Upload to Google Drive, Dropbox, or any image hosting service and paste the link here</p>
                  </div>
                </div>
              ) : (
                <div className="form-field">
                  <div className="field-header">
                    <label htmlFor="fileUpload" className="field-label">
                      Upload Receipt Image
                    </label>
                    {errors.receiptUrl && (
                      <span className="field-error">{errors.receiptUrl}</span>
                    )}
                  </div>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="fileUpload"
                      accept="image/*,.pdf"
                      onChange={handleImageUpload}
                      className="file-input"
                      disabled={isUploading}
                    />
                    <label htmlFor="fileUpload" className="file-upload-label">
                      <svg className="upload-icon" viewBox="0 0 24 24">
                        <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
                      </svg>
                      <span>Click to upload receipt image</span>
                      <span className="file-types">PNG, JPG, PDF up to 5MB</span>
                    </label>
                    
                    {previewImage && (
                      <div className="image-preview">
                        <img src={previewImage} alt="Receipt preview" />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage(null)
                            setReceiptUrl('')
                          }}
                          className="btn btn-text remove-btn"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="verification-section">
                <div className="section-title">
                  <svg className="title-icon" viewBox="0 0 24 24">
                    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M17.13,17C15.92,18.85 14.11,20.24 12,20.92C9.89,20.24 8.08,18.85 6.87,17C6.53,16.5 6.24,16 6,15.47C6,13.82 8.71,12.47 12,12.47C15.29,12.47 18,13.79 18,15.47C17.76,16 17.47,16.5 17.13,17Z" />
                  </svg>
                  Receipt Requirements
                </div>
                <div className="payment-instructions">
                  <ul className="instructions-list">
                    <li>Receipt must clearly show:
                      <ul className="sublist">
                        <li>Amount transferred ({formatCurrency(amount || paymentStatus?.data?.amount || 0)})</li>
                        <li>Transaction date and time</li>
                        <li>Recipient account details</li>
                        <li>Transaction ID or reference</li>
                      </ul>
                    </li>
                    <li>Image must be clear and readable</li>
                    <li>Whole receipt should be visible in the image</li>
                    <li>Maximum file size: 5MB</li>
                  </ul>
                </div>
              </div>
              
              <div className="auto-redirect-notice">
                <svg className="notice-icon" viewBox="0 0 24 24">
                  <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2Z" />
                </svg>
                <p>
                  <strong>Automatic Ticket:</strong> Once your receipt is verified, 
                  you'll be automatically redirected to your ticket page!
                </p>
              </div>
              
              <div className="action-group">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={isUploading || paymentStatus?.data?.status === 'pending_verification'}
                >
                  {isUploading ? (
                    <>
                      <span className="spinner"></span>
                      Uploading...
                    </>
                  ) : paymentStatus?.data?.status === 'pending_verification' ? (
                    <>
                      <span>Receipt Submitted</span>
                      <svg className="btn-icon" viewBox="0 0 24 24">
                        <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Submit Receipt for Verification</span>
                      <svg className="btn-icon" viewBox="0 0 24 24">
                        <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
                      </svg>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleViewStatus}
                  className="btn btn-secondary"
                >
                  View Payment Status
                </button>
              </div>
            </form>
            
            <div className="success-note">
              <svg className="note-icon" viewBox="0 0 24 24">
                <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M11,16.5V18H13V16.5H11M12,6.5C10.07,6.5 8.5,8.07 8.5,10H10C10,8.9 10.9,8 12,8C13.1,8 14,8.9 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10C16,8.07 14.93,6.5 12,6.5Z" />
              </svg>
              <p><strong>Verification Process:</strong> After upload, our team will verify your payment. You'll be automatically redirected to your ticket once approved.</p>
            </div>
          </div>
          
          <div className="card-footer">
            <div className="progress-indicator">
              <div className="progress-step completed">
                <span className="step-number">1</span>
                <span className="step-label">Register</span>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step completed">
                <span className="step-number">2</span>
                <span className="step-label">Pay via OPay</span>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step active">
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

export default UploadReceiptScreen