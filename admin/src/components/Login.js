import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Lock, AlertCircle, ArrowRight, Moon, Sun, EyeOff, Eye, Coffee, Key } from 'lucide-react';
import axios from 'axios'; // Added for API calls

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [otp, setOtp] = useState(''); // Added for OTP input
    const [step, setStep] = useState('credentials'); // 'credentials' or 'otp'
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [shake, setShake] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Simple credentials
    const ADMIN_USERNAME = "contact.balaguruvachettiarsons@gmail.com";
    const ADMIN_PASSWORD = "Balaguruva@1";

    useEffect(() => {
        // Check for saved credentials if any
        const savedUsername = localStorage.getItem('ksp_username');
        if (savedUsername) {
            setFormData(prev => ({ ...prev, username: savedUsername }));
            setRememberMe(true);
        }
        
        // Check for preferred theme
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('ksp_theme');
        const initialDarkMode = savedTheme ? savedTheme === 'dark' : prefersDarkMode;
        setDarkMode(initialDarkMode);
        
        // Clear any existing auth on login page visit
        sessionStorage.clear();
        
        // Apply dark mode to html element for Tailwind
        if (initialDarkMode) {
            document.documentElement.classList.add('dark');
        }
        
        return () => {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('ksp_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('ksp_theme', 'light');
        }
    }, [darkMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.username.trim() || formData.username !== ADMIN_USERNAME) {
            newErrors.username = 'Invalid username';
        }
        
        if (!formData.password || formData.password !== ADMIN_PASSWORD) {
            newErrors.password = 'Invalid password';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsLoading(true);
            setErrors({});

            try {
                // Send OTP request to server
                const response = await axios.post('http://localhost:5000/api/admin/send-otp', {
                    email: formData.username
                });

                if (response.data.success) {
                    setStep('otp'); // Move to OTP verification step
                } else {
                    setErrors({ general: response.data.message || 'Failed to send OTP' });
                    setShake(true);
                    setTimeout(() => setShake(false), 500);
                }
            } catch (error) {
                setErrors({ general: error.response?.data?.message || 'Failed to send OTP' });
                setShake(true);
                setTimeout(() => setShake(false), 500);
            } finally {
                setIsLoading(false);
            }
        } else {
            setLoginAttempts(prev => prev + 1);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            const response = await axios.post('http://localhost:5000/api/admin/verify-otp', {
                email: formData.username,
                otp
            });

            if (response.data.success) {
                // Handle "Remember me" functionality
                if (rememberMe) {
                    localStorage.setItem('ksp_username', formData.username);
                } else {
                    localStorage.removeItem('ksp_username');
                }

                // Store session data
                const loginTime = new Date().getTime();
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('adminUser', formData.username);
                sessionStorage.setItem('loginTime', loginTime.toString());
                sessionStorage.setItem('token', response.data.token); // Use the token from server

                setTimeout(() => {
                    setIsLoading(false);
                    navigate('/', { replace: true });
                }, 800);
            } else {
                setErrors({ otp: response.data.message || 'Invalid OTP' });
                setShake(true);
                setTimeout(() => setShake(false), 500);
            }
        } catch (error) {
            setErrors({ otp: error.response?.data?.message || 'Failed to verify OTP' });
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        alert("Password recovery feature will be implemented soon.\n\nFor now, contact your administrator for assistance.");
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Theme toggle button - improved for touch */}
            <button 
                className="absolute top-4 right-4 p-3 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 touch-manipulation"
                onClick={toggleTheme}
                aria-label="Toggle theme"
            >
                {darkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-indigo-600" />}
                <span className="sr-only">Switch to {darkMode ? 'light' : 'dark'} mode</span>
            </button>
            
            {/* Main login container - enhanced with better padding for mobile */}
            <div className={`max-w-md w-full bg-white/95 dark:bg-gray-800/95 shadow-2xl rounded-2xl p-6 sm:p-8 md:p-10 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 ${shake ? 'animate-shake' : ''} transition-all duration-300 hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/30`}>
                <div className="text-center mb-6 sm:mb-8">
                    <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 rotate-3 hover:rotate-0 duration-300">
                        <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-white drop-shadow-md" />
                    </div>
                    <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Balaguruva Chettiar Admin</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Welcome back! Please sign in to continue</p>
                </div>
                
                {loginAttempts >= 3 && step === 'credentials' && (
                    <div className="mb-6 p-3 sm:p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 flex items-center border-l-4 border-yellow-500 dark:border-yellow-600 animate-pulse-slow">
                        <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span className="text-sm">Multiple failed attempts detected. Need help? Contact support.</span>
                    </div>
                )}
                
                {step === 'credentials' ? (
                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                        {errors.general && (
                            <div className="mb-6 p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 flex items-center border-l-4 border-red-500 dark:border-red-600 animate-pulse-slow">
                                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                                <span className="text-sm">{errors.general}</span>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Username
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                                </div>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                    disabled={isLoading}
                                    className={`pl-10 sm:pl-11 w-full py-2.5 sm:py-3 px-3 sm:px-4 border ${errors.username ? 'border-red-500 dark:border-red-400 bg-red-50/50 dark:bg-red-900/10' : formData.username ? 'border-green-500 dark:border-green-400 bg-green-50/50 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-600'} rounded-xl shadow-sm placeholder-gray-400 
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200`}
                                />
                                {formData.username && !errors.username && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <div className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                    </div>
                                )}
                            </div>
                            {errors.username && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1.5" />
                                    {errors.username}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                    className={`pl-11 w-full py-3 px-4 border ${errors.password ? 'border-red-500 dark:border-red-400 bg-red-50/50 dark:bg-red-900/10' : formData.password ? 'border-green-500 dark:border-green-400 bg-green-50/50 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-600'} rounded-xl shadow-sm placeholder-gray-400 
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200`}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1.5" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-1 gap-3 sm:gap-0">
                            <div className="flex items-center">
                                <div className="relative inline-block w-11 mr-2 align-middle select-none">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                        disabled={isLoading}
                                        className="absolute block w-6 h-6 rounded-full bg-white dark:bg-gray-700 border-4 border-gray-300 dark:border-gray-600 appearance-none cursor-pointer focus:outline-none checked:bg-indigo-500 checked:border-indigo-500 dark:checked:bg-indigo-600 dark:checked:border-indigo-600 left-0 transition-transform duration-300 ease-in-out transform"
                                        style={{ transform: rememberMe ? 'translateX(100%)' : 'translateX(0)' }}
                                    />
                                    <label htmlFor="remember-me" className="block h-6 overflow-hidden bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer transition-colors duration-300 ease-in-out" style={{ backgroundColor: rememberMe ? 'rgb(99, 102, 241, 0.3)' : '' }}></label>
                                </div>
                                <label htmlFor="remember-me" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                    Remember me
                                </label>
                            </div>
                        </div>

                        <div className="pt-2 sm:pt-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="relative w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent rounded-xl text-base font-medium text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed dark:from-indigo-700 dark:via-purple-700 dark:to-indigo-700 dark:hover:from-indigo-800 dark:hover:via-purple-800 dark:hover:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] overflow-hidden group min-h-[48px]"
                            >
                                <span className="absolute -inset-full transform translate-x-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-transparent group-hover:animate-shimmer" />
                                {isLoading ? (
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <span>Next: Verify OTP</span>
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 duration-300" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleOtpSubmit} className="space-y-5 sm:space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">Enter OTP</h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                A 6-digit code has been sent to your email
                            </p>
                        </div>

                        {errors.otp && (
                            <div className="mb-6 p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 flex items-center border-l-4 border-red-500 dark:border-red-600 animate-pulse-slow">
                                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                                <span className="text-sm">{errors.otp}</span>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                One-Time Password (OTP)
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Key className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                                </div>
                                <input
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit OTP"
                                    disabled={isLoading}
                                    className={`pl-11 w-full py-3 px-4 border ${errors.otp ? 'border-red-500 dark:border-red-400 bg-red-50/50 dark:bg-red-900/10' : otp ? 'border-green-500 dark:border-green-400 bg-green-50/50 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-600'} rounded-xl shadow-sm placeholder-gray-400 
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200`}
                                />
                            </div>
                        </div>

                        <div className="pt-2 sm:pt-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="relative w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent rounded-xl text-base font-medium text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed dark:from-indigo-700 dark:via-purple-700 dark:to-indigo-700 dark:hover:from-indigo-800 dark:hover:via-purple-800 dark:hover:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] overflow-hidden group min-h-[48px]"
                            >
                                <span className="absolute -inset-full transform translate-x-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-transparent group-hover:animate-shimmer" />
                                {isLoading ? (
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <span>Verify and Sign In</span>
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 duration-300" />
                                    </div>
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => setStep('credentials')}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline transition-all duration-200"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}
                
                <div className="mt-8 sm:mt-9 text-center">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                Secure Login
                            </span>
                        </div>
                    </div>
                    
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        Balaguruva Chettiar Admin Panel © {new Date().getFullYear()} • All Rights Reserved
                    </p>
                </div>
            </div>
            
            {/* Decorative elements - optimize for mobile */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-indigo-200/50 to-purple-200/50 dark:from-indigo-900/30 dark:to-purple-900/30 opacity-70 blur-xl animate-blob"></div>
                <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-pink-200/50 to-red-200/50 dark:from-pink-900/30 dark:to-red-900/30 opacity-70 blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-12 left-10 w-72 h-72 rounded-full bg-gradient-to-br from-yellow-200/50 to-orange-200/50 dark:from-yellow-900/30 dark:to-orange-900/30 opacity-70 blur-xl animate-blob animation-delay-4000"></div>
                <div className="absolute -bottom-32 right-32 w-96 h-96 rounded-full bg-gradient-to-br from-green-200/50 to-teal-200/50 dark:from-green-900/30 dark:to-teal-900/30 opacity-70 blur-xl animate-blob animation-delay-1000"></div>
                <div className="absolute top-1/3 left-1/3 w-56 h-56 rounded-full bg-gradient-to-br from-purple-200/50 to-blue-200/50 dark:from-purple-900/30 dark:to-blue-900/30 opacity-70 blur-xl animate-blob animation-delay-3000"></div>
            </div>
        </div>
    );
};

export default Login;