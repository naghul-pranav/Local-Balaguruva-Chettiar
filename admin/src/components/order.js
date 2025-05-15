import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaSpinner,
  FaExclamationTriangle,
  FaEdit,
  FaTimes,
  FaEye,
  FaShoppingBag,
  FaBoxOpen,
  FaTruck,
  FaCheckCircle,
  FaBan,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaUser,
  FaChartLine,
  FaCalendarAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaDollarSign,
  FaHistory,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import axios from "axios";
import Navbar from "./Navbar";
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

// Customer Profile Component
const CustomerProfile = ({ customer }) => {
  if (!customer) return null;
  
  // Calculate days since last login
  const daysSinceLastLogin = customer.lastLogin ? 
    Math.floor((new Date() - new Date(customer.lastLogin)) / (1000 * 60 * 60 * 24)) : 'N/A';
  
  // Calculate account age in days
  const accountAge = customer.createdAt ? 
    Math.floor((new Date() - new Date(customer.createdAt)) / (1000 * 60 * 60 * 24)) : 'N/A';
  
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-5">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <FaUser className="mr-2 text-indigo-500" /> Customer Profile
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="flex items-center text-sm">
            <span className="font-medium mr-2">Name:</span> {customer.name}
          </p>
          <p className="flex items-center text-sm">
            <FaEnvelope className="mr-2 text-indigo-500" /> {customer.email}
          </p>
          <p className="flex items-center text-sm">
            <FaPhoneAlt className="mr-2 text-indigo-500" /> {customer.phone || 'N/A'}
          </p>
          <p className="flex items-center text-sm">
            <FaCalendarAlt className="mr-2 text-indigo-500" /> Account age: {accountAge} days
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="flex items-center text-sm">
            <FaHistory className="mr-2 text-indigo-500" /> Last login: {daysSinceLastLogin} days ago
          </p>
          <p className="flex items-center text-sm">
            <span className="font-medium mr-2">Orders:</span> {customer.orderHistory?.length || 0} total orders
          </p>
          <div className="flex items-center text-sm">
            <span className="font-medium mr-2">Preferences:</span>
            <div className="flex space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs ${customer.preferences?.darkMode ? 'bg-gradient-to-r from-purple-200 to-purple-300 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                {customer.preferences?.darkMode ? 'Dark mode' : 'Light mode'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${customer.preferences?.notifications ? 'bg-gradient-to-r from-green-200 to-green-300 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {customer.preferences?.notifications ? 'Notifications on' : 'Notifications off'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
        <p className="text-sm font-medium mb-1">Shipping Address:</p>
        <p className="text-sm text-gray-600 whitespace-pre-line">{customer.address || 'No address on file'}</p>
      </div>
    </div>
  );
};

