// src/components/PaymentModal.js 

import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, Zap, Star, Crown, Bitcoin, Building, Copy, ExternalLink, AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { PRICING_PLANS, calculateCustomPrice, createBankTransferOrder, createCoinbasePayment, getPaymentHistory, getPaymentStatus } from '../services/paymentService';

// Payment History Modal Component 
const PaymentHistoryModal = ({ isOpen, onClose, history, loading, onRefresh }) => {
  if (!isOpen) return null;
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-600/20 text-green-300';
      case 'pending_verification':
      case 'awaiting_payment':
        return 'bg-yellow-600/20 text-yellow-300';
      case 'failed':
        return 'bg-red-600/20 text-red-300';
      default:
        return 'bg-gray-600/20 text-gray-300';
    }
  };

  const getMethodColor = (method) => {
    return method === 'coinbase' 
      ? 'bg-orange-600/20 text-orange-300'
      : 'bg-green-600/20 text-green-300';
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-800/50">
          <h3 className="text-xl font-bold text-white flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-400" />
            Payment History
          </h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={onRefresh}
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/60 text-lg">Loading payment history...</p>
              <p className="text-white/40 text-sm mt-2">Please wait while we fetch your payment data</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white/30" />
              </div>
              <h4 className="text-white/80 text-lg font-medium mb-2">No Payment History</h4>
              <p className="text-white/60 mb-2">You haven't made any payments yet</p>
              <p className="text-white/40 text-sm">Your completed payments will appear here once you make a purchase</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white/60 py-3 px-2 font-medium">Date</th>
                      <th className="text-left text-white/60 py-3 px-2 font-medium">Order ID</th>
                      <th className="text-left text-white/60 py-3 px-2 font-medium">Amount</th>
                      <th className="text-left text-white/60 py-3 px-2 font-medium">Credits</th>
                      <th className="text-left text-white/60 py-3 px-2 font-medium">Method</th>
                      <th className="text-left text-white/60 py-3 px-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((payment) => (
                      <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-2 text-white/80">
                          <div className="text-sm">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-white/50">
                            {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-white/80">
                          <div className="font-mono text-sm max-w-32 truncate" title={payment.orderId}>
                            {payment.orderId}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-white font-semibold">
                          <div className="text-sm">${payment.priceUSD}</div>
                          {payment.priceLKR && (
                            <div className="text-white/60 text-xs">
                              {payment.priceLKR} LKR
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-2">
                          <div className="text-green-400 font-medium text-sm">
                            +{payment.quota}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(payment.paymentMethod)}`}>
                            {payment.paymentMethod === 'coinbase' ? 'Crypto' : 'Bank Transfer'}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status === 'awaiting_payment' ? 'Awaiting Payment' : 
                             payment.status === 'pending_verification' ? 'Pending Verification' :
                             payment.status === 'success' ? 'Success' :
                             payment.status === 'failed' ? 'Failed' :
                             payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {history.map((payment) => (
                  <div key={payment.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-white font-medium text-sm">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-white/50 text-xs">
                          {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status === 'awaiting_payment' ? 'Awaiting Payment' : 
                         payment.status === 'pending_verification' ? 'Pending Verification' :
                         payment.status === 'success' ? 'Success' :
                         payment.status === 'failed' ? 'Failed' :
                         payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-white/60">Order ID</p>
                        <p className="text-white font-mono text-xs truncate" title={payment.orderId}>
                          {payment.orderId}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60">Amount</p>
                        <p className="text-white font-semibold">${payment.priceUSD}</p>
                        {payment.priceLKR && (
                          <p className="text-white/60 text-xs">{payment.priceLKR} LKR</p>
                        )}
                      </div>
                      <div>
                        <p className="text-white/60">Credits</p>
                        <p className="text-green-400 font-medium">+{payment.quota}</p>
                      </div>
                      <div>
                        <p className="text-white/60">Method</p>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(payment.paymentMethod)}`}>
                          {payment.paymentMethod === 'coinbase' ? 'Crypto' : 'Bank Transfer'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// PaymentModal Component 
const PaymentModal = ({ isOpen, onClose, userStats, onSuccess, user }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customQuota, setCustomQuota] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('coinbase');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);
  
  // Payment History State
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Payment Status Polling
  const [pollingOrderId, setPollingOrderId] = useState(null);

  // Bank details 
  const bankDetails = {
    bankName: "Bank of Ceylon",
    accountName: "Your Business Name",
    accountNumber: "1234567890",
    branch: "Colombo Main Branch",
    swiftCode: "BCEYLKLX"
  };

  // Fetch Payment History 
  const fetchPaymentHistory = async () => {
    setHistoryLoading(true);
    setError(''); 
    
    try {
      const result = await getPaymentHistory(user.apiKey, { page: 1, limit: 20 });
      
      if (result.success) {
        setPaymentHistory(result.data || []);
      } else {
        setError('Failed to load payment history');
      }
    } catch (error) {
      setError(`Failed to load payment history: ${error.message}`);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Poll Payment Status 
  const pollPaymentStatus = async (orderId) => {
    const maxAttempts = 60; // 10 minutes with 10-second intervals
    let attempts = 0;
    
    const checkStatus = async () => {
      try {
        const statusResult = await getPaymentStatus(user.apiKey, orderId);
        
        if (statusResult.success) {
          const status = statusResult.data.status;
          
          if (status === 'success') {
            setSuccessMessage('🎉 Payment confirmed! Your quota has been activated.');
            setPollingOrderId(null);
            
            // Refresh user data and close modal
            if (onSuccess) {
              onSuccess({ 
                message: 'Payment completed successfully',
                quota: statusResult.data.quota 
              });
            }
            
            // Close modal after delay
            setTimeout(() => {
              onClose();
            }, 2000);
            return;
          }
          
          if (status === 'failed') {
            setError('Payment failed. Please try again or contact support.');
            setPollingOrderId(null);
            return;
          }
          
          if (['awaiting_payment', 'pending_verification'].includes(status)) {
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(checkStatus, 10000); // Check every 10 seconds
            } else {
              setSuccessMessage('Payment initiated. You will receive confirmation once payment is processed.');
              setPollingOrderId(null);
            }
          }
        }
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000);
        } else {
          setPollingOrderId(null);
        }
      }
    };
    
    // Start polling after 5 seconds
    setTimeout(checkStatus, 5000);
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setCustomQuota('');
    setError('');
  };

  const handleCustomQuotaChange = (value) => {
    const quota = parseInt(value);
    if (quota > 1000) {
      const pricing = calculateCustomPrice(quota);
      setSelectedPlan({
        id: 'custom',
        name: 'Custom Pack',
        quota: quota,
        priceUSD: pricing.priceUSD,
        priceLKR: pricing.priceLKR,
        features: [`${quota} SMS/Email Credits`, 'Premium Support', 'API Priority'],
        color: 'green'
      });
    } else {
      setSelectedPlan(null);
    }
    setCustomQuota(value);
    setError('');
  };

  // Coinbase Payment Handler
  const handleCoinbasePayment = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Create Coinbase payment
      const paymentResult = await createCoinbasePayment(user.apiKey, {
        planId: selectedPlan.id,
        quota: selectedPlan.quota,
        priceUSD: selectedPlan.priceUSD,
        priceLKR: selectedPlan.priceLKR
      });

      if (paymentResult.success) {
        const { hostedUrl, orderId } = paymentResult.data;
        
        if (hostedUrl) {
          // Start polling for payment status
          setPollingOrderId(orderId);
          pollPaymentStatus(orderId);
          
          // Redirect to Coinbase payment page
          window.open(hostedUrl, '_blank');
          
          setSuccessMessage('Redirected to Coinbase payment page. Complete your payment there.');
          
        } else {
          throw new Error('No payment URL received from Coinbase');
        }
      }
    } catch (error) {
      setError(error.message || 'Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBankTransfer = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    setError('');

    try {
      const orderResult = await createBankTransferOrder(user.apiKey, {
        planId: selectedPlan.id,
        quota: selectedPlan.quota,
        priceUSD: selectedPlan.priceUSD,
        priceLKR: selectedPlan.priceLKR
      });

      if (orderResult.success) {
        setOrderCreated(orderResult.data);
        setShowBankDetails(true);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccessMessage('Copied to clipboard!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleHistoryClick = () => {
    setShowPaymentHistory(true);
  };

  const handleHistoryClose = () => {
    setShowPaymentHistory(false);
  };

  // Load payment history when modal opens
  useEffect(() => {
    if (isOpen && user?.apiKey) {
      fetchPaymentHistory();
    }
  }, [isOpen, user?.apiKey]);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowPaymentHistory(false);
      setError('');
      setSuccessMessage('');
      setShowBankDetails(false);
      setOrderCreated(null);
      setSelectedPlan(null);
      setCustomQuota('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto scrollbar-hide">
          {/* Header with History Button */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">Purchase Additional Quota</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleHistoryClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>History</span>
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!showBankDetails ? (
            <>
              {/* Current Usage */}
              <div className="p-6 border-b border-white/10">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Current Account Status</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-white/60">Remaining Quota</p>
                      <p className="text-white font-bold text-lg">{userStats.remainingQuota}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Total Quota</p>
                      <p className="text-white font-bold text-lg">{userStats.requestQuota}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Usage Today</p>
                      <p className="text-white font-bold text-lg">{userStats.todayUsage.total}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Plans */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Choose Your Plan</h3>
                
                {/* Predefined Plans */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {PRICING_PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => handlePlanSelect(plan)}
                      className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                        selectedPlan?.id === plan.id
                          ? 'border-blue-500 bg-blue-500/10 scale-105'
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                      } ${plan.popular ? 'ring-2 ring-purple-500/50' : ''}`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className={`w-12 h-12 rounded-lg bg-${plan.color}-500/20 flex items-center justify-center mb-4 text-${plan.color}-400`}>
                          {plan.id === 'starter' && <Zap className="w-6 h-6" />}
                          {plan.id === 'pro' && <Star className="w-6 h-6" />}
                          {plan.id === 'enterprise' && <Crown className="w-6 h-6" />}
                        </div>
                        
                        <h4 className="text-lg font-semibold text-white mb-2">{plan.name}</h4>
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-white">${plan.priceUSD}</span>
                          <span className="text-white/60 ml-1">({plan.priceLKR} LKR)</span>
                        </div>
                        
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-white/80">
                              <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        
                        <div className="text-center">
                          <span className={`text-2xl font-bold text-${plan.color}-400`}>
                            +{plan.quota} Credits
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom Quota */}
                <div className="bg-white/5 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Custom Quota (1000+ credits)</h4>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      placeholder="Enter quota amount (minimum 1001)"
                      value={customQuota}
                      onChange={(e) => handleCustomQuotaChange(e.target.value)}
                      min="1001"
                      className="flex-1 p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none"
                    />
                    <div className="text-white/60 text-sm">
                      Rate: $0.01 per credit
                    </div>
                  </div>
                  {customQuota && parseInt(customQuota) > 1000 && selectedPlan?.id === 'custom' && (
                    <div className="mt-4 p-4 bg-green-500/20 rounded-lg">
                      <p className="text-green-200">
                        <strong>{selectedPlan.quota} credits</strong> for <strong>${selectedPlan.priceUSD}</strong> ({selectedPlan.priceLKR} LKR)
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Method Selection */}
                {selectedPlan && (
                  <div className="bg-white/5 rounded-lg p-6 mb-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Payment Method</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <button
                        onClick={() => setPaymentMethod('coinbase')}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          paymentMethod === 'coinbase'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Bitcoin className="w-6 h-6 text-orange-400" />
                          <div className="text-left">
                            <p className="text-white font-medium">Cryptocurrency</p>
                            <p className="text-white/60 text-sm">Instant confirmation via Coinbase</p>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setPaymentMethod('bank_transfer')}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          paymentMethod === 'bank_transfer'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Building className="w-6 h-6 text-green-400" />
                          <div className="text-left">
                            <p className="text-white font-medium">Bank Transfer</p>
                            <p className="text-white/60 text-sm">Manual verification (12 hours)</p>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white/10 rounded-lg p-4 mb-6">
                      <h5 className="text-white font-medium mb-3">Order Summary</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-white/80">
                          <span>{selectedPlan.name}</span>
                          <span>+{selectedPlan.quota} credits</span>
                        </div>
                        <div className="flex justify-between text-white/80">
                          <span>Price (USD)</span>
                          <span>${selectedPlan.priceUSD}</span>
                        </div>
                        <div className="flex justify-between text-white/80">
                          <span>Price (LKR)</span>
                          <span>{selectedPlan.priceLKR} LKR</span>
                        </div>
                        <div className="border-t border-white/20 pt-2 flex justify-between text-white font-semibold">
                          <span>Total</span>
                          <span>${selectedPlan.priceUSD} ({selectedPlan.priceLKR} LKR)</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Messages */}
                    {pollingOrderId && (
                      <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                          <p className="text-blue-200">Waiting for payment confirmation...</p>
                        </div>
                        <p className="text-blue-200/80 text-sm mt-2">
                          Complete your payment in the Coinbase window. This will update automatically.
                        </p>
                      </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
                        <p className="text-green-200">{successMessage}</p>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
                        <p className="text-red-200">{error}</p>
                      </div>
                    )}

                    {/* Purchase Button */}
                    <button
                      onClick={paymentMethod === 'coinbase' ? handleCoinbasePayment : handleBankTransfer}
                      disabled={loading || pollingOrderId}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : pollingOrderId ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Waiting for Payment...</span>
                        </>
                      ) : (
                        <>
                          {paymentMethod === 'coinbase' ? <Bitcoin className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                          <span>
                            {paymentMethod === 'coinbase' ? 'Pay with Crypto' : 'Pay via Bank Transfer'} - 
                            ${selectedPlan.priceUSD}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Bank Transfer Details */
            <div className="p-6">
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-blue-400" />
                  <h4 className="text-blue-400 font-medium">Payment Instructions</h4>
                </div>
                <p className="text-blue-200 text-sm">
                  Please transfer the exact amount to the bank account below and include your account email or phone number in the reference/remark section.
                </p>
              </div>

              {/* Order Details */}
              <div className="bg-white/5 rounded-lg p-6 mb-6">
                <h4 className="text-white font-medium mb-4">Order Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/60">Order ID</p>
                    <p className="text-white font-mono">{orderCreated?.orderId}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Amount</p>
                    <p className="text-white font-bold">{selectedPlan.priceLKR} LKR (${selectedPlan.priceUSD})</p>
                  </div>
                  <div>
                    <p className="text-white/60">Credits</p>
                    <p className="text-white">{selectedPlan.quota} credits</p>
                  </div>
                  <div>
                    <p className="text-white/60">Status</p>
                    <p className="text-yellow-400">Pending Verification</p>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-white/5 rounded-lg p-6 mb-6">
                <h4 className="text-white font-medium mb-4">Bank Transfer Details</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white/60 text-sm">Bank Name</p>
                      <p className="text-white">{bankDetails.bankName}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails.bankName)}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-white/60" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white/60 text-sm">Account Name</p>
                      <p className="text-white">{bankDetails.accountName}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails.accountName)}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-white/60" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white/60 text-sm">Account Number</p>
                      <p className="text-white font-mono">{bankDetails.accountNumber}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails.accountNumber)}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-white/60" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white/60 text-sm">Branch</p>
                      <p className="text-white">{bankDetails.branch}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails.branch)}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-white/60" />
                    </button>
                  </div>

                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                    <p className="text-yellow-200 font-medium mb-2">Important: Reference/Remark</p>
                    <div className="flex justify-between items-center">
                      <p className="text-yellow-100 font-mono">{user.email || user.phone || user.name}</p>
                      <button
                        onClick={() => copyToClipboard(user.email || user.phone || user.name)}
                        className="p-2 bg-yellow-500/20 rounded-lg hover:bg-yellow-500/30 transition-colors"
                      >
                        <Copy className="w-4 h-4 text-yellow-200" />
                      </button>
                    </div>
                    <p className="text-yellow-200 text-sm mt-2">
                      Please include this in the reference/remark section of your bank transfer.
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 text-center">
                <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-green-400 font-medium mb-2">Payment Order Created Successfully!</h4>
                <p className="text-green-200 mb-4">
                  Your quota will be activated within 12 hours after we receive your payment.
                </p>
                <p className="text-green-200 text-sm mb-4">
                  You will receive a confirmation email/SMS once your payment is processed.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Close
                  </button>
                  <a 
                    href={`https://wa.me/94763741826?text=Hello,%20I%20need%20support%20with%20msglyAPI.%20My%20account%20details:%20${user.phone ? `Phone: ${user.phone}` : user.email ? `Email: ${user.email}` : `Name: ${user.name || 'Not provided'}`}%20Order%20ID:%20${orderCreated?.orderId || 'N/A'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Contact Us</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment History Modal */}
      {showPaymentHistory && (
        <PaymentHistoryModal
          isOpen={showPaymentHistory}
          onClose={handleHistoryClose}
          history={paymentHistory}
          loading={historyLoading}
          onRefresh={fetchPaymentHistory}
        />
      )}
    </>
  );
};

export default PaymentModal;