import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaShoppingBag, FaSpinner, FaExclamationTriangle, FaBox, FaShoppingCart,
  FaCheck, FaMoneyBillWave, FaTimes, FaEye
} from "react-icons/fa";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const API_URL = "https://final-balaguruva-chettiar-ecommerce.onrender.com";

  const fetchUserOrders = async () => {
    setLoadingOrders(true);
    setOrdersError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token not found");

      const response = await axios.get(`${API_URL}/api/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const ordersData = response.data.orders || response.data;

      const formattedOrders = Array.isArray(ordersData) ? ordersData.map(order => ({
        ...order,
        createdAt: new Date(order.createdAt),
        orderItems: order.orderItems || [],
        shippingInfo: order.shippingInfo || {},
        paymentResult: order.paymentResult || {},
        subtotal: order.subtotal || 0,
        deliveryPrice: order.deliveryPrice || 0,
        totalPrice: order.totalPrice || 0,
        orderStatus: order.orderStatus || 'processing',
        paymentStatus: order.paymentStatus || 'pending'
      })) : [];

      setOrders(formattedOrders);
    } catch (error) {
      if (error.response?.status === 404 &&
          error.response?.data?.message?.includes("No orders found")) {
        setOrders([]);
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        setOrdersError("Session expired or invalid token. Please log in again.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => (window.location.href = "/login"), 3000);
      } else {
        setOrdersError(error.response?.data?.message || "Failed to load your order history.");
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[1000] p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[85vh] overflow-y-auto mt-20">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-[1010] pt-2">
            <h3 className="text-xl font-bold flex items-center">
              <FaShoppingBag className="mr-2 text-emerald-500" /> Order Details
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>

          <div className="bg-emerald-50 p-4 rounded-lg mb-4">
            <div className="flex flex-wrap justify-between">
              <div className="mb-2">
                <p className="text-sm text-gray-500">Order Reference</p>
                <p className="font-medium">{order.orderReference}</p>
              </div>
              <div className="mb-2">
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="mb-2">
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-medium">₹{order.totalPrice.toFixed(2)}</p>
              </div>
              <div className="mb-2">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.orderStatus === 'processing' ? 'bg-amber-100 text-amber-800' :
                    order.orderStatus === 'shipped' ? 'bg-emerald-100 text-emerald-800' :
                    order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.orderStatus}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Items</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.orderItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {item.image && (
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
                            />
                          )}
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">₹{item.discountedPrice.toFixed(2)}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3 font-medium">₹{(item.discountedPrice * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold mb-2">Shipping Address</h4>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p>{order.shippingInfo.fullName}</p>
                <p>{order.shippingInfo.addressLine1}</p>
                <p>{order.shippingInfo.city}, {order.shippingInfo.postalCode}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Order Summary</h4>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="flex justify-between py-1">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Delivery ({order.deliveryMethod})</span>
                  <span>{order.deliveryPrice > 0 ? `₹${order.deliveryPrice.toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="flex justify-between py-1 font-medium border-t border-gray-300 mt-2 pt-2">
                  <span>Total</span>
                  <span>₹{order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-4">
            <h4 className="font-semibold mb-2">Payment Information</h4>
            <div className="flex items-center">
              <div className={`mr-2 p-1 rounded-full ${
                order.paymentStatus === 'completed' ? 'bg-green-100' :
                order.paymentStatus === 'pending' ? 'bg-amber-100' :
                'bg-red-100'
              }`}>
                {order.paymentStatus === 'completed' ? <FaCheck className="text-green-600" /> :
                 order.paymentStatus === 'pending' ? <FaMoneyBillWave className="text-amber-600" /> :
                 <FaTimes className="text-red-600" />}
              </div>
              <div>
                <p className="font-medium capitalize">{order.paymentMethod === 'razorpay' ? 'Online Payment' :
                                                       order.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}</p>
                <p className="text-sm text-gray-500 capitalize">
                  Status: {order.paymentStatus}
                  {order.paymentResult?.id && ` (ID: ${order.paymentResult.id.substring(0, 10)}...)`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderHistory = () => (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-gradient-to-b from-white to-amber-50 p-6 rounded-xl border border-gray-200 shadow-sm mt-8"
    >
      <h3 className="font-semibold text-lg flex items-center mb-4 text-gray-700">
        <FaShoppingBag className="mr-2 text-emerald-500" /> Order History
      </h3>
      {loadingOrders ? (
        <div className="text-center py-8">
          <FaSpinner className="text-emerald-500 text-2xl animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      ) : ordersError ? (
        <div className="bg-red-50 p-4 rounded-md text-red-700 text-center">
          <FaExclamationTriangle className="mx-auto mb-2" />
          <p>{ordersError}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FaBox className="text-gray-400 text-3xl mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-2">No orders yet</p>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            You haven't placed any orders yet. Start shopping to see your order history here.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => window.location.href = "/products"}
              className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors flex items-center"
            >
              <FaShoppingCart className="mr-2" /> Shop Now
            </button>
            <button
              onClick={() => fetchUserOrders()}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors flex items-center"
            >
              <FaSpinner className={loadingOrders ? "animate-spin mr-2" : "mr-2"} /> Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{order.orderReference}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap">₹{order.totalPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.orderStatus === 'processing' ? 'bg-amber-100 text-amber-800' :
                      order.orderStatus === 'shipped' ? 'bg-emerald-100 text-emerald-800' :
                      order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      order.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => handleViewOrderDetails(order)}
                      className="text-emerald-600 hover:text-emerald-800 flex items-center"
                    >
                      <FaEye className="mr-1" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-stone-100 py-12 px-4 font-['Inter','Roboto',sans-serif]">
      {showOrderDetails && <OrderDetailsModal order={selectedOrder} onClose={() => setShowOrderDetails(false)} />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500"></div>
          <div className="p-6">
            {renderOrderHistory()}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Orders;