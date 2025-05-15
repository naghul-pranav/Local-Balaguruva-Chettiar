import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaUserPlus,
  FaGoogle,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle
} from "react-icons/fa";
import { FaKey } from 'react-icons/fa';

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

const Signup = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [serverCode, setServerCode] = useState(null);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return score;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    return Math.min(score, 5);
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return "Very Weak";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      case 5: return "Very Strong";
      default: return "";
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return "bg-red-500";
      case 1: return "bg-red-400";
      case 2: return "bg-yellow-500";
      case 3: return "bg-yellow-400";
      case 4: return "bg-green-500";
      case 5: return "bg-green-600";
      default: return "bg-gray-300";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    setError(null);
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      const response = await axios.post("http://localhost:5008/signup", signupData);
      
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setIsAuthenticated(true);
        navigate("/");
        window.location.reload();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
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
            <h1 className="text-4xl font-bold tracking-tight">Join Our Community</h1>
            <p className="mt-4 text-lg opacity-80">
              Sign up to explore premium cookware collections and more.
            </p>
          </motion.div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <motion.div
            variants={itemVariants}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-semibold text-gray-800">
              {showVerification ? "Verify Your Email" : "Create an Account"}
            </h2>
            <p className="text-gray-500 mt-2">
              {showVerification ? "Enter the code sent to your email" : "Join us to get started"}
            </p>
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

          {showVerification ? (
            <motion.form
              variants={containerVariants}
              onSubmit={(e) => {
                e.preventDefault();
                if (verificationCode === serverCode) {
                  handleSubmit(e);
                } else {
                  setError("Invalid verification code");
                }
              }}
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaKey className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    onFocus={() => setFocusedInput("verificationCode")}
                    onBlur={() => setFocusedInput(null)}
                    required
                    className={`w-full pl-12 pr-4 py-3 border rounded-md focus:outline-none transition-all duration-200 
                      ${focusedInput === "verificationCode" ? "border-teal-500 ring-2 ring-teal-200" : "border-gray-300"}`}
                    placeholder="Enter 6-digit code"
                  />
                </div>
              </motion.div>

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
                    <FaCheckCircle className="mr-2" />
                  )}
                  {isLoading ? "Verifying..." : "Verify Code"}
                </motion.button>
              </motion.div>
            </motion.form>
          ) : (
            <motion.form
              variants={containerVariants}
              onSubmit={async (e) => {
                e.preventDefault();
                if (!validateForm()) return;
                setIsLoading(true);
                setError(null);
                try {
                  const response = await axios.post("http://localhost:5008/send-verification", {
                    email: formData.email,
                  });
                  setServerCode(response.data.code);
                  setShowVerification(true);
                } catch (err) {
                  setError(err.response?.data?.message || "Failed to send verification code.");
                } finally {
                  setIsLoading(false);
                }
              }}
              className="space-y-6"
            >
              {/* Full Name Input */}
              <motion.div variants={itemVariants}>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput("name")}
                    onBlur={() => setFocusedInput(null)}
                    required
                    className={`w-full pl-12 pr-4 py-3 border rounded-md focus:outline-none transition-all duration-200 
                      ${focusedInput === "name" ? "border-teal-500 ring-2 ring-teal-200" : "border-gray-300"}`}
                    placeholder="Enter your full name"
                  />
                </div>
              </motion.div>

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
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Password
                </label>
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
                    placeholder="Create a password"
                  />
                </div>
                {formData.password && (
                  <div className="mt-2 flex justify-between items-center">
                    <div className="h-2 flex-grow rounded-full bg-gray-200 overflow-hidden">
                      <div 
                        className={`h-full ${getPasswordStrengthColor()}`} 
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-3 text-sm text-gray-600">{getPasswordStrengthText()}</span>
                  </div>
                )}
              </motion.div>

              {/* Confirm Password Input */}
              <motion.div variants={itemVariants}>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput("confirmPassword")}
                    onBlur={() => setFocusedInput(null)}
                    required
                    className={`w-full pl-12 pr-4 py-3 border rounded-md focus:outline-none transition-all duration-200 
                      ${focusedInput === "confirmPassword" ? "border-teal-500 ring-2 ring-teal-200" : "border-gray-300"}
                      ${formData.confirmPassword && formData.password === formData.confirmPassword ? "border-green-500" : ""}`}
                    placeholder="Confirm your password"
                  />
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <FaCheckCircle className="text-green-500" />
                    </div>
                  )}
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
                    <FaUserPlus className="mr-2" />
                  )}
                  {isLoading ? "Sending code..." : "Send Verification Code"}
                </motion.button>
              </motion.div>
            </motion.form>
          )}

          {/* Login Link */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-6 text-gray-600"
          >
            <p>
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-teal-600 font-medium hover:text-teal-800 transition-colors"
              >
                Log In
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;