// Analytics Dashboard Component
const AnalyticsDashboard = ({ orders }) => {
  // Process order data for charts
  const processChartData = () => {
    // Get last 7 days
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    // Count orders by day
    const ordersByDay = last7Days.map(day => {
      return orders.filter(order => 
        new Date(order.createdAt).toISOString().split('T')[0] === day
      ).length;
    });
    
    // Count orders by status
    const statusCounts = {};
    orders.forEach(order => {
      statusCounts[order.orderStatus] = (statusCounts[order.orderStatus] || 0) + 1;
    });
    
    // Calculate revenue by day
    const revenueByDay = last7Days.map(day => {
      return orders
        .filter(order => 
          new Date(order.createdAt).toISOString().split('T')[0] === day &&
          order.orderStatus !== "cancelled"
        )
        .reduce((total, order) => total + order.totalPrice, 0);
    });
        
    return {
      ordersByDay: {
        labels: last7Days.map(day => day.slice(5)), // MM-DD format
        datasets: [{
          label: 'Orders',
          data: ordersByDay,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        }]
      },
      ordersByStatus: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: [
            'rgba(245, 158, 11, 0.7)', // processing
            'rgba(59, 130, 246, 0.7)', // shipped
            'rgba(16, 185, 129, 0.7)', // delivered
            'rgba(239, 68, 68, 0.7)'   // cancelled
          ],
          borderWidth: 1
        }]
      },
      revenueByDay: {
        labels: last7Days.map(day => day.slice(5)), // MM-DD format
        datasets: [{
          label: 'Revenue (₹)',
          data: revenueByDay,
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
          fill: false,
          tension: 0.1
        }]
      }
    };
  };
  
  const chartData = processChartData();
  
  // Calculate key metrics
  const totalOrders = orders.length;
  const totalRevenue = orders
  .filter(order => order.orderStatus !== "cancelled")
  .reduce((sum, order) => sum + order.totalPrice, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const processingOrders = orders.filter(order => order.orderStatus === 'processing').length;
  
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3 sm:p-5 mb-6">
      <h3 className="text-lg font-semibold mb-5 flex items-center">
        <FaChartLine className="mr-2 text-indigo-500" /> Order Analytics Dashboard
      </h3>
      
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 shadow-sm transition-transform hover:scale-105 duration-300">
          <p className="text-xs text-blue-600 font-medium">TOTAL ORDERS</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-700">{totalOrders}</p>
          <p className="text-xs text-blue-600 mt-1">All time</p>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 sm:p-4 shadow-sm transition-transform hover:scale-105 duration-300">
          <p className="text-xs text-emerald-600 font-medium">TOTAL REVENUE</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700">₹{totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-emerald-600 mt-1">All time</p>
        </div>
        
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-3 sm:p-4 shadow-sm transition-transform hover:scale-105 duration-300">
          <p className="text-xs text-violet-600 font-medium">AVG ORDER VALUE</p>
          <p className="text-xl sm:text-2xl font-bold text-violet-700">₹{averageOrderValue.toFixed(2)}</p>
          <p className="text-xs text-violet-600 mt-1">Per order</p>
        </div>
        
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 sm:p-4 shadow-sm transition-transform hover:scale-105 duration-300">
          <p className="text-xs text-amber-600 font-medium">PROCESSING</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-700">{processingOrders}</p>
          <p className="text-xs text-amber-600 mt-1">Pending orders</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Orders (Last 7 Days)</h4>
          <div className="h-52 sm:h-64 bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 rounded-lg shadow-sm">
            <Bar data={chartData.ordersByDay} options={{ 
              maintainAspectRatio: false, 
              plugins: { legend: { display: false } },
              responsive: true,
              scales: {
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                      size: 10
                    }
                  }
                }
              }
            }} />
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Revenue Trend (Last 7 Days)</h4>
          <div className="h-52 sm:h-64 bg-gradient-to-br from-gray-50 to-green-50 p-3 sm:p-4 rounded-lg shadow-sm">
            <Line data={chartData.revenueByDay} options={{ 
              maintainAspectRatio: false, 
              plugins: { legend: { display: false } },
              responsive: true,
              scales: {
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                      size: 10
                    }
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-1">
          <h4 className="text-sm font-medium mb-2">Orders by Status</h4>
          <div className="h-52 sm:h-64 bg-gradient-to-br from-gray-50 to-purple-50 p-3 sm:p-4 rounded-lg shadow-sm flex items-center justify-center">
            <Doughnut 
              data={chartData.ordersByStatus} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { 
                    position: window.innerWidth < 768 ? 'bottom' : 'right', 
                    labels: { 
                      boxWidth: 12, 
                      font: { 
                        size: 10 
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
        
        <div className="md:col-span-2">
          <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 rounded-lg shadow-sm h-52 sm:h-64 overflow-auto">
            <div className="space-y-2">
              {orders.flatMap((order) =>
  Array.isArray(order.statusHistory)
    ? order.statusHistory.map((entry, i) => (
        <div key={`${order._id}-${i}`} className="flex items-center p-2 sm:p-3 rounded-lg hover:bg-white transition-colors duration-200 border border-transparent hover:border-gray-200 shadow-sm">
          <div className={`w-3 h-3 sm:w-2 sm:h-2 rounded-full mr-2 ${
            entry.status === 'delivered' ? 'bg-gradient-to-r from-green-400 to-green-500' : 
            entry.status === 'processing' ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 
            entry.status === 'shipped' ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gradient-to-r from-red-400 to-red-500'
          }`}></div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{order.orderReference}</p>
            <p className="text-xs text-gray-500 truncate">{new Date(entry.timestamp).toLocaleString()}</p>
          </div>

          <div className="text-right">
            <p className="text-xs font-medium">₹{order.totalPrice.toFixed(2)}</p>
            <p className="text-xs capitalize">{entry.status}</p>
          </div>  
        </div>
      ))
    : [] // 👈 If no statusHistory, return empty
).reverse().slice(0, 5)
}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced OrderDetailsModal component
// Enhanced OrderDetailsModal component
const OrderDetailsModal = ({ order, onClose, onStatusChange, statusOptions, getStatusBadgeStyle, formatDate, customers }) => {
  const [localStatus, setLocalStatus] = useState(order?.orderStatus || "processing");
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // Find customer data if available
  const customer = customers?.find(c => c.email === order?.userEmail) || null;
  
  // When order changes (especially when modal opens), update localStatus
  useEffect(() => {
    if (order) {
      setLocalStatus(order.orderStatus);
    }
  }, [order]);
  
  if (!order) return null;
  
  const handleStatusUpdate = async () => {
    if (localStatus === order.orderStatus) return;
    
    setUpdating(true);
    try {
      await onStatusChange(order._id, localStatus);
      // Status will be updated in parent component's state
    } catch (error) {
      console.error("Failed to update from modal:", error);
      setLocalStatus(order.orderStatus); // Reset on error
    } finally {
      setUpdating(false);
    }
  };

  // Calculate order metrics
  const itemCount = order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const daysElapsed = Math.floor((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24));

  // Helper to get display text for payment method
  const getPaymentMethodDisplay = (method) => {
    switch (method) {
      case "cod":
        return "Cash on Delivery";
      case "razorpay":
        return "Razorpay";
      case "upi":
        return "UPI";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold flex items-center text-gray-800">
            <FaShoppingBag className="mr-2 text-indigo-500" /> Order #{order.orderReference}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        
        <div className="border-b border-gray-200">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('details')}
              className={`py-2 sm:py-3 px-3 sm:px-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'details' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Order Details
            </button>
            {customer && (
              <button 
                onClick={() => setActiveTab('customer')}
                className={`py-2 sm:py-3 px-3 sm:px-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'customer' 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Customer Profile
              </button>
            )}
          </div>
        </div>
        
        <div className="p-3 sm:p-5">
          {activeTab === 'details' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 shadow-sm transition-transform hover:scale-105 duration-300">
                  <p className="text-xs text-blue-600 font-medium">ORDER ITEMS</p>
                  <p className="text-2xl font-bold text-blue-700">{itemCount}</p>
                  <p className="text-xs text-blue-600 mt-1">Total items</p>
                </div>
                
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4 shadow-sm transition-transform hover:scale-105 duration-300">
                  <p className="text-xs text-violet-600 font-medium">ORDER TOTAL</p>
                  <p className="text-2xl font-bold text-violet-700">INR {order.totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-violet-600 mt-1">Inc. INR {order.deliveryPrice?.toFixed(2) || '0.00'} delivery</p>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 shadow-sm transition-transform hover:scale-105 duration-300">
                  <p className="text-xs text-amber-600 font-medium">ORDER AGE</p>
                  <p className="text-2xl font-bold text-amber-700">{daysElapsed} days</p>
                  <p className="text-xs text-amber-600 mt-1">Since placement</p>
                </div>
              </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-5 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-medium text-gray-700 mb-3">Order Information</h4>
                  <p className="text-sm mb-2"><span className="font-semibold">Order ID:</span> {order._id}</p>
                  <p className="text-sm mb-2"><span className="font-semibold">Reference:</span> {order.orderReference}</p>
                  <p className="text-sm mb-2"><span className="font-semibold">Date:</span> {formatDate(order.createdAt)}</p>
                  <p className="text-sm mb-4"><span className="font-semibold">Last Updated:</span> {formatDate(order.updatedAt)}</p>
                  
                  <div className="mt-4">
                    <p className="text-sm mb-2"><span className="font-semibold">Current Status:</span> 
                      <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium" style={getStatusBadgeStyle(order.orderStatus)}>
                        {order.orderStatus}
                      </span>
                    </p>
                    
                    <div className="mt-3">
                      <label htmlFor="status-update" className="block text-sm font-medium text-gray-700 mb-1">
                        Update Status:
                      </label>
                      <div className="flex items-center">
                        <select 
                          id="status-update"
                          value={localStatus} 
                          onChange={(e) => setLocalStatus(e.target.value)}
                          disabled={updating}
                          className="flex-1 rounded-md border-gray-300 shadow-sm text-sm bg-white text-gray-900"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        
                        <button 
                          onClick={handleStatusUpdate} 
                          disabled={updating || localStatus === order.orderStatus}
                          className={`ml-2 px-3 py-1.5 rounded text-sm font-medium ${
                            updating || localStatus === order.orderStatus 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
                          } transition-all duration-200`}
                        >
                          {updating ? <FaSpinner className="inline animate-spin mr-1" /> : "Update"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-indigo-50 p-5 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-medium text-gray-700 mb-3">Customer Information</h4>
                  <p className="text-sm mb-2"><span className="font-semibold">Name:</span> {order.userName || "N/A"}</p>
                  <p className="text-sm mb-2"><span className="font-semibold">Email:</span> {order.userEmail || "N/A"}</p>
                  <p className="text-sm mb-1"><span className="font-semibold">Shipping Address:</span></p>
                  <div className="mt-1 p-3 bg-white rounded-md border border-gray-100 text-sm text-gray-600">
                    {order.shippingInfo && (
                      <>
                        <p>{order.shippingInfo.fullName}</p>
                        <p>{order.shippingInfo.addressLine1}</p>
                        <p>{order.shippingInfo.city}, {order.shippingInfo.postalCode}</p>
                      </>
                    )}
                  </div>
                  
                  {customer && (
                    <button
                      onClick={() => setActiveTab('customer')}
                      className="mt-4 text-sm bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 px-3 py-1.5 rounded-md flex items-center justify-center transition-colors duration-200 shadow-sm"
                    >
                      <FaUser className="mr-1" /> View full customer profile
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-5 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-medium text-gray-700 mb-3">Order Items</h4>
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.orderItems && order.orderItems.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gradient-to-r from-gray-50 to-indigo-50/20'}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.image ? (
                              <img
                                src={`data:image/png;base64,${item.image}`}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-md"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                                }}
                              />
                            ) : (
                              <img
                                src="https://via.placeholder.com/48?text=No+Image"
                                alt="No Image"
                                className="w-12 h-12 object-cover rounded-md"
                              />
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">INR {item.discountedPrice.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">INR {(item.discountedPrice * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gradient-to-r from-gray-50 to-indigo-50/30">
                        <td colSpan="4" className="px-4 py-2 text-sm font-medium text-right text-gray-700">Subtotal</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">INR {order.subtotal ? order.subtotal.toFixed(2) : "N/A"}</td>
                      </tr>
                      <tr className="bg-gradient-to-r from-gray-50 to-indigo-50/30">
                        <td colSpan="4" className="px-4 py-2 text-sm font-medium text-right text-gray-700">Delivery Fee</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">INR {order.deliveryPrice ? order.deliveryPrice.toFixed(2) : "0.00"}</td>
                      </tr>
                      <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                        <td colSpan="4" className="px-4 py-2 text-base font-bold text-right text-gray-800">Total</td>
                        <td className="px-4 py-2 text-base font-bold text-gray-900">INR {order.totalPrice.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm">
                  <span className="font-semibold">Payment Method:</span>{" "}
                  {getPaymentMethodDisplay(order.paymentMethod)}{" "}
                  <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium" style={getStatusBadgeStyle(order.paymentStatus || 'pending')}>
                    {order.paymentStatus || 'pending'}
                  </span>
                </p>
                <button 
                  onClick={onClose} 
                  className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-md text-gray-800 text-sm font-medium transition-colors shadow-sm w-full sm:w-auto"
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            // Customer Profile Tab
            <CustomerProfile customer={customer} />
          )}
        </div>
      </div>
    </div>
  );
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [editingOrder, setEditingOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const API_URL = "http://localhost:5000";

  // Fetch orders from the server
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/api/orders/admin/all`, {
        timeout: 15000,
      });

      if (!response.data || !response.data.success) {
        throw new Error("Invalid response format from server");
      }

      const formattedOrders = response.data.orders.map((order) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: order.updatedAt ? new Date(order.updatedAt) : null,
      }));

      setOrders(formattedOrders);
      
      // Also fetch customers for enhanced order details
      fetchCustomers();
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(
        error.response?.data?.message ||
          (error.code === "ECONNABORTED"
            ? "Request timed out. The server may be down."
            : error.message) ||
          "Failed to load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch customers data
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/admin/all`, {
        timeout: 10000,
      });
      
      if (response.data && response.data.success) {
        setCustomers(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      // Don't set error state here as it would override orders error
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle status update
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      console.log(`Updating order ${orderId} to status: ${newStatus}`);
      
      const response = await axios.put(
        `${API_URL}/api/orders/admin/${orderId}/status`,
        { status: newStatus },
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      console.log("Server response:", response.data);
  
      if (response.data.success) {
        const updatedOrder = response.data.order;
  
        // Update the orders state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  orderStatus: updatedOrder.orderStatus,
                  paymentStatus: updatedOrder.paymentStatus,
                  updatedAt: new Date(updatedOrder.updatedAt || Date.now()),
                }
              : order
          )
        );
  
        // Update the selected order details if it's open
        if (selectedOrderDetails && selectedOrderDetails._id === orderId) {
          setSelectedOrderDetails((prev) => ({
            ...prev,
            orderStatus: updatedOrder.orderStatus,
            paymentStatus: updatedOrder.paymentStatus,
            updatedAt: new Date(updatedOrder.updatedAt || Date.now()),
          }));
        }
  
        setEditingOrder(null); // Close the edit mode
      } else {
        throw new Error(response.data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      
      // Detailed error logging for easier debugging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      
      alert(
        error.response?.data?.message ||
          "Failed to update order status. Please try again."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle canceling edit mode
  const handleCancelEdit = () => {
    setEditingOrder(null);
  };

  // Handle viewing order details
  const handleViewOrderDetails = (order) => {
    setSelectedOrderDetails(order);
    setShowOrderDetails(true);
  };

  // Calculate order trends
  const calculateTrends = () => {
    if (orders.length < 2) return { orders: 0, revenue: 0 };
    
    // Get today and yesterday's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayOrders = orders.filter(order => 
      new Date(order.createdAt) >= today
    );
    
    const yesterdayOrders = orders.filter(order => 
      new Date(order.createdAt) >= yesterday && new Date(order.createdAt) < today
    );
    
    const todayCount = todayOrders.length;
    const yesterdayCount = yesterdayOrders.length;
    
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    // Calculate percentage changes
    const orderChange = yesterdayCount === 0 
      ? 100 // If yesterday was 0, show 100% increase
      : ((todayCount - yesterdayCount) / yesterdayCount) * 100;
      
    const revenueChange = yesterdayRevenue === 0
      ? 100 // If yesterday was 0, show 100% increase
      : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
      
    return { 
      orders: orderChange.toFixed(1),
      revenue: revenueChange.toFixed(1) 
    };
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => {
      if (statusFilter !== "all" && order.orderStatus !== statusFilter) {
        return false;
      }
      if (searchTerm.trim() !== "") {
        const searchLower = searchTerm.toLowerCase();
        return (
          order._id.toLowerCase().includes(searchLower) ||
          order.orderReference.toLowerCase().includes(searchLower) ||
          order.userName.toLowerCase().includes(searchLower) ||
          order.userEmail.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortField === "createdAt") {
        return sortDirection === "asc"
          ? a.createdAt - b.createdAt
          : b.createdAt - a.createdAt;
      }
      if (sortField === "totalPrice") {
        return sortDirection === "asc"
          ? a.totalPrice - b.totalPrice
          : b.totalPrice - a.totalPrice;
      }
      if (typeof a[sortField] === "string") {
        return sortDirection === "asc"
          ? a[sortField].localeCompare(b[sortField])
          : b[sortField].localeCompare(a[sortField]);
      }
      return 0;
    });

  // Status options for dropdown
  const statusOptions = [
    { value: "processing", label: "Processing", icon: <FaBoxOpen /> },
    { value: "shipped", label: "Shipped", icon: <FaTruck /> },
    { value: "delivered", label: "Delivered", icon: <FaCheckCircle /> },
    { value: "cancelled", label: "Cancelled", icon: <FaBan /> },
  ];

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "processing":
        return { backgroundColor: "#fef3c7", color: "#d97706" };
      case "shipped":
        return { backgroundColor: "#dbeafe", color: "#1e40af" };
      case "delivered":
        return { backgroundColor: "#d1fae5", color: "#047857" };
      case "cancelled":
        return { backgroundColor: "#fee2e2", color: "#b91c1c" };
      default:
        return { backgroundColor: "#f3f4f6", color: "#374151" };
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  // Get trend indicators
  const trends = calculateTrends();

  // Render loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen bg-white">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin animation-delay-150"></div>
              <div className="absolute inset-4 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin animation-delay-300"></div>
            </div>
            <p className="text-gray-600">Loading order data...</p>
          </div>
        </div>
      </>
    );
  }

  // Render error state
  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen bg-white">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="text-white text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={fetchOrders} 
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-md transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  // Render main content
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Orders Management</h1>
          
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2 bg-white"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center justify-center"
          >
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </button>
        </div>

        {showAnalytics && <AnalyticsDashboard orders={orders} />}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-indigo-50">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-50 transition-colors"
                    onClick={() => handleSort("orderReference")}
                  >
                    <div className="flex items-center">
                      Order ID
                      {sortField === "orderReference" && (
                        sortDirection === "asc" ? <FaSortUp className="ml-1 text-indigo-500" /> : <FaSortDown className="ml-1 text-indigo-500" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Customer</th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-50 transition-colors"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      Date
                      {sortField === "createdAt" && (
                        sortDirection === "asc" ? <FaSortUp className="ml-1 text-indigo-500" /> : <FaSortDown className="ml-1 text-indigo-500" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-50 transition-colors"
                    onClick={() => handleSort("totalPrice")}
                  >
                    <div className="flex items-center">
                      Total
                      {sortField === "totalPrice" && (
                        sortDirection === "asc" ? <FaSortUp className="ml-1 text-indigo-500" /> : <FaSortDown className="ml-1 text-indigo-500" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-50 transition-colors"
                    onClick={() => handleSort("orderStatus")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortField === "orderStatus" && (
                        sortDirection === "asc" ? <FaSortUp className="ml-1 text-indigo-500" /> : <FaSortDown className="ml-1 text-indigo-500" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50/20 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-indigo-600">{order.orderReference}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex flex-col">
                          <span>{order.userName}</span>
                          <span className="text-xs text-gray-500">{order.userEmail}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{order.totalPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">
                        {editingOrder && editingOrder._id === order._id ? (
                          <>
                            {updatingStatus ? (
                              <div className="flex items-center text-gray-700">
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div> Updating...
                              </div>
                            ) : (
                              <select
                                value={order.orderStatus}
                                onChange={(e) =>
                                  handleStatusChange(order._id, e.target.value)
                                }
                                disabled={updatingStatus}
                                className="rounded border-gray-300 py-1 text-sm bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                {statusOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </>
                        ) : (
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium shadow-sm"
                            style={{
                              background: order.orderStatus === 'processing' ? 'linear-gradient(to right, #fde68a, #fcd34d)' :
                                        order.orderStatus === 'shipped' ? 'linear-gradient(to right, #93c5fd, #60a5fa)' :
                                        order.orderStatus === 'delivered' ? 'linear-gradient(to right, #a7f3d0, #6ee7b7)' :
                                        'linear-gradient(to right, #fecaca, #f87171)',
                              color: order.orderStatus === 'processing' ? '#92400e' :
                                    order.orderStatus === 'shipped' ? '#1e3a8a' :
                                    order.orderStatus === 'delivered' ? '#065f46' :
                                    '#991b1b'
                            }}
                          >
                            {order.orderStatus}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewOrderDetails(order)}
                            className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors shadow-sm"
                            title="View Details"
                          >
                            <FaEye className="text-blue-600" />
                          </button>
                          <button 
                            onClick={() => setEditingOrder(order)}
                            className="p-1.5 rounded-full bg-green-50 hover:bg-green-100 transition-colors shadow-sm"
                            title="Edit Status"
                          >
                            <FaEdit className="text-green-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg inline-block">
                        <FaSearch className="text-2xl text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No orders found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showOrderDetails && (
          <OrderDetailsModal
            order={selectedOrderDetails}
            onClose={() => setShowOrderDetails(false)}
            onStatusChange={handleStatusChange}
            statusOptions={statusOptions}
            getStatusBadgeStyle={getStatusBadgeStyle}
            formatDate={formatDate}
            customers={customers}
          />
        )}
      </div>
    </>
  );
};

export default AdminOrdersPage;