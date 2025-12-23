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
    pollingInterval: 5000,
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
      
      const checkStatus = async () => {
        try {
          await refetch()
        } catch (error) {
          console.error('Error checking status:', error)
        }
      }
      
      const statusInterval = setInterval(checkStatus, 5000)
      
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5">
        <div className="relative w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-300 rounded-xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2Z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Checking Verification Status</h1>
              <p className="text-gray-600 text-sm">
                Please wait while we check your payment verification...
              </p>
            </div>
            
            <div className="text-center py-6">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-700 mb-6">
                Your receipt has been submitted. We're checking if it's been verified yet.
              </p>
              <button
                onClick={handleCheckNow}
                className="py-3 px-6 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="fixed w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-60 animate-[float_20s_infinite_ease-in-out]"></div>
        <div className="fixed w-72 h-72 -bottom-36 -left-36 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-40 animate-[float_20s_infinite_ease-in-out] [animation-delay:-10s]"></div>
        
        <div className="relative w-full max-w-md z-10">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-300 rounded-xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2Z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Awaiting Verification</h1>
              <p className="text-gray-600 text-sm">
                Your receipt is being reviewed by our team
              </p>
            </div>
            
            <div className="text-center mb-8">
              {/* Animated Status Indicator */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
                <div className="absolute inset-4 rounded-full bg-blue-500/40 animate-ping" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute inset-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2Z" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-3">Verification in Progress</h3>
              <p className="text-gray-600 mb-6">
                Our team is reviewing your payment receipt. This usually takes 24-48 hours.
                You'll be automatically redirected to your ticket once approved.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="font-bold text-yellow-600">Under Review</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Submitted:</span>
                  <span className="font-medium text-gray-800">
                    {paymentStatus?.data?.paymentDate ? 
                      new Date(paymentStatus.data.paymentDate).toLocaleDateString() : 
                      'Just now'}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCheckNow}
                  className="flex-1 py-3 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                  </svg>
                  Check Status Now
                </button>
                
                <button
                  onClick={handleViewStatus}
                  className="flex-1 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
                >
                  View Full Status
                </button>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M13,17H11V15H13V17M13,13H11V7H13V13Z" />
              </svg>
              <p className="text-sm text-gray-700">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5">
        <div className="relative w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-300"></div>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-300 rounded-xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Rejected</h1>
              <p className="text-gray-600 text-sm">
                Your payment receipt was not approved
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-bold text-red-800 mb-2">Reason for Rejection:</h3>
                <p className="text-red-700">{paymentStatus.data.rejectionReason || 'Payment details could not be verified'}</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setReceiptUrl('')
                    setSuccessMessage('')
                  }}
                  className="flex-1 py-3 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 shadow-lg"
                >
                  Upload New Receipt
                </button>
                
                <button
                  onClick={handleViewStatus}
                  className="flex-1 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
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
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Access</h1>
              <p className="text-gray-600 mb-6">
                Please register first to upload receipt
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="fixed w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-60 animate-[float_20s_infinite_ease-in-out]"></div>
      <div className="fixed w-72 h-72 -bottom-36 -left-36 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-40 animate-[float_20s_infinite_ease-in-out] [animation-delay:-10s]"></div>
      <div className="fixed w-48 h-48 top-12 left-12 bg-gradient-to-br from-transparent to-blue-50 rotate-45 opacity-30"></div>
      <div className="fixed w-screen h-px bottom-24 left-0 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-50"></div>

      <div className="relative w-full max-w-md z-10">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Card Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-300 rounded-xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Upload Receipt</h1>
            <p className="text-gray-600 text-sm">
              Upload your payment receipt for verification
            </p>
          </div>
          
          {/* Error/Success Messages */}
          {errors.submit && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-500 rounded-lg border border-red-200 mb-6 animate-[slideDown_0.3s_ease-out]">
              <span className="font-bold text-lg">!</span>
              {errors.submit}
            </div>
          )}
          
          {successMessage && (
            <div className="flex items-center gap-3 p-4 bg-green-50 text-green-500 rounded-lg border border-green-200 mb-6 animate-[slideDown_0.3s_ease-out]">
              <span className="font-bold text-lg">✓</span>
              {successMessage}
            </div>
          )}
          
          {/* Payment Details Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-8 border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-gray-200">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">PAYMENT DETAILS</span>
              <span className="text-sm font-mono text-gray-600">#{userId?.slice(-8)}</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Attendee</span>
                <span className="text-sm font-semibold text-gray-800">{name || paymentStatus?.data?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Reference</span>
                <span className="text-sm font-mono font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded">
                  {paymentReference || paymentStatus?.data?.paymentReference}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount Paid</span>
                <span className="text-sm font-bold text-blue-600">{formatCurrency(amount || paymentStatus?.data?.amount || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Status</span>
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
            </div>
          </div>
          
          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Method Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Upload Method
              </label>
              <div className="flex gap-3 mb-6">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="uploadMethod"
                    value="link"
                    checked={uploadMethod === 'link'}
                    onChange={(e) => setUploadMethod(e.target.value)}
                    disabled={isUploading}
                    className="sr-only peer"
                  />
                  <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-center transition-all duration-300 peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-600 hover:border-blue-300">
                    <span className="font-medium">Paste Image URL</span>
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="uploadMethod"
                    value="file"
                    checked={uploadMethod === 'file'}
                    onChange={(e) => setUploadMethod(e.target.value)}
                    disabled={isUploading}
                    className="sr-only peer"
                  />
                  <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-center transition-all duration-300 peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-600 hover:border-blue-300">
                    <span className="font-medium">Upload File</span>
                  </div>
                </label>
              </div>
            </div>
            
            {/* URL Upload */}
            {uploadMethod === 'link' ? (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="receiptUrl" className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Receipt Image URL
                  </label>
                  {errors.receiptUrl && (
                    <span className="text-sm text-red-500 font-medium">{errors.receiptUrl}</span>
                  )}
                </div>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,13V17H10V13H7L12,8L17,13H14M14,2H10V4H14M2,15H4V19H14V21H2M20,9H14V11H20V20H14V22H20A2,2 0 0,0 22,20V11A2,2 0 0,0 20,9Z" />
                  </svg>
                  <input
                    type="url"
                    id="receiptUrl"
                    name="receiptUrl"
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium ${errors.receiptUrl ? 'border-red-500 animate-[shake_0.5s_ease-in-out]' : 'border-gray-200'}`}
                    placeholder="https://example.com/receipt.jpg"
                    disabled={isUploading}
                  />
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg mt-3">
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  <p className="text-sm text-gray-700">
                    Upload to Google Drive, Dropbox, or any image hosting service and paste the link here
                  </p>
                </div>
              </div>
            ) : (
              /* File Upload */
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="fileUpload" className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Upload Receipt Image
                  </label>
                  {errors.receiptUrl && (
                    <span className="text-sm text-red-500 font-medium">{errors.receiptUrl}</span>
                  )}
                </div>
                
                <div className="relative">
                  <input
                    type="file"
                    id="fileUpload"
                    accept="image/*,.pdf"
                    onChange={handleImageUpload}
                    className="sr-only"
                    disabled={isUploading}
                  />
                  <label htmlFor="fileUpload" className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
                      </svg>
                      <p className="font-medium text-gray-700 mb-1">Click to upload receipt image</p>
                      <p className="text-sm text-gray-500">PNG, JPG, PDF up to 5MB</p>
                    </div>
                  </label>
                  
                  {previewImage && (
                    <div className="mt-4 text-center">
                      <img 
                        src={previewImage} 
                        alt="Receipt preview" 
                        className="max-w-full max-h-48 mx-auto rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null)
                          setReceiptUrl('')
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Receipt Requirements */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2.5 mb-4">
                <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M17.13,17C15.92,18.85 14.11,20.24 12,20.92C9.89,20.24 8.08,18.85 6.87,17C6.53,16.5 6.24,16 6,15.47C6,13.82 8.71,12.47 12,12.47C15.29,12.47 18,13.79 18,15.47C17.76,16 17.47,16.5 17.13,17Z" />
                </svg>
                <h3 className="text-base font-semibold text-gray-800">Receipt Requirements</h3>
              </div>
              <ul className="space-y-2 pl-5 list-disc text-sm text-gray-700">
                <li>Receipt must clearly show:
                  <ul className="space-y-1 pl-5 list-circle mt-1">
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
            
            {/* Auto-redirect Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2Z" />
              </svg>
              <p className="text-sm text-gray-700">
                <strong>Automatic Ticket:</strong> Once your receipt is verified, 
                you'll be automatically redirected to your ticket page!
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                type="submit"
                className="w-full py-4 px-8 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 relative overflow-hidden group shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isUploading || paymentStatus?.data?.status === 'pending_verification'}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : paymentStatus?.data?.status === 'pending_verification' ? (
                    <>
                      <span>Receipt Submitted</span>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Submit Receipt for Verification</span>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
                      </svg>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button
                type="button"
                onClick={handleViewStatus}
                className="w-full py-3 px-6 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
              >
                View Payment Status
              </button>
            </div>
            
            {/* Success Note */}
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M11,16.5V18H13V16.5H11M12,6.5C10.07,6.5 8.5,8.07 8.5,10H10C10,8.9 10.9,8 12,8C13.1,8 14,8.9 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10C16,8.07 14.93,6.5 12,6.5Z" />
              </svg>
              <p className="text-sm text-gray-700">
                <strong>Verification Process:</strong> After upload, our team will verify your payment. You'll be automatically redirected to your ticket once approved.
              </p>
            </div>
          </form>
          
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
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold shadow-lg shadow-blue-200 animate-pulse">
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
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .list-circle {
          list-style-type: circle;
        }
      `}</style>
    </div>
  )
}

export default UploadReceiptScreen