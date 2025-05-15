import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import UserProfileNav from "../components/UserProfileNav";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [error, setError] = useState("");
  const [wishlistError, setWishlistError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:5008/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile. Please try again.");
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchUserProfile();
    fetchOrders();
    fetchWishlist();
  }, [navigate]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await axios.get("http://localhost:5008/api/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.response?.data?.message || "Failed to load your orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchWishlist = async () => {
    setLoadingWishlist(true);
    setWishlistError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await axios.get("http://localhost:5008/api/user/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const wishlistData = response.data.wishlist || [];
      
      // Validate each wishlist item
      const validWishlistItems = [];
      for (const item of wishlistData) {
        try {
          const productResponse = await axios.get(`http://localhost:5008/api/products/${item.productId}`);
          if (productResponse.data) {
            validWishlistItems.push(item);
          }
        } catch (error) {
          // Product not found, remove from wishlist
          await axios.delete(`http://localhost:5008/api/user/wishlist/${item.productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      setWishlist(validWishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlistError(error.response?.data?.message || "Failed to load your wishlist.");
    } finally {
      setLoadingWishlist(false);
    }
  };

  const addToCart = async (item) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      if (!user?.email || !token) {
        setError("Please log in to add to cart");
        console.error("❌ Missing user email or token");
        return;
      }

      const productId = item.id || item._id || item.productId;
      if (!productId) {
        setError("Invalid product ID");
        console.error("❌ Missing product ID in item:", item);
        return;
      }

      // Validate product availability
      try {
        await axios.get(`http://localhost:5008/api/products/${productId}`);
      } catch (error) {
        // Product not found, remove from wishlist
        await axios.delete(`http://localhost:5008/api/user/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist(wishlist.filter(w => w.productId !== productId));
        setError("Product not available anymore and has been removed from your wishlist.");
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
        "http://localhost:5008/api/cart/add",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("🛒 Added to cart:", response.data);
      setError("");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to add to cart";
      setError(errorMessage);
      console.error("❌ Failed to add to cart from wishlist:", error.message, error.response?.data);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      await axios.delete(`http://localhost:5008/api/user/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWishlist(wishlist.filter((item) => item.productId !== productId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      setWishlistError("Failed to remove item from wishlist.");
    }
  };

  const clearWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      await axios.delete("http://localhost:5008/api/user/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWishlist([]);
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      setWishlistError("Failed to clear wishlist.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <UserProfileNav user={user} handleLogout={handleLogout} />

      <div className="container mx-auto p-6">
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Profile Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-4">Profile</h2>
          {user ? (
            <div>
              <p><strong>Name:</strong> {user.name || "Not set"}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || "Not set"}</p>
              <p><strong>Address:</strong> {user.address || "Not set"}</p>
              <p><strong>City:</strong> {user.city || "Not set"}</p>
              <p><strong>Postal Code:</strong> {user.postalCode || "Not set"}</p>
              <button
                onClick={() => navigate("/edit-profile")}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <p>Loading profile...</p>
          )}
        </div>

        {/* Orders Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-4">Your Orders</h2>
          {loadingOrders ? (
            <p>Loading orders...</p>
          ) : orders.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => (
                <div key={order._id} className="border p-4 rounded-lg">
                  <p><strong>Order Reference:</strong> {order.orderReference}</p>
                  <p><strong>Status:</strong> {order.orderStatus}</p>
                  <p><strong>Total:</strong> ₹{order.totalPrice}</p>
                  <p><strong>Items:</strong></p>
                  <ul className="list-disc pl-5">
                    {order.orderItems.map((item, index) => (
                      <li key={index}>
                        {item.name} - ₹{item.discountedPrice} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p>No orders found.</p>
          )}
        </div>

        {/* Wishlist Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Wishlist</h2>
            {wishlist.length > 0 && (
              <button
                onClick={clearWishlist}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Clear Wishlist
              </button>
            )}
          </div>
          {wishlistError && <p className="text-red-500 mb-4">{wishlistError}</p>}
          {loadingWishlist ? (
            <p>Loading wishlist...</p>
          ) : wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map((item) => (
                <div key={item.productId} className="border p-4 rounded-lg flex flex-col">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover mb-4 rounded"
                    />
                  )}
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600">₹{item.price}</p>
                  <p className="text-gray-600">{item.category}</p>
                  <p className="text-gray-500 text-sm mb-4">{item.description}</p>
                  <div className="mt-auto flex space-x-2">
                    <button
                      onClick={() => addToCart(item)}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.productId)}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Your wishlist is empty.</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;