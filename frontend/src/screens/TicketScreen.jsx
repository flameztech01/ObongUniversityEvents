import React, { useState, useEffect } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { useGetPaymentStatusQuery } from '../slices/userApiSlice.js'

const TicketScreen = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { userId } = useParams()
  const stateUserId = location.state?.userId
  
  const actualUserId = userId || stateUserId
  
  const { data: paymentStatus, isLoading, refetch } = useGetPaymentStatusQuery(actualUserId, {
    skip: !actualUserId
  })
  
  const [copiedTicket, setCopiedTicket] = useState(false)
  
  useEffect(() => {
    // Auto-refresh every 10 seconds if pending
    if (paymentStatus?.data?.status === 'pending_verification') {
      const interval = setInterval(() => {
        refetch()
      }, 10000)
      
      return () => clearInterval(interval)
    }
  }, [paymentStatus?.data?.status, refetch])
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const handleCopyTicket = () => {
    if (paymentStatus?.data?.ticketId) {
      navigator.clipboard.writeText(paymentStatus.data.ticketId)
        .then(() => {
          setCopiedTicket(true)
          setTimeout(() => setCopiedTicket(false), 2000)
        })
    }
  }
  
  const handleDownloadTicket = () => {
    // Implement ticket download logic
    console.log('Download ticket')
  }
  
  const handleShareTicket = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Event Ticket',
        text: `Check out my event ticket: ${paymentStatus?.data?.ticketId}`,
        url: window.location.href,
      })
    }
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
              <h1 className="card-title">Loading Ticket</h1>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!paymentStatus?.data) {
    return (
      <div className="app-container">
        <div className="app-wrapper">
          <div className="app-card">
            <div className="card-header">
              <div className="header-icon">
                <svg className="icon-ticket" viewBox="0 0 24 24">
                  <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
              </div>
              <h1 className="card-title">Ticket Not Found</h1>
              <p className="card-subtitle">
                Please register first to get your ticket
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
  
  const userData = paymentStatus.data
  const isApproved = userData.status === 'approved'
  const isPending = userData.status === 'pending_verification'
  const isRejected = userData.status === 'rejected'
  
  return (
    <div className="app-container">
      <div className="app-wrapper">
        <div className="decor-circle decor-1"></div>
        <div className="decor-circle decor-2"></div>
        <div className="decor-circle decor-3"></div>
        <div className="decor-square"></div>
        <div className="decor-line"></div>
        <div className="decor-line line-vertical"></div>
        
        <div className="app-card">
          <div className="card-header">
            <div className="header-icon">
              {isApproved ? (
                <svg className="icon-ticket" viewBox="0 0 24 24">
                  <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z" />
                </svg>
              ) : isPending ? (
                <svg className="icon-ticket" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
              ) : (
                <svg className="icon-ticket" viewBox="0 0 24 24">
                  <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
              )}
            </div>
            <h1 className="card-title">
              {isApproved ? 'Your E-Ticket' : 
               isPending ? 'Verification in Progress' :
               isRejected ? 'Payment Rejected' : 'Registration Status'}
            </h1>
            <p className="card-subtitle">
              {isApproved ? 'Ready for the event!' :
               isPending ? 'Your payment receipt is being reviewed' :
               isRejected ? 'Please check rejection details below' :
               'Complete your payment to get your ticket'}
            </p>
          </div>
          
          {copiedTicket && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              Ticket ID copied to clipboard!
            </div>
          )}
          
          <div className="success-content">
            {isApproved ? (
              <>
                <div className="verification-success">
                  <div className="success-badge">
                    <svg className="badge-icon" viewBox="0 0 24 24">
                      <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z" />
                    </svg>
                    <span>PAYMENT VERIFIED • TICKET ACTIVE</span>
                  </div>
                </div>
                
                <div className="ticket-card">
                  <div className="ticket-header">
                    <div className="ticket-label-group">
                      <span className="ticket-label">E-TICKET</span>
                      <span className="ticket-event">Annual Event 2024</span>
                    </div>
                    <div className="ticket-qr">
                      {userData.qrCodeImage ? (
                        <img src={userData.qrCodeImage} alt="QR Code" className="qr-code" />
                      ) : (
                        <div className="qr-placeholder">
                          <span>QR CODE</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ticket-body">
                    <div className="ticket-section">
                      <div className="section-label">TICKET ID</div>
                      <div className="ticket-id-display">
                        <span className="ticket-id-large">{userData.ticketId}</span>
                        <button
                          onClick={handleCopyTicket}
                          className="btn btn-text copy-btn"
                        >
                          <svg className="btn-icon" viewBox="0 0 24 24">
                            <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="ticket-grid">
                      <div className="ticket-item">
                        <div className="ticket-item-label">Attendee</div>
                        <div className="ticket-item-value">{userData.name}</div>
                      </div>
                      <div className="ticket-item">
                        <div className="ticket-item-label">Email</div>
                        <div className="ticket-item-value">{userData.email}</div>
                      </div>
                      <div className="ticket-item">
                        <div className="ticket-item-label">Phone</div>
                        <div className="ticket-item-value">{userData.phone}</div>
                      </div>
                      <div className="ticket-item">
                        <div className="ticket-item-label">Ticket Tier</div>
                        <div className="ticket-item-value tag">{userData.level?.toUpperCase()}</div>
                      </div>
                      <div className="ticket-item">
                        <div className="ticket-item-label">Amount Paid</div>
                        <div className="ticket-item-value amount">{formatCurrency(userData.amount)}</div>
                      </div>
                      <div className="ticket-item">
                        <div className="ticket-item-label">Approved On</div>
                        <div className="ticket-item-value">{formatDate(userData.approvedAt)}</div>
                      </div>
                    </div>
                    
                    <div className="ticket-footer">
                      <div className="ticket-venue">
                        <svg className="venue-icon" viewBox="0 0 24 24">
                          <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" />
                        </svg>
                        <div className="venue-details">
                          <div className="venue-name">Main Event Hall</div>
                          <div className="venue-address">123 Event Street, Lagos, Nigeria</div>
                        </div>
                      </div>
                      
                      <div className="ticket-date">
                        <svg className="date-icon" viewBox="0 0 24 24">
                          <path d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z" />
                        </svg>
                        <div className="date-details">
                          <div className="event-date">December 25, 2024</div>
                          <div className="event-time">6:00 PM - 11:00 PM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="action-group">
                  <button
                    onClick={handleDownloadTicket}
                    className="btn btn-primary btn-lg"
                  >
                    <span>Download Ticket</span>
                    <svg className="btn-icon" viewBox="0 0 24 24">
                      <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                    </svg>
                  </button>
                  
                  {navigator.share && (
                    <button
                      onClick={handleShareTicket}
                      className="btn btn-secondary"
                    >
                      <span>Share Ticket</span>
                      <svg className="btn-icon" viewBox="0 0 24 24">
                        <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="success-note">
                  <svg className="note-icon" viewBox="0 0 24 24">
                    <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M11,16.5V18H13V16.5H11M12,6.5C10.07,6.5 8.5,8.07 8.5,10H10C10,8.9 10.9,8 12,8C13.1,8 14,8.9 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10C16,8.07 14.93,6.5 12,6.5Z" />
                  </svg>
                  <p><strong>Important:</strong> Bring this ticket (digital or printed) to the event. QR code will be scanned at entry.</p>
                </div>
              </>
            ) : isPending ? (
              <>
                <div className="verification-section">
                  <div className="section-title">
                    <svg className="title-icon" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                    </svg>
                    Verification in Progress
                  </div>
                  
                  <div className="loading-indicator">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">
                      <h3>Reviewing your payment receipt</h3>
                      <p>Our team is verifying your payment. This usually takes 24-48 hours.</p>
                    </div>
                  </div>
                  
                  <div className="ticket-summary">
                    <div className="ticket-header">
                      <span className="ticket-label">REGISTRATION DETAILS</span>
                      <span className="ticket-id">#{userData._id?.slice(-8)}</span>
                    </div>
                    
                    <div className="ticket-details">
                      <div className="detail-row">
                        <span className="detail-label">Attendee</span>
                        <span className="detail-value">{userData.name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Payment Reference</span>
                        <span className="detail-value reference">{userData.paymentReference}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Amount Paid</span>
                        <span className="detail-value amount">{formatCurrency(userData.amount)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Receipt Uploaded</span>
                        <span className="detail-value">
                          {userData.receiptUrl ? '✓ Yes' : 'No'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Status</span>
                        <span className="detail-value status-pending-verification">
                          PENDING VERIFICATION
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="action-group">
                    <button
                      onClick={() => refetch()}
                      className="btn btn-primary btn-lg"
                    >
                      <span>Check Verification Status</span>
                      <svg className="btn-icon" viewBox="0 0 24 24">
                        <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => navigate('/upload-receipt', { state: { userId: actualUserId } })}
                      className="btn btn-secondary"
                    >
                      Edit Receipt
                    </button>
                  </div>
                </div>
              </>
            ) : isRejected ? (
              <>
                <div className="alert alert-error">
                  <span className="alert-icon">!</span>
                  Payment verification failed
                </div>
                
                <div className="ticket-summary">
                  <div className="ticket-header">
                    <span className="ticket-label">REJECTION DETAILS</span>
                    <span className="ticket-id">#{userData._id?.slice(-8)}</span>
                  </div>
                  
                  <div className="ticket-details">
                    <div className="detail-row">
                      <span className="detail-label">Reason</span>
                      <span className="detail-value error">{userData.rejectionReason || 'Payment verification failed'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Rejected On</span>
                      <span className="detail-value">{formatDate(userData.rejectedAt)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Amount</span>
                      <span className="detail-value">{formatCurrency(userData.amount)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Reference</span>
                      <span className="detail-value reference">{userData.paymentReference}</span>
                    </div>
                  </div>
                </div>
                
                <div className="payment-instructions">
                  <div className="instructions-title">
                    <svg className="note-icon" viewBox="0 0 24 24">
                      <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                    </svg>
                    Next Steps
                  </div>
                  <ol className="instructions-list">
                    <li>Check if you used the correct payment reference</li>
                    <li>Ensure the amount transferred matches exactly</li>
                    <li>Verify receipt shows correct account details</li>
                    <li>Contact support if you believe this is an error</li>
                    <li>You can re-upload a corrected receipt</li>
                  </ol>
                </div>
                
                <div className="action-group">
                  <button
                    onClick={() => navigate('/upload-receipt', { state: { userId: actualUserId } })}
                    className="btn btn-primary btn-lg"
                  >
                    <span>Upload Corrected Receipt</span>
                    <svg className="btn-icon" viewBox="0 0 24 24">
                      <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => navigate('/payment', { state: { userId: actualUserId } })}
                    className="btn btn-secondary"
                  >
                    View Payment Details
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="ticket-summary">
                  <div className="ticket-header">
                    <span className="ticket-label">REGISTRATION PENDING</span>
                    <span className="ticket-id">#{userData._id?.slice(-8)}</span>
                  </div>
                  
                  <div className="ticket-details">
                    <div className="detail-row">
                      <span className="detail-label">Status</span>
                      <span className="detail-value status-pending">PAYMENT PENDING</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Amount Due</span>
                      <span className="detail-value amount">{formatCurrency(userData.amount)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Payment Reference</span>
                      <span className="detail-value reference">{userData.paymentReference}</span>
                    </div>
                  </div>
                </div>
                
                <div className="action-group">
                  <button
                    onClick={() => navigate('/payment', { state: { userId: actualUserId } })}
                    className="btn btn-primary btn-lg"
                  >
                    <span>Make Payment Now</span>
                    <svg className="btn-icon" viewBox="0 0 24 24">
                      <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                    </svg>
                  </button>
                </div>
              </>
            )}
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
              <div className="progress-step completed">
                <span className="step-number">3</span>
                <span className="step-label">Upload Receipt</span>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step active">
                <span className="step-number">4</span>
                <span className="step-label">Get Ticket</span>
              </div>
            </div>
            
            <div className="form-note">
              <svg className="note-icon" viewBox="0 0 24 24">
                <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
              </svg>
              <p>Need assistance? Contact support at support@event.com or call 0800-123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketScreen