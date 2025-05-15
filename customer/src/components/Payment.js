import { QRCodeCanvas } from 'qrcode.react';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSpinner,
  FaCreditCard,
  FaMoneyBillWave,
  FaArrowLeft,
  FaShieldAlt,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck
} from "react-icons/fa";
import axios from "axios";

const Payment = ({ 
  cart, 
  shippingInfo, 
  deliveryMethod, 
  user, 
  totalPrice, 
  handleBackClick, 
  onSuccessfulPayment
}) => {
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({
    status: "initial",
    message: "",
  });
  const [showQR, setShowQR] = useState(false); // New state for QR code
  const buttonTapVariants = { tap: { scale: 0.95 } };

  // Razorpay check
  const checkRazorpayReady = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
      } else {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
        document.body.appendChild(script);
      }
    });
  };
  console.log("💥 Cart before sending:", cart);
  console.log("💥 First item:", cart[0]);  
  // Handle Payment Submission
  const handlePaymentSubmit = async (e) => {
  e.preventDefault();
  setIsProcessingPayment(true);
  setPaymentStatus({ status: "processing", message: "Processing your payment..." });

  const userEmail = user?.email || shippingInfo.email;
  console.log("🛒 Cart passed to Payment.js:", cart);

  const orderData = {
    userId: user ? user._id || user.id : null,
    userName: user ? user.name : shippingInfo.fullName,
    userEmail,
    orderItems: cart.map((item) => ({
      productId: item.productId, // Added for stock validation
      name: item.name,
      mrp: item.mrp,
      discountedPrice: item.discountedPrice,
      quantity: item.quantity,
      image: item.image,
    })),
    shippingInfo: {
      ...shippingInfo,
      email: userEmail,
    },
    deliveryMethod,
    paymentMethod,
    paymentResult: paymentMethod === "upi" ? { status: "pending" } : undefined,
    subtotal: totalPrice,
    deliveryPrice: deliveryMethod === "express" ? 100 : 0,
    totalPrice: totalPrice + (deliveryMethod === "express" ? 100 : 0),
    orderReference: `ORD-${Math.floor(Math.random() * 1000000)}`,
    notes: paymentMethod === "upi" ? "Awaiting UPI payment confirmation" : "",
  };

  console.log("Order data:", JSON.stringify(orderData, null, 2));

  const token = localStorage.getItem("token"); // For auth, if required

  if (paymentMethod === "cod" || paymentMethod === "upi") {
    try {
      const response = await axios.post("http://localhost:5008/api/orders", orderData, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.data || !response.data.order) {
        throw new Error("Invalid response from server");
      }

      // Clear cart for COD (not UPI, as payment is pending)
      if (paymentMethod === "cod") {
        try {
          await axios.delete(`http://localhost:5008/api/cart/${userEmail}`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
        } catch (cartError) {
          console.error("Failed to clear cart:", cartError);
        }
      }

      setIsProcessingPayment(false);
      setPaymentStatus({
        status: "success",
        message: paymentMethod === "upi" ? "Order placed! Please complete UPI payment." : "Order placed successfully!",
      });
      setTimeout(() => onSuccessfulPayment(response.data.order, paymentMethod), 1000);
    } catch (error) {
      console.error("Error saving order:", error);
      let errorMessage = paymentMethod === "upi" ? "UPI order processing failed" : "Order processing failed";

      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }

      setIsProcessingPayment(false);
      setPaymentStatus({
        status: "error",
        message: errorMessage,
      });
    }
    return;
  }

  // For Razorpay
  try {
    await checkRazorpayReady();
    const amount = totalPrice * 100;
    const options = {
      key: "rzp_test_mUZPelBGqqVPrG",
      amount,
      currency: "INR",
      name: "Fancy Store",
      description: "Complete Your Order",
      image: "/logo.png",
      handler: async function (response) {
        const paymentResult = {
          id: response.razorpay_payment_id,
          status: "success",
          update_time: new Date().toISOString(),
          email_address: user ? user.email : shippingInfo.email,
        };
        orderData.paymentResult = paymentResult;
        try {
          const orderResponse = await axios.post("http://localhost:5008/api/orders", orderData, {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          if (!orderResponse.data || !orderResponse.data.order) {
            throw new Error("Invalid response from server");
          }

          // Clear cart for Razorpay
          try {
            await axios.delete(`http://localhost:5008/api/cart/${userEmail}`, {
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            });
          } catch (cartError) {
            console.error("Failed to clear cart:", cartError);
          }

          setIsProcessingPayment(false);
          setPaymentStatus({ status: "success", message: "Payment successful!" });
          setTimeout(() => onSuccessfulPayment(orderResponse.data.order, paymentMethod), 1000);
        } catch (error) {
          console.error("Error saving order:", error);
          let errorMessage = "Payment succeeded but order processing failed";

          if (error.response) {
            errorMessage += `: ${error.response.data?.message || error.response.status}`;
          } else if (error.request) {
            errorMessage = "Payment succeeded but no response from server. Contact support.";
          } else {
            errorMessage += `: ${error.message}`;
          }

          setIsProcessingPayment(false);
          setPaymentStatus({
            status: "error",
            message: errorMessage,
          });
        }
      },
      prefill: {
        name: shippingInfo.fullName || "Customer Name",
        email: userEmail,
        contact: "9842785156",
      },
      theme: { color: "#3399cc" },
      modal: {
        ondismiss: () => {
          setIsProcessingPayment(false);
          setPaymentStatus({ status: "error", message: "Payment canceled" });
        },
      },
    };
    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", (response) => {
      setIsProcessingPayment(false);
      setPaymentStatus({
        status: "error",
        message: response.error.description || "Payment failed",
      });
    });
    razorpay.open();
  } catch (error) {
    setIsProcessingPayment(false);
    setPaymentStatus({ status: "error", message: "Payment system unavailable" });
    console.error("Razorpay initialization error:", error);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white p-6 md:p-8 rounded-lg shadow-lg mt-6 border border-gray-100"
    >
      {/* Payment Processing Overlay */}
      <AnimatePresence>
        {isProcessingPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we process your payment...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center space-x-3">
          <FaCreditCard className="text-yellow-600" /> <span>Payment</span>
        </h2>
        <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm">
          <FaShieldAlt className="mr-2" />
          <span>Secure Checkout</span>
        </div>
      </div>
      
      {/* Error/Success message */}
      <AnimatePresence>
        {paymentStatus.status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start"
          >
            <FaTimesCircle className="mr-3 mt-1 flex-shrink-0 text-red-500" />
            <p>{paymentStatus.message}</p>
          </motion.div>
        )}
        {paymentStatus.status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-start"
          >
            <FaCheckCircle className="mr-3 mt-1 flex-shrink-0 text-green-500" />
            <p>{paymentStatus.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Order Summary */}
      <div className="mb-8">
        <h3 className="font-semibold text-lg mb-3 flex items-center">
          <span className="bg-gray-200 text-gray-700 w-6 h-6 inline-flex items-center justify-center rounded-full mr-2 text-sm">1</span>
          Order Summary
        </h3>
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <div className="max-h-56 overflow-y-auto mb-3 pr-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                <div className="flex items-center">
                  {item.image && (
                    <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden mr-3 flex-shrink-0">
                      <img
    src={
      item.image && typeof item.image === "string" && item.image.length > 0
        ? item.image.startsWith("data:image")
          ? item.image
          : `data:image/jpeg;base64,${item.image}`
        : "/placeholder.svg"
    }
    alt={item.name || "Product"}
    className="w-20 h-20 object-cover"
    onError={(e) => console.error("Image failed to load for productId:", item.productId, "Src:", e.target.src)}
  />         </div>
                  )}
                  <span className="font-medium">
                    {item.name} <span className="text-gray-500">× {item.quantity}</span>
                  </span>
                </div>
                <span className="font-medium">₹{(item.discountedPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 space-y-2 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 flex items-center">
                <FaTruck className="mr-1 text-blue-500" />
                Delivery ({deliveryMethod === "express" ? "Express" : "Standard"})
              </span>
              <span className={deliveryMethod === "express" ? "text-black" : "text-green-600 font-medium"}>
                {deliveryMethod === "express" ? "₹100.00" : "Free"}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-gray-300">
              <span>Total</span>
              <span className="text-blue-700">₹{(totalPrice + (deliveryMethod === "express" ? 100 : 0)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Method Selection */}
      <div className="mb-8">
        <h3 className="font-semibold text-lg mb-3 flex items-center">
          <span className="bg-gray-200 text-gray-700 w-6 h-6 inline-flex items-center justify-center rounded-full mr-2 text-sm">2</span>
          Select Payment Method
        </h3>
        <div className="space-y-4">

          <motion.div
            className={`border rounded-lg p-5 flex items-start space-x-3 cursor-pointer transition-all duration-300 ${
              paymentMethod === "razorpay" 
                ? "bg-blue-50 border-blue-300 shadow-sm" 
                : "border-gray-200 hover:bg-gray-50"
            }`}
            whileHover={{ scale: 1.01 }}
            onClick={() => setPaymentMethod("razorpay")}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === "razorpay"}
              onChange={() => setPaymentMethod("razorpay")}
              className="form-radio h-5 w-5 text-blue-600 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <FaCreditCard className="text-blue-500 text-xl mr-2" />
                <p className="font-medium text-lg">Razorpay</p>
                <div className="relative ml-2 group">
                  <FaInfoCircle className="text-gray-400 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded p-2 hidden group-hover:block z-10">
                    Secure payment via Razorpay. We accept Credit/Debit Cards, UPI, NetBanking, and Wallets.
                    <div className="absolute left-0 top-full w-3 h-3 -mt-1 ml-1 transform rotate-45 bg-gray-800"></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Credit/Debit Cards, UPI, Wallets</p>
              <div className="flex mt-2 space-x-2">
                <img src="/visa.svg" alt="Visa" className="h-6" />
                <img src="/mastercard.svg" alt="Mastercard" className="h-6" />
                <img src="/rupay.svg" alt="RuPay" className="h-6" />
                <img src="/upi.svg" alt="UPI" className="h-6" />
              </div>
            </div>
            {paymentMethod === "razorpay" && (
              <FaCheckCircle className="text-blue-500 text-xl" />
            )}
          </motion.div>
          
          <motion.div
            className={`border rounded-lg p-5 flex items-start space-x-3 cursor-pointer transition-all duration-300 ${
              paymentMethod === "cod" 
                ? "bg-blue-50 border-blue-300 shadow-sm" 
                : "border-gray-200 hover:bg-gray-50"
            }`}
            whileHover={{ scale: 1.01 }}
            onClick={() => setPaymentMethod("cod")}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
              className="form-radio h-5 w-5 text-blue-600 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <FaMoneyBillWave className="text-green-500 text-xl mr-2" />
                <p className="font-medium text-lg">Cash on Delivery</p>
                <div className="relative ml-2 group">
                  <FaInfoCircle className="text-gray-400 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded p-2 hidden group-hover:block z-10">
                    Pay when your order is delivered. Available for all addresses within delivery range.
                    <div className="absolute left-0 top-full w-3 h-3 -mt-1 ml-1 transform rotate-45 bg-gray-800"></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Pay when you receive your order</p>
            </div>
            {paymentMethod === "cod" && (
              <FaCheckCircle className="text-blue-500 text-xl" />
            )}
          </motion.div>
          <motion.div
  className={`border rounded-lg p-5 flex items-start space-x-3 cursor-pointer transition-all duration-300 ${
    paymentMethod === "upi" 
      ? "bg-blue-50 border-blue-300 shadow-sm" 
      : "border-gray-200 hover:bg-gray-50"
  }`}
  whileHover={{ scale: 1.01 }}
  onClick={() => {
    setPaymentMethod("upi");
    setShowQR(true);
  }}
>
  <input
    type="radio"
    name="paymentMethod"
    checked={paymentMethod === "upi"}
    onChange={() => {
      setPaymentMethod("upi");
      setShowQR(true);
    }}
    className="form-radio h-5 w-5 text-blue-600 mt-1"
  />
  <div className="flex-1">
    <div className="flex items-center mb-1">
      <img src="/upi.svg" alt="UPI" className="h-6 mr-2" />
      <p className="font-medium text-lg">UPI Payment</p>
      <div className="relative ml-2 group">
        <FaInfoCircle className="text-gray-400 cursor-help" />
        <div className="absolute left-0 bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded p-2 hidden group-hover:block z-10">
          Scan the QR code with any UPI app to pay instantly.
          <div className="absolute left-0 top-full w-3 h-3 -mt-1 ml-1 transform rotate-45 bg-gray-800"></div>
        </div>
      </div>
    </div>
    <p className="text-sm text-gray-600">Pay instantly via UPI apps like Google Pay, PhonePe, or Paytm</p>
  </div>
  {paymentMethod === "upi" && (
    <FaCheckCircle className="text-blue-500 text-xl" />
  )}
</motion.div>

{showQR && paymentMethod === "upi" && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="mt-4 p-5 bg-gray-50 rounded-lg border border-gray-200 text-center"
  >
    <h3 className="font-semibold text-lg mb-3">Scan to Pay</h3>
    <QRCodeCanvas
      value={`upi://pay?pa=muttukumarsamy@okhdfcbank&pn=Balaguruva%20Chettiar%20Sons%20Co&am=${totalPrice + (deliveryMethod === "express" ? 100 : 0)}&cu=INR`}
      size={200}
      className="mx-auto mb-4"
    />
    <p className="text-sm text-gray-600 mb-2">UPI ID: muttukumarsamy@okhdfcbank</p>
    <p className="text-sm text-gray-500">After payment, click below to confirm.</p>
  </motion.div>
)}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
        <motion.button
          variants={buttonTapVariants}
          whileHover={{ scale: 1.03 }}
          whileTap="tap"
          onClick={handleBackClick}
          disabled={isProcessingPayment}
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 sm:w-auto w-full"
        >
          <FaArrowLeft className="text-sm" />
          <span>Back to Shipping</span>
        </motion.button>
        
        <motion.button
          variants={buttonTapVariants}
          whileHover={{ scale: 1.03 }}
          whileTap="tap"
          onClick={handlePaymentSubmit}
          disabled={isProcessingPayment}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-3 sm:w-auto w-full"
        >
          {isProcessingPayment ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              {paymentMethod === "razorpay" ? <FaCreditCard /> : <FaMoneyBillWave />}
              <span>
                {paymentMethod === "razorpay" ? "Pay Now" : "Place Order"} ₹
                {(totalPrice + (deliveryMethod === "express" ? 100 : 0)).toFixed(2)}
              </span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Payment;
