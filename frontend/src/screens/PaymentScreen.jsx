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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5">
        <div className="relative w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading Payment Details</h1>
              <p className="text-gray-600">Please wait while we fetch your information...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="fixed w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-60 animate-[float_20s_infinite_ease-in-out]"></div>
      <div className="fixed w-80 h-80 top-1/2 -right-40 -translate-y-1/2 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-50"></div>
      <div className="fixed w-48 h-48 top-12 left-12 bg-gradient-to-br from-transparent to-blue-50 rotate-45 opacity-30"></div>
      <div className="fixed w-screen h-px bottom-24 left-0 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-50"></div>

      <div className="relative w-full max-w-2xl z-10">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Card Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-300 rounded-xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-white animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
              Payment Details
            </h1>
            <p className="text-gray-600 text-sm">
              Transfer the exact amount to complete your registration
            </p>
          </div>
          
          {/* Copy Success Message */}
          {showCopySuccess && (
            <div className="flex items-center gap-3 p-4 bg-green-50 text-green-500 rounded-lg border border-green-200 mb-6 animate-[slideDown_0.3s_ease-out]">
              <span className="font-bold text-lg">✓</span>
              Copied {copiedField} to clipboard!
            </div>
          )}
          
          {/* OPay Transfer Details */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-8 border border-gray-200">
            <div className="flex items-center gap-2.5 mb-6">
              <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">OPay Transfer Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Account Number */}
              <div className="space-y-2">
                <span className="text-sm text-gray-600">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="flex-1 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg font-bold font-mono">
                    {paymentDetails.accountNumber}
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(paymentDetails.accountNumber, 'account number')}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Account Name */}
              <div className="space-y-2">
                <span className="text-sm text-gray-600">Account Name</span>
                <div className="flex items-center gap-2">
                  <span className="flex-1 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg font-bold">
                    {paymentDetails.accountName}
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(paymentDetails.accountName, 'account name')}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Bank Name */}
              <div className="space-y-2">
                <span className="text-sm text-gray-600">Bank Name</span>
                <span className="block bg-blue-50 text-blue-700 px-4 py-3 rounded-lg font-bold">
                  {paymentDetails.bankName}
                </span>
              </div>
              
              {/* Amount to Pay */}
              <div className="space-y-2">
                <span className="text-sm text-gray-600">Amount to Pay</span>
                <span className="block bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-3 rounded-lg font-bold text-xl">
                  {formatCurrency(paymentStatus?.data?.amount || 0)}
                </span>
              </div>
              
              {/* Payment Reference */}
              <div className="md:col-span-2 space-y-2">
                <span className="text-sm text-gray-600">Payment Reference</span>
                <div className="flex items-center gap-2">
                  <span className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-lg font-mono font-bold">
                    {paymentStatus?.data?.paymentReference || 'N/A'}
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(paymentStatus?.data?.paymentReference, 'payment reference')}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Payment Instructions */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2.5 mb-4">
                <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
                <h3 className="text-base font-semibold text-gray-800">Payment Instructions</h3>
              </div>
              <ol className="space-y-3 pl-5 list-decimal">
                <li className="text-gray-700">Open your OPay app or any banking app</li>
                <li className="text-gray-700">Add a new beneficiary with the account details above</li>
                <li className="text-gray-700">
                  Transfer the exact amount: <strong className="text-blue-600">{formatCurrency(paymentStatus?.data?.amount || 0)}</strong>
                </li>
                <li className="text-gray-700">Use the payment reference provided above</li>
                <li className="text-gray-700">Take a screenshot of the successful transaction</li>
                <li className="text-gray-700">Upload the receipt using the button below</li>
              </ol>
            </div>
          </div>
          
          {/* Registration Status */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-8 border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-gray-200">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">REGISTRATION STATUS</span>
              <span className="text-sm font-mono text-gray-600">#{paymentStatus?.data?._id?.slice(-8) || 'PENDING'}</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Attendee</span>
                <span className="text-sm font-semibold text-gray-800">{paymentStatus?.data?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm font-semibold text-gray-800">{paymentStatus?.data?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tier</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase">
                  {paymentStatus?.data?.level?.toUpperCase() || 'BASIC'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`text-sm font-bold ${
                  paymentStatus?.data?.status === 'approved' 
                    ? 'text-green-600' 
                    : paymentStatus?.data?.status === 'pending_verification' 
                      ? 'text-yellow-600' 
                      : paymentStatus?.data?.status === 'rejected' 
                        ? 'text-red-600' 
                        : 'text-blue-600'
                }`}>
                  {paymentStatus?.data?.status?.replace('_', ' ').toUpperCase() || 'PENDING PAYMENT'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-semibold text-gray-800">
                  {paymentStatus?.data?.updatedAt ? new Date(paymentStatus.data.updatedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <button
              onClick={handleUploadReceipt}
              className={`w-full py-4 px-8 rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 relative overflow-hidden group shadow-lg ${
                paymentStatus?.data?.status === 'approved' || paymentStatus?.data?.status === 'pending_verification'
                  ? 'bg-gradient-to-br from-green-600 to-green-400 cursor-not-allowed'
                  : 'bg-gradient-to-br from-blue-600 to-blue-400'
              } text-white`}
              disabled={paymentStatus?.data?.status === 'approved' || paymentStatus?.data?.status === 'pending_verification'}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {paymentStatus?.data?.status === 'pending_verification' ? (
                  <>
                    <span>Receipt Already Uploaded</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Upload Payment Receipt</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
                    </svg>
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button
              onClick={handleCheckStatus}
              className="w-full py-3 px-6 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
              </svg>
              <span>Refresh Status</span>
            </button>
          </div>
          
          {/* Important Note */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-8">
            <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M11,16.5V18H13V16.5H11M12,6.5C10.07,6.5 8.5,8.07 8.5,10H10C10,8.9 10.9,8 12,8C13.1,8 14,8.9 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10C16,8.07 14.93,6.5 12,6.5Z" />
            </svg>
            <p className="text-sm text-gray-700">
              <strong>Important:</strong> Use the exact payment reference when transferring. It helps us verify your payment quickly.
            </p>
          </div>
          
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
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold shadow-lg shadow-blue-200 animate-pulse">
                  2
                </div>
                <span className="text-xs font-medium">Pay via OPay</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-200"></div>
              
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <span className="text-xs font-medium">Upload Receipt</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-200"></div>
              
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <span className="text-xs font-medium">Get Ticket</span>
              </div>
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

export default PaymentScreen