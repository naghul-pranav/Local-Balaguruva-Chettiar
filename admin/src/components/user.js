import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale,   
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  BarElement,
  TimeScale,
} from 'chart.js';
import { 
  Search, RefreshCw, ChevronDown, ChevronUp, Download, 
  User as UserIcon, Calendar, Tag, Mail, 
  AlertTriangle, CheckCircle, PlusCircle,
  Map, Phone, Clock, Package, Clipboard,
  UserCheck, MapPin, List, Grid, LogOut, 
  ThumbsUp, Eye,
} from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  BarElement,
  TimeScale,
);

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'deleted'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [cartItems, setCartItems] = useState([]); // State to store fetched cart items
  const [userOrders, setUserOrders] = useState([]); // State to store fetched orders
  const [signupData, setSignupData] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userStatistics, setUserStatistics] = useState({});

  const tableRef = useRef(null);
  const chartContainerRef = useRef(null);

  const API_URL = 'https://balaguruva-final-hosting.onrender.com';

  useEffect(() => {
    fetchAllData();
    if (viewMode === 'deleted') {
      fetchDeletedUsers();
    }
  }, [viewMode]);

  // Fetch cart data and orders when a user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchCartData(selectedUser.email);
      fetchUserOrders(selectedUser._id);
    } else {
      setUserOrders([]); // Reset orders when modal is closed
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/users`);
      setUsers(response.data);
      processSignupData(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      setLoading(false);
    }
  };

  const fetchDeletedUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/deleted-users`);
      if (response.data.success) {
        setDeletedUsers(response.data.users);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch deleted users');
      setLoading(false);
    }
  };

  const fetchUserAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users`);
      if (response.data) {
        const userData = response.data;
        setUserStatistics({ totalUsers: userData.length });
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      addNotification("Failed to load analytics", "error");
    }
  };

  const fetchCartData = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/carts/${userId}`);
      setCartItems(response.data.items || []);
    } catch (err) {
      console.error("Error fetching cart data:", err);
      addNotification("Failed to load cart data", "error");
      setCartItems([]);
    }
  };

  // Fetch orders for the selected user
  const fetchUserOrders = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/admin/all`);
      const orders = response.data.orders || [];
      const userSpecificOrders = orders.filter(order => 
        order.user && order.user.toString() === userId
      );
      setUserOrders(userSpecificOrders);
    } catch (err) {
      console.error("Error fetching user orders:", err);
      addNotification("Failed to load order history", "error");
      setUserOrders([]);
    }
  };

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchUserAnalytics()
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
      addNotification("Failed to load data", "error");
    }
  };

  const processSignupData = (userData) => {
  if (!userData || userData.length === 0) return;
  
  const dailySignups = {};
  const last30Days = [];
  
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dayKey = day.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    last30Days.push(dayKey);
    dailySignups[dayKey] = 0;
  }
  
  userData.forEach(user => {
    const date = new Date(user.createdAt);
    const dayKey = date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    if (dailySignups[dayKey] !== undefined) {
      dailySignups[dayKey] += 1;
    }
  });
  
  setSignupData({
    labels: last30Days,
    datasets: [{
      label: 'Daily User Signups',
      data: last30Days.map(day => dailySignups[day]),
      backgroundColor: 'rgba(101, 116, 205, 0.8)',
      borderColor: 'rgba(101, 116, 205, 1)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(101, 116, 205, 1)',
    }]
  });
};

  const refreshUserData = async () => {
    setRefreshing(true);
    try {
      await fetchAllData();
      if (viewMode === 'deleted') {
        await fetchDeletedUsers();
      }
      addNotification('Data refreshed successfully');
    } catch (err) {
      addNotification('Failed to refresh data', "error");
    }
    setRefreshing(false);
  };

  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedUsers = React.useMemo(() => {
    const userList = viewMode === 'active' ? users : deletedUsers;
    if (!userList.length) return [];
    const sortableUsers = [...userList];
    sortableUsers.sort((a, b) => {
      const aValue = a[sortConfig.key] ? a[sortConfig.key].toString().toLowerCase() : '';
      const bValue = b[sortConfig.key] ? b[sortConfig.key].toString().toLowerCase() : '';
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableUsers;
  }, [users, deletedUsers, sortConfig, viewMode]);

  const filteredUsers = React.useMemo(() => {
    return sortedUsers.filter(user => 
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedUsers, searchTerm]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Sign-up Date', 'Status'];
    const csvRows = filteredUsers.map(user => [
      user.name || 'N/A',
      user.email,
      new Date(user.createdAt).toISOString().split('T')[0],
      viewMode === 'active' ? 'Active' : 'Deleted'
    ].join(','));
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = viewMode === 'active' ? 'active_users_data.csv' : 'deleted_users_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata',
      hour12: true
    });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: { 
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          padding: 10,
          font: { size: 11 },
          color: '#333'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        titleColor: '#333',
        bodyColor: '#333',
        titleFont: { weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        borderColor: 'rgba(101, 116, 205, 0.2)',
        borderWidth: 1,
        cornerRadius: 6,
        callbacks: {
          label: (context) => `${context.raw} users`
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        },
        ticks: { 
          precision: 0,
          color: '#333'
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#333',
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  const renderChart = () => {
    if (!signupData.datasets) return null;
    return (
      <Bar data={signupData} options={chartOptions} height={200} />
    );
  };

  const addNotification = (message, type = "success") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <Navbar />
      
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'active'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Active Users
              </button>
              <button
                onClick={() => setViewMode('deleted')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'deleted'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Deleted Users
              </button>
            </div>

            <button
              onClick={refreshUserData}
              disabled={refreshing}
              className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md text-sm"
            >
              {refreshing ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw size={16} className="mr-2" />
                  Refresh Data
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="bg-gradient-to-br from-white to-blue-50 p-4 rounded-lg shadow-md border border-indigo-100 transform transition-all hover:scale-105">
            <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
            <p className="text-2xl font-bold text-gray-900">{userStatistics.totalUsers || 0}</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md border border-indigo-100 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">User Growth</h3>
            <div className="h-60 md:h-80" ref={chartContainerRef}>
              {renderChart()}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-indigo-100 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-800">
              {viewMode === 'active' ? 'Active User List' : 'Deleted User List'}
            </h2>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportToCSV}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded hover:from-emerald-600 hover:to-teal-700 transition-all shadow-sm text-sm flex items-center"
              >
                <Download size={16} className="mr-2" />
                Export to CSV
              </button>
              
              <select
                value={usersPerPage}
                onChange={(e) => setUsersPerPage(Number(e.target.value))}
                className="px-3 py-1.5 border rounded bg-white text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <div
                    key={user._id}
                    className="bg-gradient-to-br from-white to-indigo-50 rounded-lg shadow-md p-4 border-l-4 border-indigo-500 hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-indigo-600">{user.name || 'N/A'}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Mail size={14} className="mr-1 text-indigo-500" />
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Calendar size={14} className="mr-1 text-indigo-500" />
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 transition-all shadow-sm text-sm flex items-center"
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => requestSort('name')}
                        className="text-gray-400 hover:text-indigo-600 flex items-center text-xs"
                      >
                        Sort by Name
                        {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />)}
                      </button>
                      <button 
                        onClick={() => requestSort('email')}
                        className="text-gray-400 hover:text-indigo-600 flex items-center text-xs"
                      >
                        Sort by Email
                        {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />)}
                      </button>
                      <button 
                        onClick={() => requestSort('createdAt')}
                        className="text-gray-400 hover:text-indigo-600 flex items-center text-xs"
                      >
                        Sort by Date
                        {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />)}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg inline-block">
                    <Search className="text-2xl text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No users found matching your criteria</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            
            <div className="flex flex-wrap justify-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 bg-white hover:bg-gray-50 text-sm"
              >
                First
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button 
                  key={number}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    currentPage === number 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm' 
                      : 'bg-white text-gray-700 hover:bg-indigo-50'
                  } ${number === 1 ? 'rounded-l-md' : ''} ${number === totalPages ? 'rounded-r-md' : ''}`}
                  onClick={() => setCurrentPage(number)}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 bg-white hover:bg-gray-50 text-sm"
              >
                Last
              </button>
            </div>
          </div>
        </div>

        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 pt-20">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">User Details</h2>
              
              {/* Basic Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Basic Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">ID:</span> {selectedUser._id || 'N/A'}</p>
                  <p><span className="font-medium">Name:</span> {selectedUser.name || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                  <p><span className="font-medium">Sign-up Date:</span> {formatDate(selectedUser.createdAt)}</p>
                  <p><span className="font-medium">Last Login:</span> {formatDate(selectedUser.lastLogin)}</p>
                  <p><span className="font-medium">Last Updated:</span> {formatDate(selectedUser.lastUpdated)}</p>
                  <p><span className="font-medium">Updated At:</span> {formatDate(selectedUser.updatedAt)}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Address:</span> {selectedUser.address || 'N/A'}</p>
                  <p><span className="font-medium">Phone:</span> {selectedUser.phone || 'N/A'}</p>
                  <p><span className="font-medium">City:</span> {selectedUser.city || 'N/A'}</p>
                  <p><span className="font-medium">Postal Code:</span> {selectedUser.postalCode || 'N/A'}</p>
                </div>
              </div>

              {/* Preferences */}
              {selectedUser.preferences && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Preferences</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Notifications:</span> {selectedUser.preferences.notifications ? 'Enabled' : 'Disabled'}</p>
                    <p><span className="font-medium">Newsletter:</span> {selectedUser.preferences.newsletter ? 'Subscribed' : 'Unsubscribed'}</p>
                    <p><span className="font-medium">Dark Mode:</span> {selectedUser.preferences.darkMode ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            )}

            {/* Order History */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Order History</h3>
              {userOrders && userOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order Reference</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Placed At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {userOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-4 py-2 text-sm text-gray-700">{order._id}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{order.orderReference}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            <ul className="list-disc pl-5">
                              {order.orderItems.map((item, index) => (
                                <li key={index}>
                                  {item.name} (Qty: {item.quantity}, ₹{item.discountedPrice.toFixed(2)})
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">₹{order.totalPrice.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                order.orderStatus === 'delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : order.orderStatus === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : order.orderStatus === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                order.paymentStatus === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : order.paymentStatus === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">{formatDate(order.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-700">No orders found.</p>
              )}
            </div>

            {/* Wishlist */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Wishlist</h3>
              {selectedUser.wishlist && selectedUser.wishlist.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Added At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedUser.wishlist.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-700">{item.productId}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {item.image ? (
                              <img
                                src={`data:image/png;base64,${item.image}`}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/48?text=Image+Not+Found';
                                }}
                              />
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">₹{item.price.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{item.category}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{item.description}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{formatDate(item.addedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-700">Wishlist is empty.</p>
              )}
            </div>

            {/* Cart */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Cart</h3>
              {cartItems && cartItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">MRP</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Discounted Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cartItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-700">{item.productId || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name || 'Product'}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/48?text=Image+Not+Found';
                                }}
                              />
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {item.name === 'Unknown Product' ? (
                              <span className="text-red-500">Product Not Found</span>
                            ) : (
                              item.name || 'N/A'
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {item.mrp ? `₹${item.mrp.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {item.discountedPrice ? `₹${item.discountedPrice.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">{item.category || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{item.description || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{item.quantity || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {item.status ? (
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  item.status === 'Available'
                                    ? 'bg-green-100 text-green-800'
                                    : item.status === 'Deleted'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {item.status}
                              </span>
                            ) : item.name === 'Unknown Product' ? (
                              <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                                Not Found
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                Available
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-700">Cart is empty.</p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-md hover:from-gray-600 hover:to-gray-700 transition-all shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default UserPage;