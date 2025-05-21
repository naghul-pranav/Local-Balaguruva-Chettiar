import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineArrowUp, HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker } from "react-icons/hi";
import { FaPhoneAlt } from 'react-icons/fa';
import { useTranslation } from "../utils/TranslationContext";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t } = useTranslation();
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Show scroll button when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20,
      },
    },
  };

  // Schema.org JSON-LD for contact information
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "K.Balaguruva Chettiar Son's Co",
    "description": "Providing high-quality cookware for all your kitchen needs",
    "url": "https://balaguruvachettiarsons.com",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91 98427 85156",
      "email": "contact.balaguruvachettiarsons@gmail.com",
      "contactType": "customer service",
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "97, Agraharam Street",
      "addressLocality": "Erode",
      "addressRegion": "Tamil Nadu",
      "postalCode": "638001",
      "addressCountry": "India",
    },
  };

  const links = [
    { name: t("Home", "navbar"), path: '/' },
    { name: t("Products", "navbar"), path: '/products' },
    { name: t("About", "navbar"), path: '/about' },
    { name: t("Contact", "navbar"), path: '/contact' },
    { name: t("Cart", "navbar"), path: '/cart' },
  ];

  return (
    <footer 
  className="bg-[#FDF6F0] bg-gradient-to-br from-[#FDF6F0] to-terracotta/30 text-gray-800 py-12 relative mt-auto shadow-inner" 
  style={{ background: 'linear-gradient(to bottom right, #FDF6F0, rgba(193, 68, 56, 0.3))', backgroundColor: '#FDF6F0' }} 
  role="contentinfo" 
  aria-label="Site footer"
>
      <script type="application/ld+json">
        {JSON.stringify(contactSchema)}
      </script>
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Scroll to top button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              onClick={scrollToTop}
              className="fixed right-6 bottom-6 z-50 bg-terracotta p-3 rounded-full shadow-lg hover:bg-copper hover:border-2 hover:border-terracotta transition-colors duration-300"
              whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(193, 68, 56, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              aria-label="Scroll to top"
            >
              <HiOutlineArrowUp className="text-cream text-xl" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <motion.div variants={itemVariants} className="space-y-4 text-center lg:text-left">
            <motion.h3 
              className="text-2xl font-bold italic font-playfair text-terracotta"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              {t("K.Balaguruva Chettiar Son's Co", "footer")}
            </motion.h3>
            <p className="text-gray-700 text-sm leading-relaxed font-inter">
              {t("Providing high-quality cookwares for all your kitchen needs", "footer")}
            </p>
            <ul className="space-y-2">
              <motion.li 
                variants={itemVariants} 
                className="flex items-center justify-center lg:justify-start space-x-2 text-gray-700 text-sm font-inter"
              >
                <span className="text-terracotta text-base">•</span>
                <span>{t("Over 50 years of craftsmanship excellence", "footer")}</span>
              </motion.li>
              <motion.li 
                variants={itemVariants} 
                className="flex items-center justify-center lg:justify-start space-x-2 text-gray-700 text-sm font-inter"
              >
                <span className="text-terracotta text-base">•</span>
                <span>{t("Trusted by thousands of households", "footer")}</span>
              </motion.li>
              <motion.li 
                variants={itemVariants} 
                className="flex items-center justify-center lg:justify-start space-x-2 text-gray-700 text-sm font-inter"
              >
                <span className="text-terracotta text-base">•</span>
                <span>{t("Committed to sustainable practices", "footer")}</span>
              </motion.li>
            </ul>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-4 text-center lg:text-left">
            <h3 className="text-xl font-semibold text-terracotta font-playfair">{t("Quick Links", "footer")}</h3>
            <ul className="space-y-2">
              {links.map((link, index) => (
                <motion.li 
                  key={link.name} 
                  variants={itemVariants} 
                  whileHover={{ x: 5, transition: { type: "spring", stiffness: 300 } }}
                >
                  <Link 
                    to={link.path} 
                    className="text-gray-700 hover:text-copper transition-colors duration-300 flex items-center justify-center lg:justify-start space-x-2 text-sm font-inter"
                    aria-label={link.name}
                  >
                    <span className="text-terracotta text-base">→</span>
                    <span>{link.name}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Links */}
          <motion.div variants={itemVariants} className="space-y-4 text-center lg:text-left">
            <h3 className="text-xl font-semibold text-terracotta font-playfair">{t("Contact Us", "footer")}</h3>
            <div className="space-y-2">
              <motion.a 
                href="tel:+919842785156" 
                whileHover={{ x: 5, color: "#B87333" }} 
                className="flex items-center justify-center lg:justify-start space-x-2 text-gray-700 text-sm transition-colors duration-300 font-inter"
                aria-label="Phone number 1"
              >
                <HiOutlinePhone className="text-terracotta text-base" />
                <span>+91 98427 85156</span>
              </motion.a>
              <motion.a 
                href="tel:+914242210189" 
                whileHover={{ x: 5, color: "#B87333" }} 
                className="flex items-center justify-center lg:justify-start space-x-2 text-gray-700 text-sm transition-colors duration-300 font-inter"
                aria-label="Phone number 2"
              >
                <FaPhoneAlt className="text-terracotta text-base" />
                <span>0424-2210189</span>
              </motion.a>
              <motion.a 
                href="tel:+914242217607" 
                whileHover={{ x: 5, color: "#B87333" }} 
                className="flex items-center justify-center lg:justify-start space-x-2 text-gray-700 text-sm transition-colors duration-300 font-inter"
                aria-label="Phone number 3"
              >
                <FaPhoneAlt className="text-terracotta text-base" />
                <span>0424-2217607</span>
              </motion.a>
              <motion.a 
                href="mailto:contact.balaguruvachettiarsons@gmail.com" 
                whileHover={{ x: 5, color: "#B87333" }} 
                className="flex items-center justify-center lg:justify-start space-x-2 text-gray-700 text-sm transition-colors duration-300 font-inter"
                aria-label="Email address"
              >
                <HiOutlineMail className="text-terracotta text-base" />
                <span>contact.balaguruvachettiarsons@gmail.com</span>
              </motion.a>
              <motion.a 
                href="https://www.google.com/maps/dir//K.+Balaguruva+Chettiar+Firm,+97+Agraharam+Street,+Erode,+Tamil+Nadu+638001/@11.3408616,77.7247373,17z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3ba96f440bae951d:0x91c04bcc1158f4c9!2m2!1d77.7296082!2d11.3408564?entry=ttu&g_ep=EgoyMDI1MDUxMS4wIKXMDSoASAFQAw%3D%3D" 
                whileHover={{ x: 5, color: "#B87333" }} 
                className="flex items-center justify-center lg:justify-start space-x-2 text-gray-700 text-sm transition-colors duration-300 font-inter"
                aria-label="Business address"
              >
                <HiOutlineLocationMarker className="text-terracotta text-base" />
                <span>{t("97, Agraharam Street, Erode", "footer")}</span>
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          variants={itemVariants}
          className="mt-8 pt-6 border-t border-copper text-center w-full"
        >
          <motion.p 
            className="text-gray-600 text-sm font-inter"
            whileHover={{ scale: 1.02 }}
          >
            © {new Date().getFullYear()} {t("K.Balaguruva Chettiar Son's Co", "footer")}. {t("All rights reserved.", "footer")} {t("Made with", "footer")}{' '}
            <motion.span 
              initial={{ scale: 1 }}
              animate={{ 
                scale: [1, 1.2, 1],
                transition: { 
                  repeat: Infinity, 
                  repeatType: "loop", 
                  duration: 2,
                  repeatDelay: 1,
                } 
              }}
              className="inline-block text-terracotta"
            >
              ♥
            </motion.span>{' '}
            {t("for quality products.", "footer")}
          </motion.p>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;