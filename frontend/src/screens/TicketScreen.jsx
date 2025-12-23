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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5">
        <div className="relative w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading Ticket</h1>
              <p className="text-gray-600">Please wait while we fetch your ticket...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!paymentStatus?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5">
        <div className="relative w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-300 rounded-xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Ticket Not Found</h1>
              <p className="text-gray-600 mb-6">
                Please register first to get your ticket
              </p>
              <button
                onClick={() => navigate('/')}
                className="py-3 px-6 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 shadow-lg"
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
  const isPaymentPending = userData.status === 'pending_payment'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="fixed w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-60 animate-[float_20s_infinite_ease-in-out]"></div>
      <div className="fixed w-72 h-72 -bottom-36 -left-36 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-40 animate-[float_20s_infinite_ease-in-out] [animation-delay:-10s]"></div>
      <div className="fixed w-80 h-80 top-1/2 -right-40 -translate-y-1/2 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-50"></div>
      <div className="fixed w-48 h-48 top-12 left-12 bg-gradient-to-br from-transparent to-blue-50 rotate-45 opacity-30"></div>
      <div className="fixed w-screen h-px bottom-24 left-0 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-50"></div>
      <div className="fixed w-px h-screen top-0 right-24 bg-gradient-to-b from-transparent via-blue-200 to-transparent opacity-50"></div>

      <div className="relative w-full max-w-2xl z-10">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Card Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-300 rounded-xl flex items-center justify-center mx-auto mb-5">
              {isApproved ? (
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z" />
                </svg>
              ) : isPending ? (
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
              )}
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
              {isApproved ? 'Your E-Ticket' : 
               isPending ? 'Verification in Progress' :
               isRejected ? 'Payment Rejected' : 'Registration Status'}
            </h1>
            <p className="text-gray-600 text-sm">
              {isApproved ? 'Ready for the event!' :
               isPending ? 'Your payment receipt is being reviewed' :
               isRejected ? 'Please check rejection details below' :
               'Complete your payment to get your ticket'}
            </p>
          </div>
          
          {/* Copy Success Message */}
          {copiedTicket && (
            <div className="flex items-center gap-3 p-4 bg-green-50 text-green-500 rounded-lg border border-green-200 mb-6 animate-[slideDown_0.3s_ease-out]">
              <span className="font-bold text-lg">✓</span>
              Ticket ID copied to clipboard!
            </div>
          )}
          
          {/* Approved Ticket View */}
          {isApproved ? (
            <>
              {/* Verification Badge */}
              <div className="flex items-center gap-3 p-4 bg-green-50 text-green-500 rounded-full border border-green-200 mb-6 w-fit mx-auto">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z" />
                </svg>
                <span className="font-bold text-sm">PAYMENT VERIFIED • TICKET ACTIVE</span>
              </div>
              
              {/* Ticket Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
                {/* Ticket Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">E-TICKET</div>
                      <div className="text-lg font-semibold">2025 Matric Party</div>
                    </div>
                    <div className="w-20 h-20 bg-white rounded-lg p-2">
                      {userData.qrCodeImage ? (
                        <img src={userData.qrCodeImage} alt="QR Code" className="w-full h-full" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-500">QR CODE</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Ticket Body */}
                <div className="p-6">
                  {/* Ticket ID */}
                  <div className="mb-6">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">TICKET ID</div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-mono font-bold text-gray-800">{userData.ticketId}</span>
                      <button
                        onClick={handleCopyTicket}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Ticket Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Attendee</div>
                      <div className="font-semibold text-gray-800">{userData.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Email</div>
                      <div className="font-semibold text-gray-800">{userData.email}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Phone</div>
                      <div className="font-semibold text-gray-800">{userData.phone}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Ticket Tier</div>
                      <div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase">
                          {userData.level?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Amount Paid</div>
                      <div className="font-bold text-blue-600 text-lg">{formatCurrency(userData.amount)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Approved On</div>
                      <div className="font-medium text-gray-800">{formatDate(userData.approvedAt)}</div>
                    </div>
                  </div>
                  
                  {/* Event Details */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" />
                        </svg>
                        <div>
                          <div className="font-semibold text-gray-800 mb-1">Main Event Hall</div>
                          <div className="text-sm text-gray-600">Obong University, Obong Ntak</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z" />
                        </svg>
                        <div>
                          <div className="font-semibold text-gray-800 mb-1">January 20th, 2025</div>
                          <div className="text-sm text-gray-600">6:00 PM - 11:00 PM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-4 mb-6">
                <button
                  onClick={handleDownloadTicket}
                  className="w-full py-4 px-8 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 relative overflow-hidden group shadow-lg"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <span>Download Ticket</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                {navigator.share && (
                  <button
                    onClick={handleShareTicket}
                    className="w-full py-3 px-6 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z" />
                    </svg>
                    <span>Share Ticket</span>
                  </button>
                )}
              </div>
              
              {/* Important Note */}
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-8">
                <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M11,16.5V18H13V16.5H11M12,6.5C10.07,6.5 8.5,8.07 8.5,10H10C10,8.9 10.9,8 12,8C13.1,8 14,8.9 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10C16,8.07 14.93,6.5 12,6.5Z" />
                </svg>
                <p className="text-sm text-gray-700">
                  <strong>Important:</strong> Bring this ticket (digital or printed) to the event. QR code will be scanned at entry.
                </p>
              </div>
            </>
          ) : isPending ? (
            /* Pending Verification View */
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2.5 mb-6">
                  <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-800">Verification in Progress</h2>
                </div>
                
                {/* Loading Indicator */}
                <div className="flex items-center gap-5 p-6 bg-blue-50 rounded-lg mb-6">
                  <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">Reviewing your payment receipt</h3>
                    <p className="text-sm text-gray-600">Our team is verifying your payment. This usually takes 24-48 hours.</p>
                  </div>
                </div>
                
                {/* Registration Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-6 border border-gray-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">REGISTRATION DETAILS</span>
                    <span className="text-sm font-mono text-gray-600">#{userData._id?.slice(-8)}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Attendee</span>
                      <span className="text-sm font-semibold text-gray-800">{userData.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Payment Reference</span>
                      <span className="text-sm font-mono font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded">
                        {userData.paymentReference}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Amount Paid</span>
                      <span className="text-sm font-bold text-blue-600">{formatCurrency(userData.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Receipt Uploaded</span>
                      <span className="text-sm font-semibold text-green-600">
                        {userData.receiptUrl ? '✓ Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm font-bold text-yellow-600">PENDING VERIFICATION</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={() => refetch()}
                    className="w-full py-4 px-8 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 relative overflow-hidden group shadow-lg"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      <span>Check Verification Status</span>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/upload-receipt', { state: { userId: actualUserId } })}
                    className="w-full py-3 px-6 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
                  >
                    Edit Receipt
                  </button>
                </div>
              </div>
            </>
          ) : isRejected ? (
            /* Rejected View */
            <>
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-500 rounded-lg border border-red-200 mb-6">
                <span className="font-bold text-lg">!</span>
                Payment verification failed
              </div>
              
              {/* Rejection Details */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-6 border border-gray-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-300"></div>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-gray-200">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">REJECTION DETAILS</span>
                  <span className="text-sm font-mono text-gray-600">#{userData._id?.slice(-8)}</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Reason</div>
                    <div className="font-semibold text-red-600">{userData.rejectionReason || 'Payment verification failed'}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rejected On</span>
                    <span className="text-sm font-semibold text-gray-800">{formatDate(userData.rejectedAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="text-sm font-semibold text-gray-800">{formatCurrency(userData.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Reference</span>
                    <span className="text-sm font-mono font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded">
                      {userData.paymentReference}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Next Steps */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-6 border border-gray-200">
                <div className="flex items-center gap-2.5 mb-4">
                  <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  <h3 className="text-base font-semibold text-gray-800">Next Steps</h3>
                </div>
                <ol className="space-y-2 pl-5 list-decimal text-sm text-gray-700">
                  <li>Check if you used the correct payment reference</li>
                  <li>Ensure the amount transferred matches exactly</li>
                  <li>Verify receipt shows correct account details</li>
                  <li>Contact support if you believe this is an error</li>
                  <li>You can re-upload a corrected receipt</li>
                </ol>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-4 mb-8">
                <button
                  onClick={() => navigate('/upload-receipt', { state: { userId: actualUserId } })}
                  className="w-full py-4 px-8 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 relative overflow-hidden group shadow-lg"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <span>Upload Corrected Receipt</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                <button
                  onClick={() => navigate('/payment', { state: { userId: actualUserId } })}
                  className="w-full py-3 px-6 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
                >
                  View Payment Details
                </button>
              </div>
            </>
          ) : isPaymentPending ? (
            /* Payment Pending View */
            <>
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-6 border border-gray-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-yellow-500"></div>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-gray-200">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">REGISTRATION PENDING</span>
                  <span className="text-sm font-mono text-gray-600">#{userData._id?.slice(-8)}</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="text-sm font-bold text-yellow-600">PAYMENT PENDING</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Amount Due</span>
                    <span className="text-sm font-bold text-blue-600">{formatCurrency(userData.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Payment Reference</span>
                    <span className="text-sm font-mono font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded">
                      {userData.paymentReference}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="mb-8">
                <button
                  onClick={() => navigate('/payment', { state: { userId: actualUserId } })}
                  className="w-full py-4 px-8 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 relative overflow-hidden group shadow-lg"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <span>Make Payment Now</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </>
          ) : null}
          
          {/* Progress Indicator */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex flex-col items-center gap-2 text-blue-600">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold shadow-lg shadow-blue-200">
                  1
                </div>
                <span className="text-xs font-medium">Register</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-200"></div>
              
              <div className="flex flex-col items-center gap-2 text-blue-600">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold shadow-lg shadow-blue-200">
                  2
                </div>
                <span className="text-xs font-medium">Pay via OPay</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-200"></div>
              
              <div className="flex flex-col items-center gap-2 text-blue-600">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold shadow-lg shadow-blue-200">
                  3
                </div>
                <span className="text-xs font-medium">Upload Receipt</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-200"></div>
              
              <div className="flex flex-col items-center gap-2 text-blue-600">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold shadow-lg shadow-blue-200 animate-pulse">
                  4
                </div>
                <span className="text-xs font-medium">Get Ticket</span>
              </div>
            </div>
            
            {/* Footer Note */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
              </svg>
              <p className="text-sm text-gray-700">
                Need assistance? Contact support at support@event.com or call 0800-123-4567
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default TicketScreen