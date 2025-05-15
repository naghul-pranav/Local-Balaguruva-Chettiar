import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FaEnvelope,
  FaLock,
  FaSignInAlt,
  FaUserPlus,
  FaGoogle,
  FaSpinner,
  FaExclamationTriangle
} from "react-icons/fa";

// Animation variants for the container and items
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20
    }
  }
};

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // 'email', 'otp', 'reset'
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    otp: '',
    newPassword: ''
  });
  const [forgotPasswordError, setForgotPasswordError] = useState(null);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:5008/login", formData);
      
      if (response.data && response.data.token) {
        // Save token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        // Update authentication state
        setIsAuthenticated(true);
        
        // Check if there was a pending cart product
        const hasPendingProduct = localStorage.getItem('pendingCartProduct');
        
        // Redirect to home or products page based on pending cart product
        if (hasPendingProduct) {
          navigate("/products");
        } else {
          navigate("/");
        }
        window.location.reload();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // In a real implementation, this would use Google OAuth
    alert("Google login would be implemented here with OAuth");
  };

  const handleForgotPasswordOpen = () => {
    setIsForgotPasswordOpen(true);
    setForgotPasswordStep('email');
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);
    setForgotPasswordData({ email: '', otp: '', newPassword: '' });
  };

  const handleForgotPasswordClose = () => {
    setIsForgotPasswordOpen(false);
    setForgotPasswordStep('email');
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({
      ...forgotPasswordData,
      [e.target.name]: e.target.value
    });
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setForgotPasswordError(null);

    try {
      const response = await axios.post('http://localhost:5008/api/forgot-password', {
        email: forgotPasswordData.email
      });
      setForgotPasswordSuccess(response.data.message);
      setForgotPasswordStep('otp');
    } catch (err) {
      setForgotPasswordError(
        err.response?.data?.message || 'Failed to send OTP. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTPAndReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setForgotPasswordError(null);

    if (forgotPasswordStep === 'otp') {
      try {
        const response = await axios.post('http://localhost:5008/api/reset-password', {
          email: forgotPasswordData.email,
          otp: forgotPasswordData.otp,
          newPassword: forgotPasswordData.newPassword
        });
        setForgotPasswordSuccess(response.data.message);
        setForgotPasswordStep('reset');
      } catch (err) {
        setForgotPasswordError(
          err.response?.data?.message || 'Failed to reset password. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-indigo-100 p-6">
      {/* Main Container with Side Illustration */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Left Side - Illustration/Branding */}
        <div className="hidden lg:block w-1/2 bg-gradient-to-br from-teal-500 to-indigo-600 p-10 text-white">
          <motion.div
            variants={itemVariants}
            className="h-full flex flex-col justify-center"
          >
            <h1 className="text-4xl font-bold tracking-tight">Welcome to Our Ecommerce Page</h1>
            <p className="mt-4 text-lg opacity-80">
              Sign in to explore exclusive products and manage your account with ease.
            </p>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <motion.div
            variants={itemVariants}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-semibold text-gray-800">Sign In</h2>
            <p className="text-gray-500 mt-2">Access your account to continue</p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 text-red-600 p-3 rounded-md flex items-center"
            >
              <FaExclamationTriangle className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <motion.form
            variants={containerVariants}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Email Input */}
            <motion.div variants={itemVariants}>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                  required
                  className={`w-full pl-12 pr-4 py-3 border rounded-md focus:outline-none transition-all duration-200 
                    ${focusedInput === "email" ? "border-teal-500 ring-2 ring-teal-200" : "border-gray-300"}`}
                  placeholder="Enter your email"
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div variants={itemVariants}>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 text-sm font-medium">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPasswordOpen}
                  className="text-sm text-teal-600 hover:text-teal-800 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                  required
                  className={`w-full pl-12 pr-4 py-3 border rounded-md focus:outline-none transition-all duration-200 
                    ${focusedInput === "password" ? "border-teal-500 ring-2 ring-teal-200" : "border-gray-300"}`}
                  placeholder="Enter your password"
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 text-white py-3 rounded-md font-medium flex items-center justify-center transition-all duration-300 hover:bg-teal-700"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaSignInAlt className="mr-2" />
                )}
                {isLoading ? "Signing in..." : "Sign In"}
              </motion.button>
            </motion.div>
          </motion.form>

          {/* Sign Up Link */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-6 text-gray-600"
          >
            <p>
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="text-teal-600 font-medium hover:text-teal-800 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleForgotPasswordClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-8 max-w-sm w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {forgotPasswordStep === 'email' ? 'Reset Your Password' : 
               forgotPasswordStep === 'otp' ? 'Verify OTP' : 'Password Reset Successful'}
            </h3>

            {forgotPasswordError && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex items-center">
                <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                <span>{forgotPasswordError}</span>
              </div>
            )}

            {forgotPasswordSuccess && (
              <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-md">
                {forgotPasswordSuccess}
              </div>
            )}

            {forgotPasswordStep === 'email' && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Enter your email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={forgotPasswordData.email}
                      onChange={handleForgotPasswordChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-teal-600 text-white py-3 rounded-md font-medium flex items-center justify-center transition-all duration-300 hover:bg-teal-700"
                >
                  {isLoading ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    'Send OTP'
                  )}
                </motion.button>
              </form>
            )}

            {forgotPasswordStep === 'otp' && (
              <form onSubmit={handleVerifyOTPAndReset} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={forgotPasswordData.otp}
                    onChange={handleForgotPasswordChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                    placeholder="6-digit OTP"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="newPassword"
                      value={forgotPasswordData.newPassword}
                      onChange={handleForgotPasswordChange}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                      placeholder="New password"
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-teal-600 text-white py-3 rounded-md font-medium flex items-center justify-center transition-all duration-300 hover:bg-teal-700"
                >
                  {isLoading ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    'Reset Password'
                  )}
                </motion.button>
              </form>
            )}

            {forgotPasswordStep === 'reset' && (
              <div className="text-center">
                <p className="mb-4 text-gray-700">You can now log in with your new password.</p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleForgotPasswordClose}
                  className="w-full bg-teal-600 text-white py-3 rounded-md font-medium transition-all duration-300 hover:bg-teal-700"
                >
                  Close
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Login;