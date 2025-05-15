import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingCart,
  FaYarn,
  FaInfoCircle,
  FaEnvelope,
  FaHome,
  FaBars,
  FaTimes,
  FaRobot,
  FaLanguage,
  FaChevronDown,
  FaUser,
} from "react-icons/fa";
// Import the translation hook
import { useTranslation } from "../utils/TranslationContext";

const Navbar = memo(({ cart, theme = 'light', isAuthenticated, setIsAuthenticated }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [userInfo, setUserInfo] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userToggledMenu, setUserToggledMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use our translation context
  const { language, changeLanguage, t } = useTranslation();

  // Define languages with their display names and codes
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ta', name: 'தமிழ்' }
  ];

  // Set initial selected language based on current language in context
  useEffect(() => {
    // Find the language object that matches the current language code
    const currentLang = languages.find(l => l.code === language);
    if (currentLang) {
      setSelectedLanguage(currentLang.name);
    }
  }, [language]);

  // Language change handler with loading state
  const handleLanguageChange = async (lang) => {
    setIsChangingLanguage(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Use our context's changeLanguage function
      changeLanguage(lang.code);
      setSelectedLanguage(lang.name);
      setIsLanguageMenuOpen(false);
    } finally {
      setIsChangingLanguage(false);
    }
  };

  // Optimized scroll handler with debounce
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 50;
    if (isScrolled !== scrolled) {
      setIsScrolled(scrolled);
    }
  }, [isScrolled]);

  useEffect(() => {
    let timeoutId;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 10);
    };
    window.addEventListener("scroll", debouncedScroll);
    return () => {
      window.removeEventListener("scroll", debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  // Memoize theme-based styles
  const themeStyles = useMemo(() => ({
    header: theme === 'light' 
      ? 'bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-lg'
      : 'bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-lg text-white',
    nav: theme === 'light'
      ? 'hover:bg-blue-50/80 hover:text-blue-600'
      : 'hover:bg-gray-700/80 hover:text-blue-400',
    activeLink: theme === 'light'
      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20'
      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30',
    languageMenu: theme === 'light'
      ? 'bg-white/95 backdrop-blur-md border border-gray-100 shadow-xl shadow-gray-200/50'
      : 'bg-gray-800/95 backdrop-blur-md border border-gray-700 shadow-xl shadow-black/30 text-white',
    mobileMenu: theme === 'light'
      ? 'bg-white/95 backdrop-blur-lg border-t border-gray-100'
      : 'bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 text-white'
  }), [theme]);

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (isLanguageMenuOpen) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prev => (prev + 1) % languages.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prev => (prev - 1 + languages.length) % languages.length);
          break;
        case 'Enter':
          if (activeIndex >= 0) {
            handleLanguageChange(languages[activeIndex]);
          }
          break;
        case 'Escape':
          setIsLanguageMenuOpen(false);
          setActiveIndex(-1);
          break;
      }
    }
  }, [isLanguageMenuOpen, activeIndex]);

  // Memoize cart item count
  const cartItemCount = useMemo(() => 
    cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Translate navigation links
  const navLinks = [
    { to: "/home", icon: <FaHome />, text: t("Home", "navbar") },
    { to: "/products", icon: <FaShoppingCart />, text: t("Products", "navbar") },
    { to: "/about", icon: <FaInfoCircle />, text: t("About", "navbar") },
    { to: "/contact", icon: <FaEnvelope />, text: t("Contact", "navbar") },
  ];

  // Add logout functionality to the component
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserMenuOpen(false);
    setIsAuthenticated(false);
    navigate('/');
    window.location.reload();
  };

  // Get user info from localStorage on component mount
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
          setUserInfo(userData);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [isAuthenticated]);

  return (
    <motion.header
      className={`fixed top-0 w-full z-[100] transition-all duration-300 
        ${isScrolled 
          ? `h-14 sm:h-16 md:h-[4.5rem] ${themeStyles.header} shadow-xl ring-1 ring-gray-200/50 transform-gpu` 
          : `h-16 sm:h-[4.5rem] md:h-20 ${themeStyles.header}`}`}
      role="banner"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="container mx-auto h-full px-3 sm:px-4 flex justify-between items-center">
        <Link 
          to="/home" 
          className="flex items-center space-x-1 sm:space-x-2 transform transition-all duration-300 hover:scale-105"
          aria-label={t("Balaguruva Chettiar Son's Co", "navbar")}
        >
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
          >
            <FaYarn className="text-xl sm:text-2xl md:text-3xl text-blue-600 drop-shadow-md" />
          </motion.div>
          <span className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Balaguruva Chettiar Son's Co
          </span>
        </Link>

        <nav 
          className="hidden lg:flex space-x-1 xl:space-x-4 items-center"
          role="navigation"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center px-2 xl:px-3 py-2 rounded-md transition-all duration-300 text-sm xl:text-base
                         ${location.pathname === link.to
                           ? themeStyles.activeLink + " transform -translate-y-0.5 scale-105"
                           : themeStyles.nav}`}
              aria-current={location.pathname === link.to ? "page" : undefined}
            >
              {link.icon}
              <span className="ml-1 xl:ml-2 font-medium">{link.text}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          {/* Language Selector Button - Enhanced with translation support */}
          <div className="relative">
            <button
              className={`p-1.5 sm:p-2 rounded-md ${theme === 'light' ? 'hover:bg-blue-50/80' : 'hover:bg-gray-700/80'} transition-all duration-200 flex items-center`}
              onClick={() => !isChangingLanguage && setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              aria-label={t("Select language", "navbar") + ` (${t("current", "navbar")}: ${selectedLanguage})`}
              aria-expanded={isLanguageMenuOpen}
              aria-controls="language-menu"
              disabled={isChangingLanguage}
            >
              <FaLanguage className={`text-lg sm:text-xl ${isChangingLanguage ? 'animate-spin text-blue-500' : ''}`} />
              <motion.div
                animate={{ rotate: isLanguageMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="ml-1"
              >
                <FaChevronDown className="text-xs" />
              </motion.div>
            </button>
            <AnimatePresence>
              {isLanguageMenuOpen && (
                <motion.div
                  id="language-menu"
                  role="menu"
                  aria-label={t("Language selection", "navbar")}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute right-0 mt-1 sm:mt-2 w-40 sm:w-48 rounded-lg py-1 z-50 ${themeStyles.languageMenu}`}
                >
                  {languages.map((lang, index) => (
                    <motion.button
                      key={lang.code}
                      role="menuitem"
                      onClick={() => handleLanguageChange(lang)}
                      onMouseEnter={() => setActiveIndex(index)}
                      whileHover={{ x: 3 }}
                      aria-selected={selectedLanguage === lang.name}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        index === activeIndex ? 'bg-blue-100/70' : ''
                      } ${
                        language === lang.code
                          ? 'bg-blue-50/70 text-blue-600 font-medium'
                          : 'hover:bg-gray-100/70'
                      }`}
                    >
                      {lang.name}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            {isAuthenticated ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setUserToggledMenu(true);
                    setUserMenuOpen((prev) => !prev);
                  }}
                  className={`relative p-1.5 sm:p-2 rounded-md ${theme === 'light' ? 'hover:bg-blue-50/80' : 'hover:bg-gray-700/80'} transition-all duration-200 group flex items-center`}
                  aria-label={t("User menu", "navbar")}
                >
                  <FaUser className="text-lg sm:text-xl group-hover:text-blue-600 transition-colors" />
                  <span className="hidden md:block font-medium truncate max-w-[80px] lg:max-w-[100px] text-sm lg:text-base ml-2">
                    {userInfo?.name || t("User", "navbar")}
                  </span>
                  <FaChevronDown className="ml-1 text-xs hidden sm:block" />
                </motion.button>

                {/* User dropdown menu - add back the Logout option */}
                <AnimatePresence>
                  {userToggledMenu && userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute right-0 mt-1 sm:mt-2 w-40 sm:w-48 rounded-lg py-1 z-50 ${themeStyles.languageMenu}`}
                    >
                      <Link 
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-blue-50"
                      >
                        {t("My Profile", "navbar")}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50"
                      >
                        {t("Logout", "navbar")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                to="/login"
                className={`relative p-1.5 sm:p-2 rounded-md ${theme === 'light' ? 'hover:bg-blue-50/80' : 'hover:bg-gray-700/80'} transition-all duration-200 group`}
                aria-label={t("Login", "navbar")}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <FaUser className="text-lg sm:text-xl group-hover:text-blue-600 transition-colors" />
                </motion.div>
              </Link>
            )}
          </div>

          <Link
            to="/cart"
            className={`relative p-1.5 sm:p-2 rounded-md ${theme === 'light' ? 'hover:bg-blue-50/80' : 'hover:bg-gray-700/80'} transition-all duration-200 group`}
            aria-label={t("Shopping Cart", "navbar") + ` ${cartItemCount}`}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <FaShoppingCart className="text-lg sm:text-xl group-hover:text-blue-600 transition-colors" />
              <AnimatePresence>
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs 
                             rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center 
                             shadow-md sm:shadow-lg shadow-red-500/30 text-[10px] sm:text-xs"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`lg:hidden p-1.5 sm:p-2 rounded-md ${theme === 'light' ? 'hover:bg-blue-50/80' : 'hover:bg-gray-700/80'} transition-colors duration-200`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? t("Close", "common") : t("Open", "common") + " " + t("menu", "common")}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <FaTimes className="text-lg sm:text-xl" /> : <FaBars className="text-lg sm:text-xl" />}
          </motion.button>
        </div>
      </div>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={`lg:hidden shadow-2xl overflow-hidden ${themeStyles.mobileMenu} max-h-[calc(100vh-4rem)]`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              transition: {
                height: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }
            }}
          >
            <nav className="flex flex-col p-3 sm:p-4 space-y-1 overflow-y-auto">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { 
                      delay: index * 0.05,
                      duration: 0.3
                    }
                  }}
                >
                  <Link
                    to={link.to}
                    className={`flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200
                              ${location.pathname === link.to
                                ? themeStyles.activeLink
                                : `${theme === 'light' ? 'hover:bg-blue-50/80 hover:text-blue-600' : 'hover:bg-gray-800/80 hover:text-blue-400'}`}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={location.pathname === link.to ? "page" : undefined}
                  >
                    <span className="text-lg sm:text-xl">{link.icon}</span>
                    <span className="ml-3 font-medium text-sm sm:text-base">{link.text}</span>
                  </Link>
                  {index < navLinks.length - 1 && (
                    <div className={`border-b ${theme === 'light' ? 'border-gray-100' : 'border-gray-700'} my-1 opacity-70`} />
                  )}
                </motion.div>
              ))}
              
              {/* Modify mobile menu user section */}
              {isAuthenticated && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { 
                        delay: navLinks.length * 0.05,
                        duration: 0.3
                      }
                    }}
                  >
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex w-full items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg ${theme === 'light' ? 'bg-blue-50 text-blue-700' : 'bg-gray-800 text-blue-300'} transition-all duration-200`}
                    >
                      <span className="text-lg sm:text-xl"><FaUser /></span>
                      <span className="ml-3 font-medium text-sm sm:text-base">{t("My Profile", "navbar")}</span>
                    </Link>
                    <div className={`border-b ${theme === 'light' ? 'border-gray-100' : 'border-gray-700'} my-1 opacity-70`} />
                  </motion.div>
                  
                  {/* Add back logout button for mobile menu */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { 
                        delay: (navLinks.length + 1) * 0.05,
                        duration: 0.3
                      }
                    }}
                  >
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex w-full items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-red-500 text-white transition-all duration-200 hover:bg-red-600`}
                    >
                      <span className="text-lg sm:text-xl"><FaUser /></span>
                      <span className="ml-3 font-medium text-sm sm:text-base">{t("Logout", "navbar")}</span>
                    </button>
                    <div className={`border-b ${theme === 'light' ? 'border-gray-100' : 'border-gray-700'} my-1 opacity-70`} />
                  </motion.div>
                </>
              )}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { 
                    delay: navLinks.length * 0.05 + 0.1,
                    duration: 0.3
                  }
                }}
                className="pt-1 sm:pt-2"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'} py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center transition-all duration-200 mt-1 sm:mt-2 shadow-md`}
                >
                  <FaTimes className="mr-2" />
                  <span className="text-sm sm:text-base">{t("Close Menu", "common")}</span>
                </motion.button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;