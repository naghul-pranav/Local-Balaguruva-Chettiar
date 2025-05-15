import React from 'react';
import { motion } from 'framer-motion';

/**
 * Collection of gradient utility components to enhance UI
 */

// Animated gradient text component
export const GradientText = ({ children, from = "blue-600", to = "purple-600", className = "" }) => {
  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-${from} to-${to} ${className}`}>
      {children}
    </span>
  );
};

// Animated gradient button
export const GradientButton = ({ 
  children, 
  from = "blue-600", 
  via = "indigo-600", 
  to = "purple-600",
  className = "",
  onClick,
  disabled = false
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`bg-gradient-to-r from-${from} via-${via} to-${to} text-white py-2 px-4 rounded-lg transition-all duration-300 shadow-md ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </motion.button>
  );
};

// Gradient card container
export const GradientCard = ({ 
  children, 
  gradientFrom = "blue-500",
  gradientTo = "purple-500",
  className = ""
}) => {
  return (
    <div className={`rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className={`h-2 bg-gradient-to-r from-${gradientFrom} to-${gradientTo}`}></div>
      <div className="bg-white p-6">
        {children}
      </div>
    </div>
  );
};

// Animated gradient background
export const AnimatedGradientBackground = ({ children }) => {
  return (
    <motion.div
      className="relative overflow-hidden rounded-lg"
      animate={{
        background: [
          "linear-gradient(to right, #4f46e5, #7e22ce)",
          "linear-gradient(to right, #7e22ce, #db2777)",
          "linear-gradient(to right, #db2777, #4f46e5)",
          "linear-gradient(to right, #4f46e5, #7e22ce)"
        ]
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.div>
  );
};

// Gradient badge component
export const GradientBadge = ({ 
  children, 
  from = "amber-400", 
  to = "orange-500", 
  className = "" 
}) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-${from} to-${to} text-white shadow-sm ${className}`}>
      {children}
    </span>
  );
};

// Gradient divider
export const GradientDivider = ({ 
  from = "gray-200", 
  via = "gray-400", 
  to = "gray-200", 
  className = "" 
}) => {
  return (
    <div className={`h-px bg-gradient-to-r from-${from} via-${via} to-${to} my-4 ${className}`}></div>
  );
};
