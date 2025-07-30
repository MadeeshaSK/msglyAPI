// src/components/PaymentModal.js

import React, { useState } from 'react';
import { X, CreditCard, Check, Zap, Star, Crown, Bitcoin, Building, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { PRICING_PLANS, calculateCustomPrice, createPaymentOrder, processCoinbasePayment, createBankTransferOrder, createCoinbasePayment } from '../services/paymentService';

const PaymentModal = ({ isOpen, onClose, userStats, onSuccess, user }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customQuota, setCustomQuota] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('coinbase');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);

  // Bank details 
  const bankDetails = {
    bankName: "Bank of Ceylon",
    accountName: "Your Business Name",
    accountNumber: "1234567890",
    branch: "Colombo Main Branch",
    swiftCode: "BCEYLKLX"
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

  const handleCoinbasePayment = async () => {
    if (!selectedPlan) return;
  
    setLoading(true);
    setError('');
  
    try {
      // Create Coinbase payment with charge
      const paymentResult = await createCoinbasePayment(user.apiKey, {
        planId: selectedPlan.id,
        quota: selectedPlan.quota,
        priceUSD: selectedPlan.priceUSD,
        priceLKR: selectedPlan.priceLKR
      });
  
      if (paymentResult.success) {
        const { hostedUrl } = paymentResult.data;
        
        // Redirect to Coinbase hosted payment page
        if (hostedUrl) {
          window.open(hostedUrl, '_blank');
          
          // Show a message that payment is processing
          setSuccessMessage('Redirected to Coinbase payment. Your quota will be activated automatically after payment confirmation.');
          onClose();
        } else {
          throw new Error('No payment URL received from Coinbase');
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBankTransfer = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    setError('');

    try {
      // Create bank transfer order
      const orderResult = await createBankTransferOrder(user.apiKey, {
        planId: selectedPlan.id,
        quota: selectedPlan.quota,
        priceUSD: selectedPlan.priceUSD,
        priceLKR: selectedPlan.priceLKR,
        paymentMethod: 'bank_transfer'
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Purchase Additional Quota</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                      <p className="text-red-200 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Purchase Button */}
                  <button
                    onClick={paymentMethod === 'coinbase' ? handleCoinbasePayment : handleBankTransfer}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
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
                  <p className="text-yellow-400">Pending Payment</p>
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
                  href="/?tab=contact"
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
  );
};

export default PaymentModal;