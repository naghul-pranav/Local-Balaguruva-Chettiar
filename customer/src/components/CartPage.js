import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaSpinner,
  FaTruck,
  FaBoxOpen,
  FaCreditCard,
  FaCheckCircle,
  FaArrowLeft,
  FaMoneyBillWave,
  FaDownload,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import Payment from "./Payment";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FileText } from "lucide-react";
import { useTranslation } from "../utils/TranslationContext"

const CartPage = ({ removeFromCart, isLoading, user }) => {
  const { t } = useTranslation();
  const [allProducts, setAllProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState("cart");
  const [savedOrder, setSavedOrder] = useState(null);
  const [orderProcessingError, setOrderProcessingError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [progressAnimation, setProgressAnimation] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [orderReference, setOrderReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [error, setError] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || "",
    addressLine1: user?.address || "",
    city: user?.city || "",
    postalCode: user?.postalCode || "",
    email: user?.email || "",
  });
  const totalPrice = cart.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);
  const steps = ["cart", "shipping", "delivery", "payment", "confirmation"];

  const currentStepIndex = steps.indexOf(step);

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to update cart");
        return;
      }

      const cartItem = cart.find((item) => String(item.productId) === String(productId));
      if (!cartItem) {
        setError("Item not found in cart");
        console.error("Item not found in cart for productId:", productId);
        return;
      }

      const product = allProducts.find(
        (p) => String(p._id) === String(productId) || String(p.id) === String(productId)
      );
      if (!product) {
        setError("Product not found");
        console.error(
          "Product not found for productId:",
          productId,
          "allProducts IDs:",
          allProducts.map((p) => ({ id: p.id, _id: p._id }))
        );
        return;
      }
      if (newQuantity > product.stock) {
        setError(`Only ${product.stock} units available`);
        return;
      }

      console.log("Updating quantity for productId:", productId, "to:", newQuantity);
      const response = await axios.post(
        "https://final-balaguruva-chettiar-ecommerce.onrender.com/api/cart/update",
        {
          userId: user.email,
          productId,
          quantity: Math.max(1, newQuantity),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCart((prevCart) =>
        prevCart.map((item) =>
          String(item.productId) === String(productId)
            ? { ...item, quantity: Math.max(1, newQuantity) }
            : item
        )
      );

      setError("");
      console.log(`Updated quantity for product ${productId} to ${newQuantity}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update quantity";
      setError(errorMessage);
      console.error("Failed to update quantity:", err.response?.data || err);
    }
  };

  const handleBackClick = () => {
    const previousStepIndex = Math.max(currentStepIndex - 1, 0);
    setStep(steps[previousStepIndex]);
  };

  useEffect(() => {
    if (user) {
      setShippingInfo({
        fullName: user.name || "",
        addressLine1: user.address || "",
        city: user.city || "",
        postalCode: user.postalCode || "",
        email: user.email || "",
      });
    } else {
      setShippingInfo({
        fullName: "",
        addressLine1: "",
        city: "",
        postalCode: "",
        email: "",
      });
    }
  }, [user]);

  useEffect(() => {
    const progress = ((currentStepIndex + 1) / steps.length) * 100;
    setProgressAnimation(progress);
  }, [currentStepIndex, steps.length]);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
  const fetchCartAndProducts = async () => {
    setIsFetching(true); // Start fetching
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.email) {
      console.log("No user email found, skipping cart fetch");
      setCart([]);
      setIsFetching(false); // Done fetching
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const cartRes = await axios.get(`https://final-balaguruva-chettiar-ecommerce.onrender.com/api/cart/${user.email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartData = cartRes.data;
      console.log("🛒 Cart from backend:", cartData);

      const productsRes = await axios.get("https://final-balaguruva-chettiar-ecommerce.onrender.com/api/products");
      const products = productsRes.data;
      setAllProducts(products);
      console.log("📦 All products:", products);

      const enrichedCart = (cartData.items || [])
        .map((item) => {
          const product = products.find(
            (p) => String(p._id) === String(item.productId) || String(p.id) === String(item.productId)
          );
          if (!product) {
            console.warn("❌ Product not found for productId:", item.productId);
            return null;
          }

          return {
            productId: item.productId,
            name: product.name,
            image: item.image || product.image || "",
            mrp: product.mrp,
            discountedPrice: product.discountedPrice,
            quantity: item.quantity,
          };
        })
        .filter((item) => item !== null);

      setCart(enrichedCart);
      console.log("✅ Processed cart:", enrichedCart);
      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to load cart or products";
      console.error("❌ Error loading cart/products:", {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
        request: err.request?.responseURL,
        stack: err.stack,
      });
      setError(errorMessage);
      setCart([]);
    } finally {
      setIsFetching(false); // Done fetching, regardless of success or failure
    }
  };

  fetchCartAndProducts();
}, []);

  useEffect(() => {
    const syncCart = async () => {
      if (!user?.email || cart.length === 0) return;

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }

      try {
        const response = await fetch("https://final-balaguruva-chettiar-ecommerce.onrender.com/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user.email,
            items: cart.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to sync cart: ${response.status} ${response.statusText}`);
        }

        console.log("Cart synced successfully");
      } catch (err) {
        console.error("Failed to sync cart:", err);
      }
    };

    syncCart();
  }, [cart, user]);

  useEffect(() => {
  // Skip scrolling on initial render or during loading
  if (isLoading || isFetching) return;

  // Only scroll if step changes after initial render
  const isInitialRender = step === steps[0]; // "cart" is the first step
  if (!isInitialRender) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}, [step, isLoading, isFetching, steps]);

  const handleSuccessfulPayment = (order, method) => {
    console.log("Received successful payment:", { order, method }); // Debug
    setSavedOrder(order);
    setPaymentMethod(method);
    setShowConfetti(true);
    setStep("confirmation");
    setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5s
  };

  // Map paymentMethod to display name
  const getPaymentMethodDisplay = (method) => {
    switch (method) {
      case "razorpay":
        return { name: "Online Payment", icon: <FaCreditCard className="mr-1 text-blue-500" /> };
      case "cod":
        return { name: "Cash on Delivery", icon: <FaMoneyBillWave className="mr-1 text-green-500" /> };
      case "upi":
        return { name: "UPI Payment", icon: <img src="/upi.svg" alt="UPI" className="mr-1 h-4" /> };
      default:
        return { name: "Unknown", icon: null };
    }
  };

  const getPaymentStatusMessage = (method) => {
    switch (method) {
      case "cod":
        return `You will pay ₹${(totalPrice + (deliveryMethod === "express" ? 100 : 0)).toFixed(2)} when your order arrives.`;
      case "upi":
        return "Please complete the UPI payment to confirm your order.";
      case "razorpay":
        return "Payment has been completed successfully.";
      default:
        return "Payment status unknown.";
    }
  };

  const getIconColor = (stepName) => {
    const stepIndex = steps.indexOf(stepName);
    return stepIndex <= currentStepIndex ? "text-blue-600" : "text-gray-500";
  };

  const spinnerVariants = { spin: { rotate: 360 } };
  const emptyCartVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };
  const checkoutButtonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)" },
    tap: { scale: 0.95 },
  };
  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 },
  };
  const floatingAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1] },
    },
  };
  const successAnimation = {
    initial: { scale: 0 },
    animate: {
      scale: [0, 1.2, 1],
      rotate: [0, 15, -15, 0],
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };
  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.07 } },
  };
  const fadeInScale = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
  };
  const confettiAnimation = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: [0, 1, 1, 0],
      scale: [0.5, 1.2, 1],
      y: [0, -100, -50, 0],
      rotate: [0, 180, 360],
      transition: { duration: 2, ease: "easeOut" },
    },
  };
  const cartItemVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.3 } },
    hover: { scale: 1.02, boxShadow: "0px 3px 10px rgba(0,0,0,0.1)", backgroundColor: "rgba(249, 250, 251, 1)" },
  };
  const buttonTapVariants = { tap: { scale: 0.95 } };
  const quantityButtonVariants = {
    hover: { backgroundColor: "#dbeafe", scale: 1.05 },
    tap: { scale: 0.9 },
  };
  const formInputVariants = {
    focus: { scale: 1.01, boxShadow: "0px 0px 8px rgba(59, 130, 246, 0.5)", borderColor: "#3b82f6" },
  };
  const radioButtonVariants = { checked: { scale: 1.1 }, unchecked: { scale: 1 } };
  const stepIndicatorVariant = {
    inactive: { scale: 1, opacity: 0.7 },
    active: { scale: 1.1, opacity: 1, boxShadow: "0px 0px 8px rgba(37, 99, 235, 0.5)" },
    completed: { scale: 1, opacity: 1, backgroundColor: "#2563eb", color: "white" },
  };
  const progressBarVariant = {
    initial: { width: "0%" },
    animate: { width: `${progressAnimation}%`, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const handleShippingInfoSubmit = (e) => {
    e.preventDefault();
    const { fullName, addressLine1, city, postalCode } = shippingInfo;

    if (!fullName || !addressLine1 || !city || !postalCode) {
      alert("Please fill in all fields.");
      return;
    }

    if (user && user.email) {
      setShippingInfo((prev) => ({ ...prev, email: user.email }));
    } else if (!shippingInfo.email) {
      alert("Email is required for guest checkout.");
      return;
    }

    setStep("delivery");
  };

  const handleDeliverySelection = () => setStep("payment");
  
  const handleRemoveFromCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to update cart");
        return;
      }

      await axios.post(
        "https://final-balaguruva-chettiar-ecommerce.onrender.com/api/cart/remove",
        {
          userId: user.email,
          productId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCart((prevCart) => prevCart.filter((item) => String(item.productId) !== String(productId)));
      console.log(`Removed item ${productId} from cart`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to remove item from cart";
      setError(errorMessage);
      console.error("Failed to remove item from cart:", err);
    }
  };

  if (isLoading || isFetching) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="loading"
        className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ rotate: 360, transition: { duration: 2, repeat: Infinity, ease: "linear" } }}
          className="text-6xl mx-auto text-blue-500 mb-4"
        >
          <FaSpinner />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-semibold mb-4"
        >
          Loading your cart...
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-500"
        >
          Just a moment while we prepare your items
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}

if (!isLoading && !isFetching && cart.length === 0) {
  return (
    <motion.div
      variants={emptyCartVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center"
    >
      <motion.div variants={floatingAnimation} animate="animate" className="mb-6 p-6 bg-blue-50 rounded-full">
        <FaShoppingCart className="text-6xl text-blue-400" />
      </motion.div>
      <h2 className="text-2xl font-semibold mb-4">{t("Your cart is empty", "home")}</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        {t("Looks like you haven't added anything to your cart yet. Browse our products and find something you'll love!", "home")}
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => (window.location.href = '/products')}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
      >
        <FaArrowLeft />
        <span>{t("Continue Shopping", "home")}</span>
      </motion.button>
    </motion.div>
  );
}

  const renderCartItems = () => (
    <div className={`${isMobile ? "overflow-x-auto" : ""}`}>
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-red-100 text-red-700 rounded"
        >
          {error}
        </motion.div>
      )}
      <table className="w-full min-w-[768px]">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Product</th>
            <th className="text-left py-2">Price</th>
            <th className="text-left py-2">Tax</th>
            <th className="text-left py-2">Quantity</th>
            <th className="text-left py-2">Total</th>
            <th className="text-left py-2">Remove</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {cart.map((item, index) => {
              const product = allProducts.find((p) => String(p.id) === String(item.productId));
              const maxQuantity = product?.stock || Infinity;
              return (
                <motion.tr
                  key={item.productId}
                  layout
                  variants={cartItemVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  whileHover="hover"
                  className="border-b"
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="py-4 flex items-center space-x-4">
                    <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="overflow-hidden rounded-lg">
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
                        onError={(e) =>
                          console.error("Image failed to load for productId:", item.productId, "Src:", e.target.src)
                        }
                      />
                    </motion.div>
                    <span className="text-xl font-semibold">{item.name}</span>
                  </td>
                  <td className="py-4">
                    <span className="line-through text-sm text-gray-500 mr-1">
                      ₹{item.mrp ? item.mrp.toFixed(2) : "0.00"}
                    </span>
                    <span className="text-green-600 font-semibold">
                      ₹{item.discountedPrice ? item.discountedPrice.toFixed(2) : "0.00"}
                    </span>
                  </td>
                  <td className="py-4">₹0.00</td>
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        variants={quantityButtonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="bg-gray-200 p-2 rounded-full transition-colors duration-200"
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus />
                      </motion.button>
                      <motion.span
                        key={item.quantity}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-xl font-semibold w-8 text-center"
                      >
                        {item.quantity}
                      </motion.span>
                      <motion.button
                        variants={quantityButtonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="bg-gray-200 p-2 rounded-full transition-colors duration-200"
                        disabled={item.quantity >= maxQuantity}
                      >
                        <FaPlus />
                      </motion.button>
                    </div>
                    {product && (
                      <p className="text-sm text-gray-500 mt-1">Available: {product.stock}</p>
                    )}
                  </td>
                  <td className="py-4 font-semibold">
                    ₹{item.discountedPrice && item.quantity ? (item.discountedPrice * item.quantity).toFixed(2) : "0.00"}
                  </td>
                  <td className="py-4">
                    <motion.button
                      whileHover={{ scale: 1.2, color: "#ef4444" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveFromCart(item.productId)}
                      className="text-red-500 hover:text-red-600 transition-colors duration-200"
                    >
                      <FaTrash />
                    </motion.button>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );

  const renderShippingForm = () => (
    <motion.div
      variants={fadeInScale}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
        <FaTruck className="text-blue-600" /> <span>Shipping Information</span>
      </h2>
      {user && user.email && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center">
          <div className="text-blue-700 mr-3">
            <FaCheckCircle />
          </div>
          <div>
            <p className="text-sm text-gray-700">Shipping to account email:</p>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>
      )}
      <form onSubmit={handleShippingInfoSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <motion.input
            variants={formInputVariants}
            whileFocus="focus"
            type="text"
            placeholder="John Doe"
            value={shippingInfo.fullName}
            onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
            className="w-full p-3 border rounded-md focus:outline-none transition-all duration-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <motion.input
            variants={formInputVariants}
            whileFocus="focus"
            type="text"
            placeholder="123 Main St"
            value={shippingInfo.addressLine1}
            onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })}
            className="w-full p-3 border rounded-md focus:outline-none transition-all duration-200"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <motion.input
              variants={formInputVariants}
              whileFocus="focus"
              type="text"
              placeholder="Mumbai"
              value={shippingInfo.city}
              onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
              className="w-full p-3 border rounded-md focus:outline-none transition-all duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <motion.input
              variants={formInputVariants}
              whileFocus="focus"
              type="text"
              placeholder="400001"
              value={shippingInfo.postalCode}
              onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
              className="w-full p-3 border rounded-md focus:outline-none transition-all duration-200"
              required
            />
          </div>
        </div>
        {!user && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <motion.input
              variants={formInputVariants}
              whileFocus="focus"
              type="email"
              placeholder="guest@example.com"
              value={shippingInfo.email}
              onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
              className="w-full p-3 border rounded-md focus:outline-none transition-all duration-200"
              required
            />
          </div>
        )}
        {isMobile && (
          <motion.div className="mt-2" initial={false} animate={{ height: showOrderSummary ? "auto" : "40px" }}>
            <button
              type="button"
              onClick={() => setShowOrderSummary(!showOrderSummary)}
              className="flex justify-between w-full py-2 font-semibold bg-gray-50 px-3 rounded-md"
            >
              <span>Order Summary</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </button>
            {showOrderSummary && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>₹{(item.discountedPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 font-semibold">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
        <div className="flex justify-between mt-6">
          <motion.button
            variants={buttonTapVariants}
            whileHover={{ scale: 1.05 }}
            whileTap="tap"
            type="button"
            onClick={handleBackClick}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center space-x-2"
          >
            <FaArrowLeft />
            <span>Back</span>
          </motion.button>
          <motion.button
            variants={buttonTapVariants}
            whileHover={{ scale: 1.05 }}
            whileTap="tap"
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Continue to Delivery
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
  
  const renderDeliveryOptions = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-lg shadow-md mt-6"
    >
      <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
        <FaBoxOpen className="text-green-600" /> <span>Delivery Options</span>
      </h2>
      <p className="text-gray-600 mb-4">Select your preferred delivery method:</p>
      <div className="mt-4 space-y-4">
        <motion.label
          className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${
            deliveryMethod === "standard" ? "border-blue-500 bg-blue-50" : "border-gray-200"
          }`}
          whileHover={{ backgroundColor: "#f8fafc" }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setDeliveryMethod("standard")}
        >
          <motion.div animate={deliveryMethod === "standard" ? "checked" : "unchecked"} variants={radioButtonVariants}>
            <input
              type="radio"
              name="delivery"
              className="form-radio text-blue-600 h-5 w-5"
              checked={deliveryMethod === "standard"}
              onChange={() => setDeliveryMethod("standard")}
            />
          </motion.div>
          <div>
            <span className="font-medium block">Standard Delivery</span>
            <span className="text-sm text-gray-500">3-5 business days - Free</span>
          </div>
        </motion.label>
        <motion.label
          className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${
            deliveryMethod === "express" ? "border-blue-500 bg-blue-50" : "border-gray-200"
          }`}
          whileHover={{ backgroundColor: "#f8fafc" }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setDeliveryMethod("express")}
        >
          <motion.div animate={deliveryMethod === "express" ? "checked" : "unchecked"} variants={radioButtonVariants}>
            <input
              type="radio"
              name="delivery"
              className="form-radio text-blue-600 h-5 w-5"
              checked={deliveryMethod === "express"}
              onChange={() => setDeliveryMethod("express")}
            />
          </motion.div>
          <div>
            <span className="font-medium block">Express Delivery</span>
            <span className="text-sm text-gray-500">1-2 business days - ₹100.00</span>
          </div>
        </motion.label>
        {isMobile && (
          <motion.div className="mt-6" initial={false} animate={{ height: showOrderSummary ? "auto" : "40px" }}>
            <button
              type="button"
              onClick={() => setShowOrderSummary(!showOrderSummary)}
              className="flex justify-between w-full py-2 font-semibold bg-gray-50 px-3 rounded-md"
            >
              <span>Order Summary</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </button>
            {showOrderSummary && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>₹{(item.discountedPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 font-semibold">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>{deliveryMethod === "express" ? "₹100.00" : "Free"}</span>
                  </div>
                  <div className="flex justify-between text-lg mt-1">
                    <span>Total</span>
                    <span>₹{(totalPrice + (deliveryMethod === "express" ? 100 : 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
      <div className="flex justify-between mt-6">
        <motion.button
          variants={buttonTapVariants}
          whileHover={{ scale: 1.05 }}
          whileTap="tap"
          onClick={handleBackClick}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center space-x-2"
        >
          <FaArrowLeft />
          <span>Back</span>
        </motion.button>
        <motion.button
          variants={buttonTapVariants}
          whileHover={{ scale: 1.05 }}
          whileTap="tap"
          onClick={handleDeliverySelection}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Continue to Payment
        </motion.button>
      </div>
    </motion.div>
  );

  const confettiColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
  const renderConfetti = () => {
  if (!showConfetti) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 150 }).map((_, i) => {
        const color = confettiColors[i % confettiColors.length];
        const size = Math.random() * 1 + 0.5;

        // Grouped horizontal positioning
        let left;
        if (i < 50) {
          // Center burst: 40% to 60%
          left = `${40 + Math.random() * 20}%`;
        } else if (i < 100) {
          // Left burst: 5% to 30%
          left = `${5 + Math.random() * 25}%`;
        } else {
          // Right burst: 70% to 95%
          left = `${70 + Math.random() * 25}%`;
        }

        // Group-based stagger delay
        const delay = i < 50 ? 0 : i < 100 ? 0.3 : 0.6;

        return (
          <motion.div
            key={i}
            initial={{ top: "-20px", left, opacity: 1 }}
            animate={{
              top: `${Math.random() * 150 + 100}vh`,
              left,
              opacity: 0,
              rotate: Math.random() * 360,
            }}
            transition={{ duration: Math.random() * 2.5 + 2.5, delay, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: `${size}rem`,
              height: `${size / 2}rem`,
              backgroundColor: color,
              borderRadius: "2px",
            }}
          />
        );
      })}
    </div>
  );
};


  const handleGenerateInvoice = () => {
  setIsGeneratingPdf(true);

  setTimeout(() => {
    try {
      const doc = new jsPDF();

      // Validate cart
      if (!Array.isArray(cart) || cart.length === 0) {
        throw new Error("Cart is empty or invalid. Cannot generate invoice.");
      }

      // Validate cart items
      cart.forEach((item, index) => {
        if (!item.name || typeof item.quantity !== "number" || typeof item.discountedPrice !== "number") {
          throw new Error(`Invalid cart item at index ${index}: ${JSON.stringify(item)}`);
        }
      });

      // Gradient background simulation (blue-50 to indigo-50)
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      for (let i = 0; i <= 40; i++) {
        const r = 219 + (224 - 219) * (i / 40); // blue-50 to indigo-50
        const g = 234 + (231 - 234) * (i / 40);
        const b = 254 + (255 - 254) * (i / 40);
        doc.setFillColor(r, g, b);
        doc.rect(0, i, pageWidth, 1, "F");
      }

      // Header: Balaguruva Chettiar
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor("#3b82f6"); // Tailwind blue-600
      doc.text("Balaguruva Chettiar Son's Co", pageWidth / 2, 15, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#6b7280"); // Tailwind gray-500
      doc.text("97, Agraharam Street, Erode, Tamil Nadu, India - 638001", pageWidth / 2, 23, { align: "center" });
      doc.text("Phone: +91 9842785156 | Email: contact.balaguruvachettiarsons@gmail.com", pageWidth / 2, 28, { align: "center" });

      // Invoice Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor("#3b82f6"); // Tailwind blue-600
      doc.text("INVOICE", pageWidth / 2, 45, { align: "center" });

      // Invoice Details (Date, Invoice #, Payment Method)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#6b7280"); // Tailwind gray-500
      const today = new Date().toLocaleDateString();
      doc.text(`Date: ${today}`, 20, 55);
      doc.text(`Invoice #: ${savedOrder ? savedOrder.orderReference : orderReference}`, 20, 60);
      doc.text(`Payment Method: ${getPaymentMethodDisplay(paymentMethod).name || "N/A"}`, 20, 65);

      // Bill To (Shipping Info)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Bill To:", 140, 55);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`${shippingInfo.fullName || "N/A"}`, 140, 60);
      doc.text(`${shippingInfo.addressLine1 || "N/A"}`, 140, 65);
      doc.text(`${shippingInfo.city || "N/A"}, ${shippingInfo.postalCode || "N/A"}`, 140, 70);
      doc.text(`Email: ${shippingInfo.email || user?.email || "N/A"}`, 140, 75);

      // Separator Line
      doc.setDrawColor("#e5e7eb"); // Tailwind gray-200
      doc.setLineWidth(0.5);
      doc.line(20, 80, 190, 80);

      // Order Details Section Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor("#3b82f6"); // Tailwind blue-500
      doc.text("Order Details", 20, 90);

      // Items Section (Styled like a card)
      const itemsHeight = 10 + cart.length * 10;
      doc.setFillColor("#ffffff"); // Tailwind white
      doc.setDrawColor("#e5e7eb"); // Tailwind gray-200
      doc.roundedRect(20, 95, 170, itemsHeight, 3, 3, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#6b7280"); // Tailwind gray-500
      doc.text("Items", 25, 102);

      doc.autoTable({
        startY: 105,
        head: [["", "Item", "Qty", "Price", "Total"]],
        body: cart.map((item) => [
          "",
          item.name || "N/A",
          (item.quantity || 0).toString(),
          `INR ${(item.discountedPrice || 0).toFixed(2)}`, // Use "INR " instead of ₹
          `INR ${((item.discountedPrice || 0) * (item.quantity || 0)).toFixed(2)}`, // Use "INR " instead of ₹
        ]),
        theme: "plain",
        headStyles: {
          fillColor: "#ffffff",
          textColor: "#6b7280",
          fontStyle: "normal",
          fontSize: 10,
        },
        bodyStyles: {
          fillColor: "#ffffff",
          textColor: "#374151", // Tailwind gray-800
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 5 },
          1: { cellWidth: 75 }, // Slightly reduce to give more space to price columns
          2: { cellWidth: 20, halign: "center" },
          3: { cellWidth: 35, halign: "right" }, // Increase width for better alignment
          4: { cellWidth: 35, halign: "right" }, // Increase width for better alignment
        },
        styles: {
          font: "helvetica",
          fontSize: 10,
          cellPadding: 2,
        },
        didDrawCell: (data) => {
          if (data.row.index > -1 && data.row.section === "body") {
            doc.setDrawColor("#e5e7eb");
            doc.setLineWidth(0.2);
            const y = data.cell.y + data.cell.height;
            doc.line(data.cell.x, y, data.cell.x + 165, y);
          }
        },
      });

      let currentY = (doc.lastAutoTable.finalY || 105 + itemsHeight) + 10;

      // Shipping Address and Delivery Method (Side by Side)
      const cardWidth = 80;
      const cardHeight = 40;

      // Shipping Address Card
      doc.setFillColor("#ffffff");
      doc.setDrawColor("#e5e7eb");
      doc.roundedRect(20, currentY, cardWidth, cardHeight, 3, 3, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#6b7280");
      doc.text("Shipping Address", 25, currentY + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#374151");
      doc.text(`${shippingInfo.fullName || "N/A"}`, 25, currentY + 14);
      doc.text(`${shippingInfo.addressLine1 || "N/A"}`, 25, currentY + 19);
      doc.text(`${shippingInfo.city || "N/A"}, ${shippingInfo.postalCode || "N/A"}`, 25, currentY + 24);
      doc.text(`${user?.email || shippingInfo.email || "N/A"}`, 25, currentY + 29);

      // Delivery Method Card
      doc.setFillColor("#ffffff");
      doc.setDrawColor("#e5e7eb");
      doc.roundedRect(110, currentY, cardWidth, cardHeight, 3, 3, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#6b7280");
      doc.text("Delivery Method", 115, currentY + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#374151");
      doc.text(
        deliveryMethod === "express" ? "Express Delivery (1-2 days)" : "Standard Delivery (3-5 days)",
        115,
        currentY + 14
      );
      doc.text(
        deliveryMethod === "express" ? "Priority shipping with tracking" : "Free shipping with tracking",
        115,
        currentY + 19
      );

      currentY += cardHeight + 10;

      // Payment Summary Card
      doc.setFillColor("#ffffff");
      doc.setDrawColor("#e5e7eb");
      doc.roundedRect(20, currentY, 170, 50, 3, 3, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#6b7280");
      doc.text("Payment Summary", 25, currentY + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#374151");

      doc.text("Subtotal", 25, currentY + 14);
      doc.text(`INR ${(totalPrice || 0).toFixed(2)}`, 185, currentY + 14, { align: "right" });

      doc.text("Delivery", 25, currentY + 19);
      doc.setTextColor(deliveryMethod === "standard" ? "#16a34a" : "#374151"); // Tailwind green-600 or gray-800
      doc.text(deliveryMethod === "express" ? "INR 100.00" : "Free", 185, currentY + 19, { align: "right" });

      doc.setTextColor("#374151");
      doc.text("Payment Method", 25, currentY + 24);
      const paymentMethodText = getPaymentMethodDisplay(paymentMethod).name || "N/A";
      doc.text(paymentMethodText, 185, currentY + 24, { align: "right" });

      doc.setDrawColor("#e5e7eb");
      doc.setLineWidth(0.2);
      doc.line(25, currentY + 30, 185, currentY + 30);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor("#3b82f6");
      doc.text("Total", 25, currentY + 37);
      doc.text(
        `INR ${(totalPrice + (deliveryMethod === "express" ? 100 : 0)).toFixed(2)}`,
        185,
        currentY + 37,
        { align: "right" }
      );

      currentY += 60;

      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor("#6b7280");
      doc.text("Thank you for shopping with Balaguruva Chettiar Son's Co!", pageWidth / 2, pageHeight - 30, {
        align: "center",
      });
      doc.text("We appreciate your business.", pageWidth / 2, pageHeight - 25, { align: "center" });

      // Save the PDF
      doc.save(`Invoice_${savedOrder ? savedOrder.orderReference : orderReference}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate invoice. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  }, 500);
};

  const renderConfirmation = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-white p-8 rounded-lg shadow-md mt-6 max-w-2xl mx-auto"
    >
      {renderConfetti()}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.7 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <FaCheckCircle className="text-green-600 text-5xl" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-2"
        >
          Order Confirmed!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600"
        >
          Thank you for your purchase
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-3 text-lg"
        >
          <p className="font-medium">
            Order Reference: <span className="font-bold bg-blue-50 px-2 py-1 rounded">{savedOrder ? savedOrder.orderReference : orderReference}</span>
          </p>
          <p className="text-sm mt-2 text-gray-600">{getPaymentStatusMessage(paymentMethod)}</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-blue-200 rounded-full opacity-20"></div>
        <h3 className="font-semibold text-lg mb-4 text-blue-800 flex items-center">
          <FileText className="mr-2" /> Order Details
        </h3>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h4 className="text-sm uppercase text-gray-500 mb-2">Items</h4>
            <div className="max-h-40 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
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
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) =>
                          console.error("Image failed to load for productId:", item.productId, "Src:", e.target.src)
                        }
                      />
                    )}
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">₹{item.discountedPrice.toFixed(2)} × {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold">₹{(item.discountedPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h4 className="text-sm uppercase text-gray-500 mb-2">Shipping Address</h4>
              <p className="font-medium">{shippingInfo.fullName}</p>
              <p className="text-sm text-gray-600">{shippingInfo.addressLine1}</p>
              <p className="text-sm text-gray-600">{shippingInfo.city}, {shippingInfo.postalCode}</p>
              <p className="text-sm text-gray-600 mt-1">{user ? user.email : shippingInfo.email}</p>
            </div>

            <div className="bg-white p-4 rounded-md shadow-sm">
              <h4 className="text-sm uppercase text-gray-500 mb-2">Delivery Method</h4>
              <p className="flex items-center font-medium">
                <FaTruck className="mr-2 text-blue-500" />
                {deliveryMethod === "express" ? "Express Delivery (1-2 days)" : "Standard Delivery (3-5 days)"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {deliveryMethod === "express" ? "Priority shipping with tracking" : "Free shipping with tracking"}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md shadow-sm">
            <h4 className="text-sm uppercase text-gray-500 mb-2">Payment Summary</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className={deliveryMethod === "standard" ? "text-green-600" : ""}>
                  {deliveryMethod === "express" ? "₹100.00" : "Free"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="flex items-center">
                  {getPaymentMethodDisplay(paymentMethod).icon}
                  {getPaymentMethodDisplay(paymentMethod).name}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-blue-600">₹{(totalPrice + (deliveryMethod === "express" ? 100 : 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {orderProcessingError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-6"
        >
          <h3 className="font-semibold mb-1">Important Note:</h3>
          <p>{orderProcessingError}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="flex flex-col sm:flex-row justify-center gap-4 mt-6"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerateInvoice}
          disabled={isGeneratingPdf}
          className={`${
            isGeneratingPdf ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center`}
        >
          {isGeneratingPdf ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Generating Invoice...
            </>
          ) : (
            <>
              <FaDownload className="mr-2" />
              Download Invoice
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
          onClick={() => (window.location.href = "/products")}
        >
          <FaArrowLeft className="mr-2" />
          Continue Shopping
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-gray-500">
          Estimated delivery:{" "}
          {deliveryMethod === "express"
            ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()
            : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          You will receive an email with your order details and tracking information.
        </p>
      </motion.div>
    </motion.div>
  );

  const renderCheckoutProgress = () => (
    <div className="mb-12">
      <div className="flex justify-between relative">
        {steps.map((stepName, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          let status = isCompleted ? "completed" : isCurrent ? "active" : "inactive";
          const getIcon = () => {
            switch (stepName) {
              case "cart":
                return <FaShoppingCart />;
              case "shipping":
                return <FaTruck />;
              case "delivery":
                return <FaBoxOpen />;
              case "payment":
                return <FaCreditCard />;
              case "confirmation":
                return <FaCheckCircle />;
              default:
                return null;
            }
          };
          return (
            <div key={stepName} className="flex flex-col items-center relative z-10">
              <motion.div
                initial="inactive"
                animate={status}
                variants={stepIndicatorVariant}
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  status === "completed"
                    ? "bg-blue-600 text-white"
                    : status === "active"
                    ? "bg-white text-blue-600 border-2 border-blue-600"
                    : "bg-gray-100 text-gray-500 border-2 border-gray-300"
                }`}
              >
                {getIcon()}
              </motion.div>
              <span
                className={`text-sm font-medium ${
                  status === "completed" || status === "active" ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {stepName.charAt(0).toUpperCase() + stepName.slice(1)}
              </span>
            </div>
          );
        })}
        <div
          className="absolute h-1 bg-gray-200 top-6 left-0 right-0 z-0"
          style={{ width: "100%", transform: "translateY(-50%)" }}
        >
          <motion.div
            variants={progressBarVariant}
            initial="initial"
            animate="animate"
            className="h-full bg-blue-600 rounded"
          />
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      className="container mx-auto px-4 py-8 min-h-[60vh]"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <motion.div className="mb-8" variants={fadeInScale}>
        {renderCheckoutProgress()}
      </motion.div>
      <AnimatePresence mode="wait">
        {step === "cart" && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-white p-6 rounded-lg shadow-md"
          >
            {renderCartItems()}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8 flex justify-between items-center"
            >
              <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200">
                ← Return to shop
              </button>
              <div className="text-right">
                <span className="text-xl font-semibold">Subtotal: ₹{totalPrice.toFixed(2)}</span>
                <motion.button
                  variants={checkoutButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setStep("shipping")}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg font-semibold mt-4"
                >
                  Continue to Shipping
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {step === "shipping" && renderShippingForm()}
        {step === "delivery" && renderDeliveryOptions()}
        {step === "payment" && (
          <Payment
            cart={cart}
            shippingInfo={shippingInfo}
            deliveryMethod={deliveryMethod}
            user={user}
            totalPrice={totalPrice}
            handleBackClick={handleBackClick}
            onSuccessfulPayment={handleSuccessfulPayment}
          />
        )}
        {step === "confirmation" && renderConfirmation()}
      </AnimatePresence>
    </motion.div>
  );
};

export default CartPage;