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
  
  const getStatusDescription = () => {
    switch (status) {
      case 'pending_payment':
        return 'Complete payment to proceed with registration'
      case 'pending_verification':
        return 'Your payment receipt is being reviewed by admin'
      case 'approved':
        return 'Your registration is complete! Download your ticket below'
      case 'rejected':
        return 'Your payment was rejected. Please contact support'
      default:
        return ''
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5">
        <div className="relative w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Loading your status...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="fixed w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-60 animate-[float_20s_infinite_ease-in-out]"></div>
        <div className="fixed w-72 h-72 -bottom-36 -left-36 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-40 animate-[float_20s_infinite_ease-in-out] [animation-delay:-10s]"></div>
        
        <div className="relative w-full max-w-md z-10">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-300"></div>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-300 rounded-xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent mb-2">
                User Not Found
              </h1>
              <p className="text-gray-600 text-sm">
                Unable to find registration information
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              <p className="text-gray-700 font-medium">This could be because:</p>
              <ul className="space-y-2 text-left pl-5">
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-red-500 font-bold mt-1">•</span>
                  <span>The user ID is incorrect</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-red-500 font-bold mt-1">•</span>
                  <span>The registration has expired</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <span className="text-red-500 font-bold mt-1">•</span>
                  <span>You need to register first</span>
                </li>
              </ul>
              
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={handleGoToLogin} 
                  className="flex-1 py-3 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 shadow-lg"
                >
                  Try Login Instead
                </button>
                <button 
                  onClick={handleGoToRegister} 
                  className="flex-1 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
                >
                  Register New Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const statusColor = getStatusColor()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="fixed w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-60 animate-[float_20s_infinite_ease-in-out]"></div>
      <div className="fixed w-72 h-72 -bottom-36 -left-36 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-40 animate-[float_20s_infinite_ease-in-out] [animation-delay:-10s]"></div>
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
              <svg className="w-8 h-8 text-white animate-bounce" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.58,16.8L12,14.5L8.42,16.8L9.5,12.68L6.21,10L10.46,9.54L12,5.68L13.54,9.54L17.79,10L14.5,12.68L15.58,16.8Z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
              Registration Status
            </h1>
            <p className="text-gray-600 text-sm">
              Track your registration progress and payment status
            </p>
          </div>
          
          {/* Status Banner */}
          <div 
            className="flex items-start gap-4 p-5 rounded-xl mb-8 border-2" 
            style={{ 
              backgroundColor: `${statusColor}15`, 
              borderColor: statusColor 
            }}
          >
            <div className="text-2xl">{getStatusIcon()}</div>
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ color: statusColor }}>
                {getStatusMessage()}
              </h3>
              <p className="text-gray-700 text-sm">
                {getStatusDescription()}
              </p>
            </div>
          </div>
          
          {/* User Information */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-5">
              <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">Attendee Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Full Name</div>
                <div className="font-semibold text-gray-800">{user.name}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Email</div>
                <div className="font-semibold text-gray-800">{user.email}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Phone</div>
                <div className="font-semibold text-gray-800">{user.phone}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Ticket Tier</div>
                <div className="font-semibold">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase">
                    {user.level?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Amount</div>
                <div className="font-semibold text-blue-600 text-lg">{formatCurrency(user.amount)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Reference</div>
                <div className="font-mono font-semibold text-gray-800 text-sm bg-gray-100 px-3 py-1 rounded">
                  {user.paymentReference}
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Details */}
          {status === 'pending_payment' && user.paymentDetails && (
            <div className="mb-8">
              <div className="flex items-center gap-2.5 mb-5">
                <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">Payment Instructions</h3>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                <p className="text-gray-700 mb-6">Please make payment to the following OPay account:</p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded">{user.paymentDetails.accountNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account Name:</span>
                    <span className="font-semibold text-gray-800">{user.paymentDetails.accountName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bank Name:</span>
                    <span className="font-semibold text-gray-800">{user.paymentDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-blue-600 text-lg">{formatCurrency(user.paymentDetails.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-mono font-bold text-gray-800 bg-gray-900 text-white px-3 py-1 rounded text-sm">
                      {user.paymentDetails.reference}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg mt-6">
                  <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  <p className="text-sm text-gray-700">
                    <span className="font-bold">Important:</span> Use the exact reference number above when making payment
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Receipt Upload */}
          {(status === 'pending_payment' || status === 'pending_verification') && (
            <div className="mb-8">
              <div className="flex items-center gap-2.5 mb-5">
                <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">Upload Payment Receipt</h3>
              </div>
              
              {uploadSuccess && (
                <div className="flex items-center gap-3 p-4 bg-green-50 text-green-500 rounded-lg border border-green-200 mb-6 animate-[slideDown_0.3s_ease-out]">
                  <span className="font-bold text-lg">✓</span>
                  {uploadSuccess}
                </div>
              )}
              
              {uploadError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-500 rounded-lg border border-red-200 mb-6 animate-[slideDown_0.3s_ease-out]">
                  <span className="font-bold text-lg">!</span>
                  {uploadError}
                </div>
              )}
              
              {user.receiptUrl ? (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <svg className="w-10 h-10 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z" />
                    </svg>
                    <div>
                      <p className="font-bold text-gray-800">Receipt Already Uploaded</p>
                      <p className="text-sm text-gray-600 mb-2">Uploaded on: {formatDate(user.paymentDate)}</p>
                      <a 
                        href={user.receiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H11V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V13H19V19Z" />
                        </svg>
                        View Receipt
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReceiptSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="receiptUrl" className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Receipt URL
                    </label>
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19L12,15H9V10H15V15L13,19H10Z" />
                      </svg>
                      <input
                        type="url"
                        id="receiptUrl"
                        value={receiptUrl}
                        onChange={handleReceiptChange}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="https://example.com/receipt.jpg"
                        disabled={isUploading || status !== 'pending_payment'}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Paste the URL of your payment receipt screenshot or photo
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    className="py-3 px-6 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 relative overflow-hidden group shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isUploading || !receiptUrl.trim() || status !== 'pending_payment'}
                  >
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      {isUploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        'Upload Receipt'
                      )}
                    </div>
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  
                  {status !== 'pending_payment' && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M13,17H11V15H13V17M13,13H11V7H13V13Z" />
                      </svg>
                      <p className="text-sm text-gray-700">
                        Receipt upload is only available when payment status is "pending_payment"
                      </p>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
          
          {/* Timeline */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Registration Timeline</h3>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Step 1: Registration */}
              <div className="relative flex items-start mb-8">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold z-10 mr-6
                  ${['pending_verification', 'approved', 'rejected'].includes(status) 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-500'}`}>
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-1">Registration</h4>
                  <p className="text-gray-600 text-sm">Completed registration process</p>
                </div>
              </div>
              
              {/* Step 2: Payment */}
              <div className="relative flex items-start mb-8">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold z-10 mr-6
                  ${status === 'pending_payment' 
                    ? 'bg-blue-500 text-white shadow-lg animate-pulse' 
                    : status === 'pending_verification' 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : ['approved', 'rejected'].includes(status) 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-500'}`}>
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-1">Payment</h4>
                  <p className="text-gray-600 text-sm">
                    {status === 'pending_payment' && 'Make payment to complete registration'}
                    {status === 'pending_verification' && 'Payment made, receipt uploaded'}
                    {['approved', 'rejected'].includes(status) && 'Payment completed'}
                  </p>
                </div>
              </div>
              
              {/* Step 3: Verification */}
              <div className="relative flex items-start mb-8">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold z-10 mr-6
                  ${status === 'pending_verification' 
                    ? 'bg-blue-500 text-white shadow-lg animate-pulse' 
                    : ['approved', 'rejected'].includes(status) 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-500'}`}>
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-1">Verification</h4>
                  <p className="text-gray-600 text-sm">
                    {status === 'pending_verification' && 'Admin reviewing your payment'}
                    {status === 'approved' && 'Payment verified successfully'}
                    {status === 'rejected' && 'Payment rejected - contact support'}
                  </p>
                </div>
              </div>
              
              {/* Step 4: Ticket */}
              <div className="relative flex items-start">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold z-10 mr-6
                  ${['approved', 'rejected'].includes(status) 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-500'}`}>
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-1">Ticket</h4>
                  <p className="text-gray-600 text-sm">
                    {status === 'approved' && 'Ticket generated and ready'}
                    {status === 'rejected' && 'Ticket not issued'}
                    {!['approved', 'rejected'].includes(status) && 'Awaiting verification'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            {status === 'pending_payment' && (
              <button
                onClick={() => navigate('/payment', { state: { userId, userData: user } })}
                className="w-full py-4 px-8 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 relative overflow-hidden group shadow-lg"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <span>Make Payment</span>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            )}
            
            {status === 'approved' && (
              <button
                onClick={() => navigate(`/ticket/${userId}`, { state: { user } })}
                className="w-full py-4 px-8 bg-gradient-to-br from-green-600 to-green-400 text-white rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 relative overflow-hidden group shadow-lg"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <span>View My Ticket</span>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.58,16.8L12,14.5L8.42,16.8L9.5,12.68L6.21,10L10.46,9.54L12,5.68L13.54,9.54L17.79,10L14.5,12.68L15.58,16.8Z" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            )}
            
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/login')} 
                className="flex-1 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
              >
                Back to Login
              </button>
              <button 
                onClick={() => navigate('/')} 
                className="flex-1 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium transition-all duration-300 hover:border-gray-300 hover:shadow-md"
              >
                Register New
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
              </svg>
              <p className="text-sm text-gray-700">
                For any issues, contact support at support@event.com or call 0800-123-4567
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

export default StatusScreen