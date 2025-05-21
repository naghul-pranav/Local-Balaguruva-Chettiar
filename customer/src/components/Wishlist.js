import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaHeart, FaSpinner, FaExclamationTriangle, FaShoppingCart,
  FaTrashAlt, FaTimes, FaPlus, FaCartPlus, FaCheck
} from "react-icons/fa";
import axios from "axios";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);
  const [wishlistSuccess, setWishlistSuccess] = useState({});
  const wishlistTimeoutRef = React.useRef({});
  const [showClearWishlistModal, setShowClearWishlistModal] = useState(false);

  const API_URL = "https://final-balaguruva-chettiar-ecommerce.onrender.com";

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
            try {
              await axios.delete(`${API_URL}/api/user/wishlist/${item.productId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
            } catch (deleteError) {
              console.error(`Failed to remove wishlist item ${item.productId}:`, deleteError);
            }
          }
        }
      }

      setWishlist(validWishlistItems);
    } catch (error) {
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

      setWishlist(prev => prev.filter(item => item.productId !== productId));
      setWishlistError(null);
      setWishlistSuccess(prev => ({
        ...prev,
        [productId]: "Item removed from wishlist!"
      }));
      if (wishlistTimeoutRef.current[productId]) {
        clearTimeout(wishlistTimeoutRef.current[productId]);
      }
      wishlistTimeoutRef.current[productId] = setTimeout(() => {
        setWishlistSuccess(prev => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
        delete wishlistTimeoutRef.current[productId];
      }, 3000);
    } catch (error) {
      setWishlistError("Failed to remove item from wishlist.");
    }
  };

  const addToCart = async (item) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      if (!user?.email || !token) {
        setWishlistError("Please log in to add to cart");
        setTimeout(() => setWishlistError(null), 3000);
        return;
      }

      const productId = item.id || item._id || item.productId;
      if (!productId) {
        setWishlistError("Invalid product ID");
        setTimeout(() => setWishlistError(null), 3000);
        return;
      }

      try {
        await axios.get(`${API_URL}/api/products/${productId}`);
      } catch (error) {
        await axios.delete(`${API_URL}/api/user/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist(wishlist.filter(w => w.productId !== productId));
        setWishlistError("Product not available anymore and has been removed from your wishlist.");
        setTimeout(() => setWishlistError(null), 3000);
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

      await axios.post(
        `${API_URL}/api/cart/add`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (wishlistTimeoutRef.current[productId]) {
        clearTimeout(wishlistTimeoutRef.current[productId]);
      }

      setWishlistSuccess(prev => ({
        ...prev,
        [productId]: "Added to cart successfully!"
      }));

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
      setWishlistError(errorMessage);
      setTimeout(() => setWishlistError(null), 3000);
    }
  };

  const clearWishlist = () => {
    setShowClearWishlistModal(true);
  };

  const confirmClearWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token not found");

      await axios.delete(`${API_URL}/api/user/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setWishlist([]);
      setWishlistError(null);
      setWishlistSuccess(prev => ({
        ...prev,
        clear: "Wishlist cleared successfully!"
      }));
      if (wishlistTimeoutRef.current.clear) {
        clearTimeout(wishlistTimeoutRef.current.clear);
      }
      wishlistTimeoutRef.current.clear = setTimeout(() => {
        setWishlistSuccess(prev => {
          const newState = { ...prev };
          delete newState.clear;
          return newState;
        });
        delete wishlistTimeoutRef.current.clear;
      }, 3000);
      setShowClearWishlistModal(false);
    } catch (error) {
      setWishlistError("Failed to clear wishlist.");
      setShowClearWishlistModal(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
    return () => {
      Object.values(wishlistTimeoutRef.current).forEach(timeoutId => {
        if (timeoutId) clearTimeout(timeoutId);
      });
      wishlistTimeoutRef.current = {};
    };
  }, []);

  const ClearWishlistModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center text-red-700">
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
      className="bg-gradient-to-b from-white to-amber-50 p-6 rounded-xl border border-gray-200 shadow-sm mt-8"
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

      {wishlistSuccess.clear && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <FaCheck className="text-green-500 mr-2" />
            <p className="text-sm text-green-700">{wishlistSuccess.clear}</p>
          </div>
          <button onClick={() => setWishlistSuccess(prev => {
            const newState = { ...prev };
            delete newState.clear;
            return newState;
          })}>
            <FaTimes className="text-green-500" />
          </button>
        </div>
      )}

      {wishlistError && (
        <div className="bg-red-50 p-4 rounded-md text-red-700 text-center mb-6">
          <FaExclamationTriangle className="mx-auto mb-2" />
          <p>{wishlistError}</p>
        </div>
      )}

      {loadingWishlist ? (
        <div className="text-center py-8">
          <FaSpinner className="text-red-500 text-2xl animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading your wishlist...</p>
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
                  <p className="text-emerald-600 font-bold">₹{item.price.toFixed(2)}</p>
                </div>
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
              )}

              {item.category && (
                <div className="mb-3">
                  <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">
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
                  className="mt-auto bg-gradient-to-r from-emerald-600 to-amber-500 text-white px-4 py-2 rounded hover:from-emerald-700 hover:to-amber-600 transition-colors flex items-center justify-center"
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

  return (
    <div className="min-h-screen bg-stone-100 py-12 px-4 font-['Inter','Roboto',sans-serif]">
      {showClearWishlistModal && <ClearWishlistModal />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500"></div>
          <div className="p-6">
            {renderWishlist()}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Wishlist;