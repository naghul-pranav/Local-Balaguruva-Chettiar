import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaArrowUp, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa"
import { useTranslation } from "../utils/TranslationContext"

const Footer = () => {
  const { t } = useTranslation();
  const [showScrollButton, setShowScrollButton] = useState(false)

  // Show scroll button when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  // Schema.org JSON-LD for contact information
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Balaguruva Chettiar Son's Co",
    "url": "https://tobeupdated.com",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91 98427 85156",
      "email": "contact.balaguruvachettiarsons@gmail.com",
      "contactType": "customer service"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "97, Agraharam Street",
      "addressLocality": "Erode",
      "addressRegion": "Tamil Nadu",
      "addressCountry": "India"
    }
  };

  const links = [
    { name: t("Home", "navbar"), path: '/' },
    { name: t("Products", "navbar"), path: '/products' },
    { name: t("About", "navbar"), path: '/about' },
    { name: t("Contact", "navbar"), path: '/contact' },
    { name: t("Cart", "navbar"), path: '/cart' }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-10 relative mt-auto" role="contentinfo" aria-label="Site footer">
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
              className="fixed right-8 bottom-8 z-50 bg-gradient-to-r from-teal-500 to-blue-500 p-3 rounded-full shadow-lg"
              whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(56, 178, 172, 0.6)" }}
              whileTap={{ scale: 0.9 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              aria-label="Scroll to top"
            >
              <FaArrowUp className="text-white text-xl" />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {/* Company Info */}
          <motion.div variants={itemVariants} className="space-y-4">
            <motion.h3 
              className="text-xl md:text-2xl font-bold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                {t("Balaguruva Chettiar Son's Co", "footer")}
              </span>
            </motion.h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              {t("Providing high-quality cookwares for all your kitchen needs", "footer")}
            </p>
            <div className="mt-4 space-y-2">
              <motion.a 
                href="tel:+919842785156" 
                whileHover={{ x: 5, color: "#4fd1c5" }} 
                className="flex items-center space-x-3 text-gray-300 hover:text-teal-400 transition-colors duration-300"
                aria-label="Phone number"
              >
                <FaPhone className="text-teal-400" />
                <span>+91 98427 85156</span>
              </motion.a>
              <motion.a 
                href="mailto:contact.balaguruvachettiarsons@gmail.com" 
                whileHover={{ x: 5, color: "#4fd1c5" }} 
                className="flex items-center space-x-3 text-gray-300 hover:text-teal-400 transition-colors duration-300"
                aria-label="Email address"
              >
                <FaEnvelope className="text-teal-400" />
                <span>contact.balaguruvachettiarsons@gmail.com</span>
              </motion.a>
              <motion.a 
                href="https://www.google.com/maps/dir//K.+Balaguruva+Chettiar+Firm,+90+Agraharam+Street,+Opposite+To+Rajan+Textiles,+Erode,+Tamil+Nadu+638001/@11.3408616,77.7247373,17z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3ba96f440bae951d:0x91c04bcc1158f4c9!2m2!1d77.7296082!2d11.3408564?entry=ttu&g_ep=EgoyMDI1MDUxMS4wIKXMDSoASAFQAw%3D%3D" 
                whileHover={{ x: 5, color: "#4fd1c5" }} 
                className="flex items-center space-x-3 text-gray-300 hover:text-teal-400 transition-colors duration-300"
                aria-label="Email address"
              >
                <FaMapMarkerAlt className="text-teal-400" />
                <span>{t("97, Agraharam Street, Erode", "footer")}</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-4 ml-40">
            <h3 className="text-xl font-bold text-white">{t("Quick Links", "footer")}</h3>
            <ul className="space-y-2">
              {links.map((link, index) => (
                <motion.li 
                  key={link.name} 
                  variants={itemVariants} 
                  whileHover={{ x: 8, transition: { type: "spring", stiffness: 300 } }}
                >
                  <a 
                    href={link.path} 
                    className="text-gray-300 hover:text-teal-400 transition-colors duration-300 flex items-center space-x-2"
                    aria-label={link.name}
                  >
                    <span className="text-teal-400">→</span>
                    <span>{link.name}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          variants={itemVariants}
          className="mt-8 pt-6 border-t border-gray-700/50 text-center"
        >
          <motion.p 
            className="text-gray-400 text-sm"
            whileHover={{ scale: 1.02 }}
          >
            © {new Date().getFullYear()} {t("Balaguruva Chettiar", "footer")}. {t("All rights reserved.", "footer")} {t("Made with", "footer")}{' '}
            <motion.span 
              initial={{ scale: 1 }}
              animate={{ 
                scale: [1, 1.2, 1],
                transition: { 
                  repeat: Infinity, 
                  repeatType: "loop", 
                  duration: 2,
                  repeatDelay: 1
                } 
              }}
              className="inline-block text-red-500"
            >
              ♥
            </motion.span>{' '}
            {t("for quality products.", "footer")}
          </motion.p>
        </motion.div>
      </motion.div>
    </footer>
  )
}

export default Footer