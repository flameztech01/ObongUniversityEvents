import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useGetPaymentStatusQuery } from '../slices/userApiSlice'

const TicketWithId = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(location.state?.user)
  const [copied, setCopied] = useState(false)
  const [qrData, setQrData] = useState('')

  const { data: statusData, isLoading, error } = useGetPaymentStatusQuery(id, {
    skip: !id || !!user
  })

  useEffect(() => {
    if (statusData?.data) {
      setUser(statusData.data)
    }
  }, [statusData])

  useEffect(() => {
    if (user?.ticketId) {
      setQrData(`TICKET:${user.ticketId}:${user._id}`)
    }
  }, [user])

  const handleCopyTicketId = () => {
    if (user?.ticketId) {
      navigator.clipboard.writeText(user.ticketId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrintTicket = () => {
    window.print()
  }

  const handleDownloadTicket = () => {
    alert('Ticket download would start here. In production, this would download your ticket file.')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5">
        <div className="relative w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300"></div>
            <div className="flex items-center gap-5 p-6">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Loading Ticket</h3>
                <p className="text-sm text-gray-600">Please wait while we fetch your ticket information...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user || user.status !== 'approved') {
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
              <h1 className="text-2xl font-bold text-gray-800 mb-2">No Ticket Available</h1>
              <p className="text-gray-600 text-sm">
                {error ? 'Error loading ticket' : 'Your ticket is not yet approved'}
              </p>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-500 rounded-lg border border-red-200 mb-6">
              <span className="font-bold text-lg">!</span>
              {error?.data?.message || 'Ticket is not available. Please complete payment and verification first.'}
            </div>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-6 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z" />
              </svg>
              <span>Check Status</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3 relative overflow-hidden print:bg-white print:p-0">
      {/* Decorative Elements - Hidden in Print */}
      <div className="fixed w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-60 animate-[float_20s_infinite_ease-in-out] print:hidden"></div>
      <div className="fixed w-72 h-72 -bottom-36 -left-36 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-40 animate-[float_20s_infinite_ease-in-out] [animation-delay:-10s] print:hidden"></div>
      <div className="fixed w-48 h-48 top-12 left-12 bg-gradient-to-br from-transparent to-blue-50 rotate-45 opacity-30 print:hidden"></div>
      <div className="fixed w-screen h-px bottom-24 left-0 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-50 print:hidden"></div>
      <div className="fixed w-px h-screen top-0 right-24 bg-gradient-to-b from-transparent via-blue-200 to-transparent opacity-50 print:hidden"></div>

      <div className="relative w-full max-w-md z-10 print:max-w-full print:mx-0 print:px-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-3 shadow-2xl border border-white/20 relative overflow-hidden print:bg-white print:shadow-none print:border print:border-gray-300 print:rounded-none print:p-6">
          {/* Card Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300 print:bg-blue-500"></div>

          {/* Header */}
          <div className="text-center mb-8 print:mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-300 rounded-xl flex items-center justify-center mx-auto mb-5 print:mb-4">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.58,16.8L12,14.5L8.42,16.8L9.5,12.68L6.21,10L10.46,9.54L12,5.68L13.54,9.54L17.79,10L14.5,12.68L15.58,16.8Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2 print:text-xl">Your Event Ticket</h1>
            <p className="text-gray-600 text-sm print:text-xs">
              Present this ticket at the event entrance
            </p>
          </div>

          {/* Ticket Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8 print:shadow-none print:mb-6">
            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">EVENT ACCESS</div>
                  <div className="text-lg font-semibold print:text-base">The First Wave (Fresher's Night)</div>
                </div>
                <div className="w-20 h-20 bg-white rounded-lg p-2 print:w-16 print:h-16">
                  {qrData ? (
                    <div className="w-full h-full bg-gray-100 rounded flex flex-col items-center justify-center">
                      <div className="text-[6px] font-bold text-gray-800 text-center leading-tight print:text-[5px]">
                        QR CODE<br />
                        {user.ticketId?.slice(0, 8)}<br />
                        SCAN ME
                      </div>
                    </div>
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
              <div className="mb-6 print:mb-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ticket ID</div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-mono font-bold text-gray-800 print:text-lg">
                    {user.ticketId || `EVT-${user._id?.slice(-12).toUpperCase()}`}
                  </span>
                  <button
                    onClick={handleCopyTicketId}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors print:hidden"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              
              {/* Ticket Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 print:mb-4">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Name</div>
                  <div className="font-semibold text-gray-800 print:text-sm">{user.name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Email</div>
                  <div className="font-semibold text-gray-800 print:text-sm">{user.email}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Ticket Type</div>
                  <div className="font-semibold text-gray-800 print:text-sm">{user.level?.toUpperCase()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Reference</div>
                  <div className="font-semibold text-gray-800 print:text-sm font-mono">{user.paymentReference}</div>
                </div>
              </div>
              
              {/* Event Details */}
              <div className="border-t border-gray-200 pt-6 print:pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:gap-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 print:w-4 print:h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-gray-800 mb-1 print:text-sm">School's Cafeteria</div>
                      <div className="text-sm text-gray-600 print:text-xs">Obong University, Obong Ntak</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 print:w-4 print:h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-gray-800 mb-1 print:text-sm">January 16th, 2025</div>
                      <div className="text-sm text-gray-600 print:text-xs">7:00 PM - 12:AM PM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8 print:hidden">
            <button
              onClick={handlePrintTicket}
              className="flex-1 py-4 bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-lg font-semibold text-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 relative overflow-hidden group shadow-lg"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z" />
                </svg>
                <span>Print Ticket</span>
              </div>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button
              onClick={handleDownloadTicket}
              className="flex-1 py-4 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
              </svg>
              <span>Download</span>
            </button>
          </div>

          {/* Important Note */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-8 print:mb-6">
            <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5 print:w-4 print:h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
            <div>
              <p className="text-sm text-gray-700 mb-1 print:text-xs">
                <strong>Important:</strong> Bring a valid ID matching the name on this ticket.
              </p>
              <p className="text-sm text-gray-700 print:text-xs">Ticket is non-transferable. Screenshots are accepted.</p>
            </div>
          </div>

          {/* Footer Actions - Hidden in Print */}
          <div className="pt-6 border-t border-gray-200 print:hidden">
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/status/${user._id}`)}
                className="flex-1 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium transition-all duration-300 hover:border-gray-300 hover:shadow-md"
              >
                View Status
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium transition-all duration-300 hover:border-gray-300 hover:shadow-md"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex-1 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium transition-all duration-300 hover:border-gray-300 hover:shadow-md"
              >
                Check Another
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:bg-white {
            background: white !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:border {
            border: 1px solid #e5e7eb !important;
          }
          
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          
          .print\\:mx-0 {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          
          .print\\:px-4 {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          
          .print\\:max-w-full {
            max-width: 100% !important;
          }
          
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
          
          .print\\:text-xl {
            font-size: 1.25rem !important;
            line-height: 1.75rem !important;
          }
          
          .print\\:text-sm {
            font-size: 0.875rem !important;
            line-height: 1.25rem !important;
          }
          
          .print\\:text-xs {
            font-size: 0.75rem !important;
            line-height: 1rem !important;
          }
          
          .print\\:text-lg {
            font-size: 1.125rem !important;
            line-height: 1.75rem !important;
          }
          
          .print\\:w-16 {
            width: 4rem !important;
          }
          
          .print\\:h-16 {
            height: 4rem !important;
          }
          
          .print\\:w-4 {
            width: 1rem !important;
          }
          
          .print\\:h-4 {
            height: 1rem !important;
          }
          
          .print\\:gap-4 {
            gap: 1rem !important;
          }
          
          .print\\:pt-4 {
            padding-top: 1rem !important;
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
      `}</style>
    </div>
  )
}

export default TicketWithId