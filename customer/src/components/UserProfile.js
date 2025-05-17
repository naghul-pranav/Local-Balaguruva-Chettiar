import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUser, FaEnvelope, FaCalendarAlt, FaShieldAlt, FaEdit,
  FaCamera, FaSave, FaTimes, FaPhone, FaMapMarkerAlt, FaBell,
  FaExclamationTriangle, FaSpinner, FaKey, FaTrash, FaDownload,
  FaSignOutAlt, FaChartPie, FaCheck, FaLock, FaHistory,
  FaShoppingBag, FaBox, FaMoneyBillWave, FaTruck, FaEye, FaShoppingCart,
  FaHeart, FaTrashAlt, FaPlus, FaCartPlus
} from "react-icons/fa";
import axios from "axios";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [showClearWishlistModal, setShowClearWishlistModal] = useState(false);
  const [wishlistSuccess, setWishlistSuccess] = useState({}); // Tracks success messages by productId
const wishlistTimeoutRef = React.useRef({}); // Stores timeout IDs by productId
  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Wishlist state
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'wishlist'

  const API_URL = "https://final-balaguruva-chettiar-ecommerce.onrender.com";

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token not found");

      const response = await axios.get(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = {
        ...response.data,
        city: response.data.city || "",
        postalCode: response.data.postalCode || "",
        createdAt: response.data.createdAt ? new Date(response.data.createdAt) : new Date(),
        lastLogin: response.data.lastLogin ? new Date(response.data.lastLogin) : new Date(),
        lastUpdated: response.data.lastUpdated ? new Date(response.data.lastUpdated) : null,
        preferences: response.data.preferences || {
          notifications: true,
          newsletter: false,
          darkMode: false
        }
      };

      setUser(userData);
      setEditedUser(userData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError("Session expired or invalid token. Please log in again.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => (window.location.href = "/login"), 3000);
      } else {
        setError("Unable to load user profile. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    setLoadingOrders(true);
    setOrdersError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token not found");

      console.log("Fetching orders with token:", token);
      const response = await axios.get(`${API_URL}/api/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Orders response:", response.data);

      // Handle the new response format
      const ordersData = response.data.orders || response.data;

      // Ensure orders match expected schema
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

      console.log(`Formatted ${formattedOrders.length} orders`);
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);

      // Handle the "No orders found" case as an empty list
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

  const fetchWishlist = async () => {
  setLoadingWishlist(true);
  setWishlistError(null);
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Authentication token not found");

    const response = await axios.get(`${API_URL}/api/user/wishlist`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const wishlistData = response.data.wishlist || [];
    const validWishlistItems = [];

    // Validate each wishlist item
    for (const item of wishlistData) {
      try {
        const productResponse = await axios.get(`${API_URL}/api/products/${item.productId}`);
        if (productResponse.data) {
          validWishlistItems.push({
            ...item,
            price: productResponse.data.discountedPrice || item.price,
            image: productResponse.data.image || item.image,
          });
        }
      } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 410) {
          // Product not found or archived, remove from wishlist silently
          try {
            await axios.delete(`${API_URL}/api/user/wishlist/${item.productId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log(`Removed invalid/archived wishlist item: ${item.productId}`);
          } catch (deleteError) {
            console.error(`Failed to remove wishlist item ${item.productId}:`, deleteError);
            // Continue without showing an error to the user
          }
        } else {
          console.error(`Error validating wishlist item ${item.productId}:`, error);
          // Log other errors but don't show to user
        }
      }
    }

    setWishlist(validWishlistItems);

    // If wishlist is empty, the UI will automatically show "Your wishlist is empty"
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    setWishlistError(error.response?.data?.message || "Failed to load your wishlist.");
  } finally {
    setLoadingWishlist(false);
  }
};

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token not found");

      await axios.delete(`${API_URL}/api/user/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setWishlist(prev => prev.filter(item => item.productId !== productId));

      // Show success message
      setError({ type: "success", message: "Item removed from wishlist!" });
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      setWishlistError("Failed to remove item from wishlist.");
    }
  };

  const addToCart = async (item) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!user?.email || !token) {
      setError({ type: "error", message: "Please log in to add to cart" });
      console.error("❌ Missing user email or token");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Log full item for debugging
    console.log("Wishlist item:", item);

    // Try id, _id, or productId
    const productId = item.id || item._id || item.productId;
    if (!productId) {
      setError({ type: "error", message: "Invalid product ID" });
      console.error("❌ Missing product ID in item:", item);
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Validate product availability
    try {
      await axios.get(`${API_URL}/api/products/${productId}`);
    } catch (error) {
      // Product not found, remove from wishlist
      await axios.delete(`${API_URL}/api/user/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(wishlist.filter(w => w.productId !== productId));
      setError({ type: "error", message: "Product not available anymore and has been removed from your wishlist." });
      setTimeout(() => setError(null), 3000);
      return;
    }

    const payload = {
      userId: user.email,
      product: {
        productId: productId,
        name: item.name || "Unknown Product",
        image: item.image || "",
        mrp: item.mrp ?? item.price ?? 0,
        discountedPrice: item.discountedPrice ?? item.price ?? 0,
        quantity: item.quantity || 1,
      },
    };
    console.log("Sending to /api/cart/add from wishlist:", payload);

    const response = await axios.post(
      `${API_URL}/api/cart/add`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("🛒 Added to cart:", response.data);
    
    // Clear any existing timeout for this productId
    if (wishlistTimeoutRef.current[productId]) {
      clearTimeout(wishlistTimeoutRef.current[productId]);
    }

    // Set success message for this product
    setWishlistSuccess(prev => ({
      ...prev,
      [productId]: "Added to cart successfully!"
    }));

    // Clear the success message after 3 seconds
    wishlistTimeoutRef.current[productId] = setTimeout(() => {
      setWishlistSuccess(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
      delete wishlistTimeoutRef.current[productId];
    }, 3000);
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to add to cart";
    setError({ type: "error", message: errorMessage });
    console.error("❌ Failed to add to cart from wishlist:", error.message, error.response?.data);
    setTimeout(() => setError(null), 3000);
  }
};
  const clearWishlist = async () => {
    // Remove the direct use of confirm() and use modal instead
    setShowClearWishlistModal(true);
  };

  const confirmClearWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token not found");

      await axios.delete(`${API_URL}/api/user/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setWishlist([]);

      // Show success message
      setError({ type: "success", message: "Wishlist cleared successfully!" });
      setTimeout(() => setError(null), 3000);

      // Close the modal
      setShowClearWishlistModal(false);
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      setWishlistError("Failed to clear wishlist.");
      setShowClearWishlistModal(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchUserOrders();
    fetchWishlist();
  }, []);
  useEffect(() => {
  return () => {
    // Clear all timeouts when component unmounts
    Object.values(wishlistTimeoutRef.current).forEach(timeoutId => {
      if (timeoutId) clearTimeout(timeoutId);
    });
    wishlistTimeoutRef.current = {};
  };
}, []);
  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (editMode) {
      setEditedUser(user);
      setProfileImage(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setEditedUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: checked
      }
    }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token not found");

      const updatedData = {
        name: editedUser.name,
        phone: editedUser.phone,
        address: editedUser.address,
        city: editedUser.city,
        postalCode: editedUser.postalCode,
        preferences: editedUser.preferences,
        profileImage: profileImage || editedUser.profileImage
      };

      const response = await axios.put(
        `${API_URL}/api/user/profile`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setEditMode(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      setError("Failed to save profile changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setProfileImage(e.target.result);
        setEditedUser(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
      };
      fileReader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitPasswordChange = async () => {
    setPasswordError("");
    if (!passwordData.current) {
      setPasswordError("Current password is required");
      return;
    }
    if (passwordData.new.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError("New passwords don't match");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token not found");

      await axios.put(
        `${API_URL}/api/user/password`,
        {
          currentPassword: passwordData.current,
          newPassword: passwordData.new
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setPasswordData({ current: "", new: "", confirm: "" });
      setShowPasswordModal(false);
      setError({ type: "success", message: "Password updated successfully!" });
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password");
    }
  };

  const handleDeleteAccount = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem('token');
    try {
      if (!deletePassword || !user?.email) {
        setDeleteError("Password and email are required.");
        return;
      }

      if (!token) {
        setDeleteError("No authentication token found. Please log in again.");
        console.error("No token found in localStorage");
        localStorage.removeItem("user");
        setTimeout(() => (window.location.href = "/login"), 2000);
        return;
      }

      console.log("Sending DELETE request with token:", token);

      // Step 1: Verify password
      const verifyRes = await axios.post(`${API_URL}/api/user/verify-password`, {
        email: user.email,
        password: deletePassword,
      });

      if (!verifyRes.data.success) {
        setDeleteError("Incorrect password.");
        return;
      }

      // Step 2: Send DELETE request with Authorization header
      const response = await axios.delete(`${API_URL}/api/user/account`, {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Account deletion response:", response.data);

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (error) {
      console.error("Account deletion error:", error);
      if (error.response?.status === 401) {
        const message = error.response?.data?.message || "Authentication failed";
        console.error("401 Error details:", error.response?.data);
        setDeleteError(`${message}. Please log in again.`);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => (window.location.href = "/login"), 2000);
      } else {
        setDeleteError(error.response?.data?.message || "Account deletion failed.");
      }
    }
  };

  const exportUserData = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token not found");

      const response = await axios.get(
        `${API_URL}/api/user/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user_data_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting data:", error);
      setError("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const calculateProfileCompleteness = () => {
    if (!user) return 0;
    const fields = [
      !!user.name,
      !!user.email,
      !!user.phone,
      !!user.address,
      !!user.profileImage
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  const PasswordChangeModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <FaKey className="mr-2 text-blue-500" /> Change Password
        </h3>
        {passwordError && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {passwordError}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              name="current"
              value={passwordData.current}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              name="new"
              value={passwordData.new}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirm"
              value={passwordData.confirm}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setShowPasswordModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submitPasswordChange}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );

  const DeleteAccountModal = ({ deletePassword, setDeletePassword, onClose, onConfirm }) => {
    const inputRef = React.useRef(null);

    const handleInputChange = (e) => {
      setDeletePassword(e.target.value);
    };

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, [deletePassword]);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center text-red-600">
            <FaTrash className="mr-2" /> Delete Account
          </h3>
          <p className="text-gray-600 mb-6">
            This action cannot be undone. All your data will be permanently deleted.
          </p>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-sm text-red-700 mb-2">
              Please enter your password to confirm deletion:
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={handleInputChange}
              ref={inputRef}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your password"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setDeletePassword("");
                onClose();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!deletePassword}
              className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${
                !deletePassword && "opacity-50 cursor-not-allowed"
              }`}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    );
  };

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[1000] p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[85vh] overflow-y-auto mt-20">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-[1010] pt-2">
            <h3 className="text-xl font-bold flex items-center">
              <FaShoppingBag className="mr-2 text-blue-500" /> Order Details
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
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
                    order.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
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
                order.paymentStatus === 'pending' ? 'bg-yellow-100' :
                'bg-red-100'
              }`}>
                {order.paymentStatus === 'completed' ? <FaCheck className="text-green-600" /> :
                 order.paymentStatus === 'pending' ? <FaMoneyBillWave className="text-yellow-600" /> :
                 <FaTimes className="text-red-600" />}
              </div>
              <div>
                <p className="font-medium capitalize">{order.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}</p>
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
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const ClearWishlistModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center text-red-600">
          <FaTrashAlt className="mr-2" /> Clear Wishlist
        </h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to clear your entire wishlist? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowClearWishlistModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={confirmClearWishlist}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Clear Wishlist
          </button>
        </div>
      </div>
    </div>
  );

  const renderWishlist = () => (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-8"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg flex items-center text-gray-700">
          <FaHeart className="mr-2 text-red-500" /> Wishlist
        </h3>
        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-sm text-red-600 hover:text-red-800 flex items-center"
          >
            <FaTrashAlt className="mr-1" /> Clear All
          </button>
        )}
      </div>

      {loadingWishlist ? (
        <div className="text-center py-8">
          <FaSpinner className="text-red-500 text-2xl animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading your wishlist...</p>
        </div>
      ) : wishlistError ? (
        <div className="bg-red-50 p-4 rounded-md text-red-600 text-center">
          <FaExclamationTriangle className="mx-auto mb-2" />
          <p>{wishlistError}</p>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FaHeart className="text-gray-400 text-3xl mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-2">Your wishlist is empty</p>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Add items to your wishlist to keep track of products you're interested in.
          </p>
          <button
            onClick={() => window.location.href = "/products"}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center mx-auto"
          >
            <FaPlus className="mr-2" /> Add Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((item) => (
  <div
    key={item.productId}
    className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col"
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs text-gray-500">
        Added {new Date(item.addedAt).toLocaleDateString()}
      </span>
      <button
        onClick={() => removeFromWishlist(item.productId)}
        className="text-red-500 hover:text-red-700"
        title="Remove from wishlist"
      >
        <FaTimes />
      </button>
    </div>

    <div className="flex items-center mb-3">
      {item.image ? (
        <img
          src={item.image?.startsWith("data:image")
            ? item.image
            : `data:image/jpeg;base64,${item.image}`}
          alt={item.name}
          className="w-16 h-16 object-cover rounded mr-3"
        />
      ) : (
        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center mr-3">
          <FaHeart className="text-gray-400" />
        </div>
      )}

      <div className="flex-1">
        <h4 className="font-medium text-gray-800 mb-1 line-clamp-1">{item.name}</h4>
        <p className="text-blue-600 font-bold">₹{item.price.toFixed(2)}</p>
      </div>
    </div>

    {item.description && (
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
    )}

    {item.category && (
      <div className="mb-3">
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
          {item.category}
        </span>
      </div>
    )}

    {wishlistSuccess[item.productId] ? (
      <div className="mt-2 bg-green-50 border-l-4 border-green-500 p-2 text-green-700 text-sm flex items-center">
        <FaCheck className="mr-2" />
        {wishlistSuccess[item.productId]}
      </div>
    ) : (
      <button
        onClick={() => addToCart(item)}
        className="mt-auto bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-2 rounded hover:from-blue-600 hover:to-teal-600 transition-colors flex items-center justify-center"
      >
        <FaCartPlus className="mr-2" /> Add to Cart
      </button>
    )}
  </div>
))}
        </div>
      )}
    </motion.div>
  );

  const renderTabButtons = () => (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        className={`py-2 px-4 font-medium text-sm ${
          activeTab === 'orders'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('orders')}
      >
        <FaShoppingBag className="inline mr-2" /> Orders
        {orders.length > 0 && (
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
            {orders.length}
          </span>
        )}
      </button>
      <button
        className={`py-2 px-4 font-medium text-sm ${
          activeTab === 'wishlist'
            ? 'text-red-600 border-b-2 border-red-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('wishlist')}
      >
        <FaHeart className="inline mr-2" /> Wishlist
        {wishlist.length > 0 && (
          <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
            {wishlist.length}
          </span>
        )}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-white/20 animate-pulse"></div>
              <div className="w-full">
                <div className="h-8 bg-white/20 rounded animate-pulse w-1/3 mb-4"></div>
                <div className="h-4 bg-white/20 rounded animate-pulse w-1/2 mb-4"></div>
                <div className="h-6 bg-white/20 rounded animate-pulse w-1/4"></div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                  <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3 mb-4"></div>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && typeof error === 'string') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg text-red-600 max-w-md text-center">
          <FaExclamationTriangle className="text-3xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg text-red-600 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2">Not Logged In</h2>
          <p>Please log in to view your profile</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const profileCompleteness = calculateProfileCompleteness();

  const renderOrderHistory = () => (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-8"
    >
      <h3 className="font-semibold text-lg flex items-center mb-4 text-gray-700">
        <FaShoppingBag className="mr-2 text-blue-500" /> Order History
      </h3>
      {loadingOrders ? (
        <div className="text-center py-8">
          <FaSpinner className="text-blue-500 text-2xl animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      ) : ordersError ? (
        <div className="bg-red-50 p-4 rounded-md text-red-600 text-center">
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
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
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
                      order.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => handleViewOrderDetails(order)}
                      className="text-blue-600 hover:text-blue-800 flex items-center"
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

  const renderProfileInfo = () => (
    <div className="text-center md:text-left flex-1">
      {editMode ? (
        <input
          type="text"
          name="name"
          value={editedUser.name}
          onChange={handleInputChange}
          className="text-3xl font-bold bg-transparent border-b border-white/30 text-white outline-none w-full md:w-auto text-center md:text-left"
        />
      ) : (
        <h1 className="text-3xl font-bold">{user.name}</h1>
      )}
      <p className="text-blue-100 flex items-center justify-center md:justify-start mt-2">
        <FaEnvelope className="mr-2" />
        {user.email}
      </p>
      <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 inline-flex items-center gap-4">
        <p className="text-sm">
          {user._id ? "Member" : "Local Profile"}
        </p>
        <button
          onClick={handleEditToggle}
          className="bg-white/20 hover:bg-white/30 text-white text-sm py-1 px-3 rounded-full flex items-center transition-colors"
          aria-label={editMode ? "Cancel editing" : "Edit profile"}
          disabled={saving}
        >
          {editMode ? (
            <>
              <FaTimes className="mr-1" /> Cancel
            </>
          ) : (
            <>
              <FaEdit className="mr-1" /> Edit Profile
            </>
          )}
        </button>
        {editMode && (
          <button
            onClick={handleSaveChanges}
            className={`${
              saving ? "bg-blue-400" : "bg-green-500 hover:bg-green-600"
            } text-white text-sm py-1 px-3 rounded-full flex items-center transition-colors`}
            aria-label="Save profile changes"
            disabled={saving}
          >
            {saving ? (
              <>
                <FaSpinner className="mr-1 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-1" /> Save
              </>
            )}
          </button>
        )}
      </div>
      <div className="mt-2">
        <button
          onClick={fetchUserOrders}
          className="text-white/80 hover:text-white text-sm underline flex items-center gap-1"
        >
          <FaHistory className="text-xs" /> Refresh Order History
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {showPasswordModal && <PasswordChangeModal />}
      {showDeleteModal && (
        <DeleteAccountModal
          deletePassword={deletePassword}
          setDeletePassword={setDeletePassword}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletePassword("");
          }}
          onConfirm={handleDeleteAccount}
        />
      )}

      {showOrderDetails && <OrderDetailsModal order={selectedOrder} onClose={() => setShowOrderDetails(false)} />}
      {showClearWishlistModal && <ClearWishlistModal />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {error && error.type === "success" && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              <p className="text-sm text-green-700">{error.message}</p>
            </div>
            <button onClick={() => setError(null)}>
              <FaTimes className="text-green-500" />
            </button>
          </div>
        )}

        {error && error.type === "error" && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
            <button onClick={() => setError(null)}>
              <FaTimes className="text-red-500" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="bg-white px-8 pt-6 pb-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <FaChartPie className="mr-2 text-blue-500" />
                Profile Completeness
              </h3>
              <span className="text-sm font-medium">{profileCompleteness}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${profileCompleteness}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-5xl backdrop-blur-sm border-2 border-white/30 relative group overflow-hidden">
              {user.profileImage || profileImage ? (
                <img
                  src={profileImage || user.profileImage}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser />
              )}
              {editMode && (
                <label htmlFor="profile-image" className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <FaCamera className="text-2xl" />
                  <input
                    type="file"
                    id="profile-image"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            {renderProfileInfo()}
          </div>

          {error && typeof error === 'string' && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button className="ml-auto" onClick={() => setError(null)}>
                  <FaTimes className="text-red-500" />
                </button>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200"
              >
                <h3 className="font-semibold text-lg flex items-center mb-4 text-gray-700">
                  <FaShieldAlt className="mr-2 text-blue-500" /> Account Security
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Email verification</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    {editMode ? (
                      <input
                        type="text"
                        name="phone"
                        value={editedUser.phone || ""}
                        onChange={handleInputChange}
                        className="font-medium bg-transparent border-b border-gray-300 outline-none w-full"
                        placeholder="Add your phone number"
                      />
                    ) : (
                      <p className="font-medium flex items-center">
                        <FaPhone className="mr-2 text-blue-500 text-xs" />
                        {user.phone || "Not provided"}
                      </p>
                    )}
                  </div>
                  {!user.googleId && (
                    <div>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <FaKey className="mr-1" /> Change password
                      </button>
                    </div>
                  )}
                  <div>
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = "/login";
                      }}
                      className="flex items-center text-red-600 hover:text-red-800 text-sm mt-4"
                    >
                      <FaSignOutAlt className="mr-1" /> Log out from all devices
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200"
              >
                <h3 className="font-semibold text-lg flex items-center mb-4 text-gray-700">
                  <FaCalendarAlt className="mr-2 text-blue-500" /> Account Activity
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last login</span>
                    <span className="text-sm">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Account created</span>
                    <span className="text-sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}</span>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm text-gray-500 mb-2">Address</p>
                    {editMode ? (
                      <>
                        <textarea
                          name="address"
                          value={editedUser.address || ""}
                          onChange={handleInputChange}
                          className="font-medium bg-transparent border border-gray-300 outline-none w-full p-2 rounded"
                          rows={2}
                          placeholder="Add your address"
                        />

                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-2">City</p>
                          <input
                            type="text"
                            name="city"
                            value={editedUser.city || ""}
                            onChange={handleInputChange}
                            className="font-medium bg-transparent border border-gray-300 outline-none w-full p-2 rounded"
                            placeholder="Enter your city"
                          />
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-2">Postal Code</p>
                          <input
                            type="text"
                            name="postalCode"
                            value={editedUser.postalCode || ""}
                            onChange={handleInputChange}
                            className="font-medium bg-transparent border border-gray-300 outline-none w-full p-2 rounded"
                            placeholder="Enter postal code"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-medium flex items-start">
                          <FaMapMarkerAlt className="mr-2 text-blue-500 text-xs mt-1" />
                          {user.address || "Not provided"}
                        </p>

                        <div className="text-sm text-gray-600 mt-2">
                          <p><strong>City:</strong> {user.city || "Not provided"}</p>
                          <p><strong>Postal Code:</strong> {user.postalCode || "Not provided"}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-t border-gray-100 pt-6 md:border-0 md:pt-0">
                <h3 className="font-semibold text-lg text-gray-700 mb-4">Account Information</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">User ID</span>
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {user._id ? user._id.substring(0, 10) + "..." : "Not available"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Account created</span>
                      <span className="text-sm">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Last profile update</span>
                      <span className="text-sm">
                        {user.lastUpdated ? new Date(user.lastUpdated).toLocaleDateString() : "Never"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Login method</span>
                      <span className="text-sm">
                        {user.googleId ? "Google" : "Email & Password"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-lg text-gray-700 mb-4 flex items-center">
                <FaLock className="mr-2 text-blue-500" /> Data Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h4 className="font-medium text-blue-800 mb-2">Download Your Data</h4>
                  <p className="text-sm text-blue-600 mb-4">
                    Export all your personal data in a portable format.
                  </p>
                  <button
                    onClick={exportUserData}
                    disabled={exporting}
                    className={`flex items-center text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors ${exporting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {exporting ? (
                      <>
                        <FaSpinner className="mr-2 animate-spin" /> Exporting...
                      </>
                    ) : (
                      <>
                        <FaDownload className="mr-2" /> Download My Data
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                  <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-600 mb-4">
                    Permanently delete your account and all associated data.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaTrash className="mr-2" /> Delete My Account
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-lg text-gray-700 mb-4 flex items-center">
                <FaHistory className="mr-2 text-blue-500" /> Recent Activity
              </h3>
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-100 border-b border-gray-200">
                  <p className="text-sm text-gray-500">Your recent account activity will appear here</p>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <FaUser className="text-blue-500 text-xs" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Profile updated</p>
                        <p className="text-xs text-gray-500">Your profile information was updated</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {user.lastUpdated ? new Date(user.lastUpdated).toLocaleDateString() : "Never"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <FaSignOutAlt className="text-green-500 text-xs" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Last login</p>
                        <p className="text-xs text-gray-500">You logged in successfully</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {renderTabButtons()}

            {activeTab === 'orders' ? renderOrderHistory() : renderWishlist()}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;