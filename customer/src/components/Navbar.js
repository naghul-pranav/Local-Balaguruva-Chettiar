import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineShoppingCart,
  HiOutlineFire,
  HiOutlineInformationCircle,
  HiOutlineMail,
  HiOutlineHome,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineGlobeAlt,
  HiOutlineChevronDown,
  HiOutlineUser,
} from "react-icons/hi";
import { IoRestaurantOutline } from "react-icons/io5";
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
      ? 'bg-cream !bg-[#FDF6F0] opacity-100'
      : 'bg-gray-800 !bg-[#1F2937] text-cream opacity-100',
    nav: theme === 'light'
      ? 'hover:text-copper'
      : 'hover:text-copper',
    activeLink: theme === 'light'
      ? 'text-copper border-b-2 border-copper'
      : 'text-copper border-b-2 border-copper',
    languageMenu: theme === 'light'
      ? 'bg-cream !bg-[#FDF6F0] border border-terracotta/30 shadow-md opacity-100'
      : 'bg-gray-800 !bg-[#1F2937] border border-terracotta/30 shadow-md text-cream opacity-100',
    mobileMenu: theme === 'light'
      ? 'bg-cream !bg-[#FDF6F0] border-t border-terracotta/30 opacity-100'
      : 'bg-gray-800 !bg-[#1F2937] border-t border-terracotta/30 text-cream opacity-100'
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
    { to: "/home", icon: <HiOutlineHome />, text: t("Home", "navbar") },
    { to: "/products", icon: <HiOutlineShoppingCart />, text: t("Products", "navbar") },
    { to: "/about", icon: <HiOutlineInformationCircle />, text: t("About", "navbar") },
    { to: "/contact", icon: <HiOutlineMail />, text: t("Contact", "navbar") },
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
      className={`fixed top-0 w-full z-[2000] transition-all duration-300 isolate border-b border-terracotta/20 
        ${isScrolled 
          ? `h-14 sm:h-16 md:h-18 ${themeStyles.header} shadow-md`
          : `h-16 sm:h-18 md:h-20 ${themeStyles.header}`}`}
      role="banner"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="container mx-auto h-full px-6 sm:px-8 flex justify-between items-center">
        <Link 
          to="/home" 
          className="flex items-center space-x-4 pl-4 transform transition-all duration-300 hover:scale-105"
          aria-label={t("K.Balaguruva Chettiar Son's Co", "navbar")}
        >
          <motion.div
            whileHover={{ rotate: [0, 5, -5, 5, 0], transition: { duration: 0.5 } }}
          >
            <IoRestaurantOutline className="text-3xl md:text-4xl text-terracotta" />
          </motion.div>
          <span className="text-xl sm:text-2xl md:text-3xl font-bold font-playfair text-terracotta hover:text-copper transition-colors duration-300">
            K.Balaguruva Chettiar Son's Co
          </span>
        </Link>

        <nav 
          className="hidden lg:flex space-x-10 items-center justify-center"
          role="navigation"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center px-4 py-2 text-base font-medium font-inter transition-all duration-300
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
              className="p-2 rounded-lg bg-cream hover:bg-copper/20 transition-all duration-300 flex items-center"
              onClick={() => !isChangingLanguage && setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              aria-label={t("Select language", "navbar") + ` (${t("current", "navbar")}: ${selectedLanguage})`}
              aria-expanded={isLanguageMenuOpen}
              aria-controls="language-menu"
              disabled={isChangingLanguage}
            >
              <HiOutlineGlobeAlt className={`text-xl ${isChangingLanguage ? 'animate-pulse text-copper' : 'text-terracotta'}`} />
              <motion.div
                animate={{ rotate: isLanguageMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="ml-1"
              >
                <HiOutlineChevronDown className="text-sm text-terracotta" />
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
                  className={`absolute right-0 mt-2 w-48 rounded-lg py-2 z-[2010] ${themeStyles.languageMenu}`}
                >
                  {languages.map((lang, index) => (
                    <motion.button
                      key={lang.code}
                      role="menuitem"
                      onClick={() => handleLanguageChange(lang)}
                      onMouseEnter={() => setActiveIndex(index)}
                      whileHover={{ x: 4 }}
                      aria-selected={selectedLanguage === lang.name}
                      className={`block w-full text-left px-4 py-2 text-sm font-inter
                        ${index === activeIndex ? 'bg-copper/20' : ''}
                        ${language === lang.code
                          ? 'bg-copper/20 text-copper font-medium'
                          : 'hover:bg-cream/50 text-terracotta'}`}
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
                  className="flex items-center p-2 rounded-lg bg-cream hover:bg-copper/20 transition-all duration-300"
                  aria-label={t("User menu", "navbar")}
                >
                  <HiOutlineUser className="text-xl text-terracotta" />
                  <span className="hidden md:block font-medium font-inter truncate max-w-[120px] text-sm ml-2 text-terracotta">
                    {userInfo?.name || t("User", "navbar")}
                  </span>
                  <HiOutlineChevronDown className="ml-1 text-sm text-terracotta hidden md:block" />
                </motion.button>

                <AnimatePresence>
                  {userToggledMenu && userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute right-0 mt-2 w-48 rounded-lg py-2 z-[2010] ${themeStyles.languageMenu}`}
                    >
                      <Link 
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block w-full text-left px-4 py-2 text-sm font-inter text-terracotta hover:bg-copper/20"
                      >
                        {t("My Profile", "navbar")}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm font-inter text-red-700 hover:bg-red-50"
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
                className="p-2 rounded-lg bg-cream hover:bg-copper/20 transition-all duration-300"
                aria-label={t("Login", "navbar")}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <HiOutlineUser className="text-xl text-terracotta" />
                </motion.div>
              </Link>
            )}
          </div>

          <Link
            to="/cart"
            className="p-2 rounded-lg bg-cream hover:bg-copper/20 transition-all duration-300 relative"
            aria-label={t("Shopping Cart", "navbar") + ` ${cartItemCount}`}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <HiOutlineShoppingCart className="text-xl text-terracotta" />
              <AnimatePresence>
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-copper text-cream text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="lg:hidden p-2 rounded-lg bg-cream hover:bg-copper/20 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? t("Close", "common") : t("Open", "common") + " " + t("menu", "common")}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <HiOutlineX className="text-xl text-terracotta" /> : <HiOutlineMenu className="text-xl text-terracotta" />}
          </motion.button>
        </div>
      </div>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={`lg:hidden shadow-md overflow-hidden ${themeStyles.mobileMenu}`}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ 
              x: 0, 
              opacity: 1,
              transition: {
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }
            }}
            exit={{ 
              x: "100%", 
              opacity: 0,
              transition: {
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }
            }}
          >
            <nav className="flex flex-col p-8 space-y-4 w-full">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: 20 }}
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
                    className={`flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-300 text-center
                      ${location.pathname === link.to
                        ? themeStyles.activeLink
                        : 'hover:text-copper text-terracotta'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={location.pathname === link.to ? "page" : undefined}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="ml-3 font-medium font-inter text-lg">{link.text}</span>
                  </Link>
                  {index < navLinks.length - 1 && (
                    <div className={`border-b ${theme === 'light' ? 'border-terracotta/30' : 'border-terracotta/30'} my-2`} />
                  )}
                </motion.div>
              ))}
              
              {isAuthenticated && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
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
                      className="flex w-full items-center justify-center px-4 py-3 rounded-lg text-copper transition-all duration-300 hover:bg-copper/20"
                    >
                      <span className="text-xl"><HiOutlineUser /></span>
                      <span className="ml-3 font-medium font-inter text-lg">{t("My Profile", "navbar")}</span>
                    </Link>
                    <div className={`border-b ${theme === 'light' ? 'border-terracotta/30' : 'border-terracotta/30'} my-2`} />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
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
                      className="flex w-full items-center justify-center px-4 py-3 rounded-lg text-red-700 hover:bg-red-50 transition-all duration-300"
                    >
                      <span className="text-xl"><HiOutlineUser /></span>
                      <span className="ml-3 font-medium font-inter text-lg">{t("Logout", "navbar")}</span>
                    </button>
                    <div className={`border-b ${theme === 'light' ? 'border-terracotta/30' : 'border-terracotta/30'} my-2`} />
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
                className="pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-terracotta text-cream py-3 px-6 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-copper"
                >
                  <HiOutlineX className="mr-2" />
                  <span className="text-lg font-inter">{t("Close Menu", "common")}</span>
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