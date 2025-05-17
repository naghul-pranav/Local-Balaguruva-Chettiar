import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingCart,
  FaUtensils,
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
  
  const { language, changeLanguage, t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ta', name: 'தமிழ்' }
  ];

  useEffect(() => {
    const currentLang = languages.find(l => l.code === language);
    if (currentLang) {
      setSelectedLanguage(currentLang.name);
    }
  }, [language]);

  const handleLanguageChange = async (lang) => {
    setIsChangingLanguage(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      changeLanguage(lang.code);
      setSelectedLanguage(lang.name);
      setIsLanguageMenuOpen(false);
    } finally {
      setIsChangingLanguage(false);
    }
  };

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

  const themeStyles = useMemo(() => ({
    header: theme === 'light' 
      ? 'bg-white/90 backdrop-blur-lg'
      : 'bg-gray-900/90 backdrop-blur-lg text-white',
    nav: theme === 'light'
      ? 'hover:text-teal-600'
      : 'hover:text-teal-400',
    activeLink: theme === 'light'
      ? 'text-teal-600 border-b-2 border-teal-600'
      : 'text-teal-400 border-b-2 border-teal-400',
    languageMenu: theme === 'light'
      ? 'bg-white border border-gray-200 shadow-lg'
      : 'bg-gray-800 border border-gray-700 shadow-lg text-white',
    mobileMenu: theme === 'light'
      ? 'bg-white border-t border-gray-200'
      : 'bg-gray-900 border-t border-gray-800 text-white'
  }), [theme]);

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

  const cartItemCount = useMemo(() => 
    cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const navLinks = [
    { to: "/home", icon: <FaHome />, text: t("Home", "navbar") },
    { to: "/products", icon: <FaShoppingCart />, text: t("Products", "navbar") },
    { to: "/about", icon: <FaInfoCircle />, text: t("About", "navbar") },
    { to: "/contact", icon: <FaEnvelope />, text: t("Contact", "navbar") },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserMenuOpen(false);
    setIsAuthenticated(false);
    navigate('/');
    window.location.reload();
  };

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
          ? `h-14 sm:h-16 md:h-[4.5rem] ${themeStyles.header} shadow-lg`
          : `h-16 sm:h-[4.5rem] md:h-20 ${themeStyles.header}`}`}
      role="banner"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="container mx-auto h-full px-4 sm:px-6 flex justify-between items-center">
        <Link 
          to="/home" 
          className="flex items-center space-x-2 transform transition-all duration-300 hover:scale-105"
          aria-label={t("Balaguruva Chettiar Son's Co", "navbar")}
        >
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
          >
            <FaUtensils className="text-2xl md:text-3xl text-teal-600" />
          </motion.div>
          <span className="text-xl sm:text-2xl md:text-3xl font-bold italic font-playfair text-gray-800 shadow-sm hover:text-teal-600 transition-colors duration-300">
            Balaguruva Chettiar Son's Co
          </span>
        </Link>

        <nav 
          className="hidden lg:flex space-x-6 items-center"
          role="navigation"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center px-2 py-2 text-sm lg:text-base font-medium transition-all duration-300
                ${location.pathname === link.to
                  ? themeStyles.activeLink
                  : themeStyles.nav}`}
              aria-current={location.pathname === link.to ? "page" : undefined}
            >
              {link.icon}
              <span className="ml-2">{link.text}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="relative">
            <button
              className="p-2 rounded-full hover:bg-teal-50 transition-all duration-200 flex items-center"
              onClick={() => !isChangingLanguage && setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              aria-label={t("Select language", "navbar") + ` (${t("current", "navbar")}: ${selectedLanguage})`}
              aria-expanded={isLanguageMenuOpen}
              aria-controls="language-menu"
              disabled={isChangingLanguage}
            >
              <FaLanguage className={`text-xl ${isChangingLanguage ? 'animate-spin text-teal-500' : 'text-gray-600'}`} />
              <motion.div
                animate={{ rotate: isLanguageMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="ml-1"
              >
                <FaChevronDown className="text-xs text-gray-600" />
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
                  className={`absolute right-0 mt-2 w-40 rounded-lg py-1 z-50 ${themeStyles.languageMenu}`}
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
                        index === activeIndex ? 'bg-teal-50' : ''
                      } ${
                        language === lang.code
                          ? 'bg-teal-50 text-teal-600 font-medium'
                          : 'hover:bg-gray-100'
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
                  className="flex items-center p-2 rounded-full hover:bg-teal-50 transition-all duration-200"
                  aria-label={t("User menu", "navbar")}
                >
                  <FaUser className="text-xl text-gray-600" />
                  <span className="hidden md:block font-medium truncate max-w-[100px] text-sm ml-2 text-gray-800">
                    {userInfo?.name || t("User", "navbar")}
                  </span>
                  <FaChevronDown className="ml-1 text-xs text-gray-600 hidden md:block" />
                </motion.button>

                <AnimatePresence>
                  {userToggledMenu && userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute right-0 mt-2 w-40 rounded-lg py-1 z-50 ${themeStyles.languageMenu}`}
                    >
                      <Link 
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-teal-50 text-gray-800"
                      >
                        {t("My Profile", "navbar")}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
                className="p-2 rounded-full hover:bg-teal-50 transition-all duration-200"
                aria-label={t("Login", "navbar")}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <FaUser className="text-xl text-gray-600" />
                </motion.div>
              </Link>
            )}
          </div>

          <Link
            to="/cart"
            className="p-2 rounded-full hover:bg-teal-50 transition-all duration-200 relative"
            aria-label={t("Shopping Cart", "navbar") + ` ${cartItemCount}`}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <FaShoppingCart className="text-xl text-gray-600" />
              <AnimatePresence>
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="lg:hidden p-2 rounded-full hover:bg-teal-50 transition-all duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? t("Close", "common") : t("Open", "common") + " " + t("menu", "common")}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <FaTimes className="text-xl text-gray-600" /> : <FaBars className="text-xl text-gray-600" />}
          </motion.button>
        </div>
      </div>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={`lg:hidden shadow-lg overflow-hidden ${themeStyles.mobileMenu}`}
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
            <nav className="flex flex-col p-4 space-y-2">
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
                    className={`flex items-center px-4 py-3 rounded-md transition-all duration-200
                      ${location.pathname === link.to
                        ? themeStyles.activeLink
                        : 'hover:text-teal-600'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={location.pathname === link.to ? "page" : undefined}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="ml-3 font-medium text-base">{link.text}</span>
                  </Link>
                  {index < navLinks.length - 1 && (
                    <div className={`border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'} my-1`} />
                  )}
                </motion.div>
              ))}
              
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
                      className="flex w-full items-center px-4 py-3 rounded-md text-teal-600 transition-all duration-200"
                    >
                      <span className="text-xl"><FaUser /></span>
                      <span className="ml-3 font-medium text-base">{t("My Profile", "navbar")}</span>
                    </Link>
                    <div className={`border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'} my-1`} />
                  </motion.div>
                  
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
                      className="flex w-full items-center px-4 py-3 rounded-md text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <span className="text-xl"><FaUser /></span>
                      <span className="ml-3 font-medium text-base">{t("Logout", "navbar")}</span>
                    </button>
                    <div className={`border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'} my-1`} />
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
                className="pt-2"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-teal-600 text-white py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300 hover:bg-teal-700"
                >
                  <FaTimes className="mr-2" />
                  <span className="text-base">{t("Close Menu", "common")}</span>
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