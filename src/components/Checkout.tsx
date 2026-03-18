import React, { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle2, Maximize2, X, Copy, Check } from 'lucide-react';
import { CartItem, PaymentMethod, ServiceType } from '../types';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { useSiteSettings } from '../hooks/useSiteSettings';

import { useOrders } from '../hooks/useOrders';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
  onSuccess: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack, onSuccess }) => {
  const { siteSettings } = useSiteSettings();
  const { paymentMethods } = usePaymentMethods();
  const { createOrder } = useOrders();
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('pickup');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pickupTime, setPickupTime] = useState('5-10');
  const [customTime, setCustomTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [notes, setNotes] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Set default payment method when payment methods are loaded
  React.useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(paymentMethods[0].id as PaymentMethod);
    }
  }, [paymentMethods, paymentMethod]);

  const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentMethod);

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);

      const orderData = {
        customerName,
        contactNumber,
        serviceType,
        address: serviceType === 'delivery' ? address : undefined,
        landmark: serviceType === 'delivery' ? landmark : undefined,
        pickupTime: serviceType === 'pickup' ? (pickupTime === 'custom' ? customTime : `${pickupTime} mins`) : undefined,
        paymentMethod: selectedPaymentMethod?.name || paymentMethod,
        total: totalPrice,
        notes,
        items: cartItems
      };

      const result = await createOrder(orderData);

      if (result.success) {
        setStep('success');
      } else {
        alert('Failed to place order: ' + result.error);
      }
    } catch (error) {
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDetailsValid = customerName.trim() && contactNumber.trim() &&
    (serviceType !== 'delivery' || address.trim()) &&
    (serviceType !== 'pickup' || (pickupTime !== 'custom' || customTime.trim()));

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 animate-scale-in">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-black mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-500 mb-8">Thank you, {customerName}. Your order has been received and is being processed.</p>

          <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Total Paid</span>
              <span className="text-black font-bold">₱{totalPrice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Payment Method</span>
              <span className="text-black font-bold uppercase">{selectedPaymentMethod?.name || paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Service</span>
              <span className="text-black font-bold capitalize">{serviceType}</span>
            </div>
          </div>

          <button
            onClick={onSuccess}
            className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all shadow-lg"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (step === 'details') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-3xl font-serif font-semibold text-black ml-8">Order Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-2xl font-serif font-medium text-black mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <h4 className="font-medium text-black">{item.name}</h4>
                    {item.selectedVariation && (
                      <p className="text-sm text-gray-600">Variation: {item.selectedVariation.name}</p>
                    )}
                    {item.selectedFlavor && (
                      <p className="text-sm text-gray-600">Flavor: {item.selectedFlavor}</p>
                    )}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Add-ons: {item.selectedAddOns.map(addOn => addOn.name).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">₱{item.totalPrice} x {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-black">₱{item.totalPrice * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-2xl font-serif font-semibold text-black">
                <span>Total:</span>
                <span>₱{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-2xl font-serif font-medium text-black mb-6">Customer Information</h2>

            <form className="space-y-6">
              {/* Customer Information */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Contact Number *</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  placeholder="09XX XXX XXXX"
                  required
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-black mb-3">Service Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'pickup', label: 'Pickup', icon: '🚶' },
                    { value: 'delivery', label: 'Delivery', icon: '🛵' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setServiceType(option.value as ServiceType)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center ${serviceType === option.value
                        ? 'border-black bg-white text-black shadow-md'
                        : 'border-gray-200 bg-white text-gray-400 hover:border-black/50'
                        }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>



              {/* Pickup Time Selection */}
              {serviceType === 'pickup' && (
                <div>
                  <label className="block text-sm font-medium text-black mb-3">Pickup Time *</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: '5-10', label: '5-10 mins' },
                        { value: '15-20', label: '15-20 mins' },
                        { value: '25-30', label: '25-30 mins' },
                        { value: 'custom', label: 'Custom' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPickupTime(option.value)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm ${pickupTime === option.value
                            ? 'border-black bg-white text-black shadow-md'
                            : 'border-gray-200 bg-white text-gray-400 hover:border-black/50'
                            }`}
                        >
                          <Clock className="h-4 w-4 mx-auto mb-1" />
                          {option.label}
                        </button>
                      ))}
                    </div>

                    {pickupTime === 'custom' && (
                      <input
                        type="text"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                        placeholder="e.g., 45 minutes, 2:30 PM"
                        required
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {serviceType === 'delivery' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Delivery Address *</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                      placeholder="Enter your complete delivery address"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Landmark</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Near McDonald's"
                    />
                  </div>
                </>
              )}

              {/* Special Notes */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Special Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  placeholder="Any special requests..."
                  rows={2}
                />
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleProceedToPayment();
                }}
                disabled={!isDetailsValid}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 transform border-2 ${isDetailsValid
                  ? 'border-black bg-white text-black hover:bg-black hover:text-white active:bg-black active:text-white hover:scale-[1.02] active:scale-95 animate-pulse-subtle hover:rotate-1 shadow-lg'
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
              >
                Proceed to Payment
              </button>

              {!isDetailsValid && (
                <p className="text-xs text-red-500 mt-2 text-center">
                  {!customerName.trim() && 'Name is required. '}
                  {!contactNumber.trim() && 'Contact is required. '}
                  {serviceType === 'delivery' && !address.trim() && 'Address is required. '}
                  {serviceType === 'pickup' && pickupTime === 'custom' && !customTime.trim() && 'Time is required. '}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setStep('details');
          }}
          className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Details</span>
        </button>
        <h1 className="text-3xl font-serif font-semibold text-black ml-8">Payment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Method Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-2xl font-serif font-medium text-black mb-6">Choose Payment Method</h2>

          <div className="grid grid-cols-1 gap-4 mb-6">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${paymentMethod === method.id
                  ? 'border-black bg-white text-black shadow-md scale-[1.02]'
                  : 'border-gray-100 bg-white text-gray-400 hover:border-black/30 hover:scale-[1.01]'
                  }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-transform duration-300 ${paymentMethod === method.id ? 'bg-gray-100 scale-110' : 'bg-gray-50 group-hover:scale-110'}`}>
                    {method.id === 'cod' ? '💵' : '💳'}
                  </div>
                  <div className="text-left">
                    <span className="font-semibold block">{method.name}</span>
                    <span className="text-xs text-gray-500">
                      {method.id === 'cod' ? 'Pay when you receive' : 'Pay via digital transfer'}
                    </span>
                  </div>
                </div>
                {paymentMethod === method.id && (
                  <CheckCircle2 className="h-6 w-6 text-black animate-scale-in animate-pulse-subtle" />
                )}
              </button>
            ))}
          </div>

          {/* Payment Details with QR Code */}
          {selectedPaymentMethod && (
            <div className="bg-white rounded-xl p-6 mb-6 border-2 border-dashed border-gray-200 hover:border-black transition-colors duration-300">
              <h3 className="font-medium text-black mb-4 flex items-center">
                <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                Payment Details
              </h3>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{selectedPaymentMethod.name}</p>
                  {selectedPaymentMethod.account_number && (
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Account Number</span>
                      <p className="font-mono text-lg text-black font-bold tracking-tight">{selectedPaymentMethod.account_number}</p>
                    </div>
                  )}
                  {selectedPaymentMethod.account_name && (
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Account Name</span>
                      <p className="text-sm text-black font-medium">{selectedPaymentMethod.account_name}</p>
                    </div>
                  )}
                  <div className="pt-2">
                    <p className="text-2xl font-bold text-black">₱{totalPrice}</p>
                    <p className="text-[10px] text-gray-400">Exact amount to pay</p>
                  </div>
                </div>
                <div className="relative group self-center md:self-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowQRModal(true);
                    }}
                    className="relative block rounded-xl overflow-hidden shadow-xl border-4 border-white transition-transform duration-300 hover:scale-105"
                  >
                    <img
                      src={selectedPaymentMethod.qr_code_url}
                      alt={`${selectedPaymentMethod.name} QR Code`}
                      className="w-40 h-40 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white">
                      <Maximize2 className="h-8 w-8 mb-1" />
                      <span className="text-[10px] font-bold uppercase">Click to View</span>
                    </div>
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2 font-medium uppercase tracking-widest">Scan to Pay</p>
                </div>
              </div>

            </div>
          )}

          {/* QR Code Modal */}
          {showQRModal && selectedPaymentMethod && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowQRModal(false)}>
              <div className="relative bg-white rounded-2xl p-4 max-w-sm w-full animate-scale-in" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
                  aria-label="Close QR Modal"
                >
                  <X className="h-8 w-8" />
                </button>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-black">{selectedPaymentMethod.name}</h3>
                  <p className="text-sm text-gray-500">Scan this QR code to pay</p>
                </div>
                <img
                  src={selectedPaymentMethod.qr_code_url}
                  alt="QR Code Large"
                  className="w-full aspect-square rounded-xl shadow-inner"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                  }}
                />
                <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Account:</span>
                    <span className="font-bold text-black">{selectedPaymentMethod.account_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-bold text-black">₱{totalPrice}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="w-full mt-4 py-3 bg-black text-white rounded-xl font-bold transition-transform active:scale-95"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Payment Guidance */}
          {paymentMethod !== 'cod' ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-black mb-2">💳 Digital Payment</h4>
              <p className="text-sm text-gray-700">
                Please ensure you have completed the payment via {selectedPaymentMethod?.name || 'the selected method'} before confirming your order.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-black mb-2">💵 Cash on Delivery</h4>
              <p className="text-sm text-gray-700">
                Please prepare exact amount. You will pay when you {serviceType === 'pickup' ? 'pick up' : 'receive'} your order.
              </p>
            </div>
          )}

        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-medium text-black">Final Order Summary</h2>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-black mb-2">Customer Details</h4>
              <p className="text-sm text-gray-600">Name: {customerName}</p>
              <p className="text-sm text-gray-600">Contact: {contactNumber}</p>
              <p className="text-sm text-gray-600">Service: {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}</p>
              {serviceType === 'delivery' && (
                <>
                  <p className="text-sm text-gray-600">Address: {address}</p>
                  {landmark && <p className="text-sm text-gray-600">Landmark: {landmark}</p>}
                </>
              )}
              {serviceType === 'pickup' && (
                <p className="text-sm text-gray-600">
                  Pickup Time: {pickupTime === 'custom' ? customTime : `${pickupTime} minutes`}
                </p>
              )}

            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <h4 className="font-medium text-black">{item.name}</h4>
                  {item.selectedVariation && (
                    <p className="text-sm text-gray-600">Variation: {item.selectedVariation.name}</p>
                  )}
                  {item.selectedFlavor && (
                    <p className="text-sm text-gray-600">Flavor: {item.selectedFlavor}</p>
                  )}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Add-ons: {item.selectedAddOns.map(addOn =>
                        addOn.quantity && addOn.quantity > 1
                          ? `${addOn.name} x${addOn.quantity}`
                          : addOn.name
                      ).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">₱{item.totalPrice} x {item.quantity}</p>
                </div>
                <span className="font-semibold text-black">₱{item.totalPrice * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex items-center justify-between text-2xl font-serif font-semibold text-black">
              <span>Total:</span>
              <span>₱{totalPrice}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handlePlaceOrder();
            }}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 transform border-2 ${isSubmitting
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'border-black bg-white text-black hover:bg-black hover:text-white active:bg-black active:text-white hover:scale-[1.01] active:scale-95 shadow-md'
              }`}

          >
            {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Your order will be saved and processed by our team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

