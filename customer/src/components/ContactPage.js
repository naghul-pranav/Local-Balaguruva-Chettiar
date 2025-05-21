import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import {
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaWhatsapp,
  FaMobile, FaBuilding, FaPaperPlane, FaArrowUp, FaDownload, FaCheck
} from "react-icons/fa";
import { useTranslation } from "../utils/TranslationContext";

// Scroll Progress Bar
const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF6F61] to-[#FF9B94] origin-left z-50"
      style={{ scaleX }}
    />
  );
};

// Animated Background (Wave Pattern)
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_#FF6F61_0%,_transparent_50%)] opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,_#FF9B94_0%,_transparent_50%)] opacity-10" />
    </div>
  );
};

// Form Input Component
const FormInput = ({ id, name, type, label, value, onChange, error, placeholder, required = true }) => {
  return (
    <motion.div variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 }
    }}>
      <label htmlFor={id} className="block mb-2 font-medium text-gray-700">{label}</label>
      <input 
        type={type} 
        id={id} 
        name={name} 
        value={value} 
        onChange={onChange} 
        required={required}
        aria-invalid={error ? true : false}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full p-3 border rounded-lg transition-colors ${
          error ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-[#FF6F61] focus:ring-2 focus:ring-[#FF6F61]/20"
        }`} 
        placeholder={placeholder} 
      />
      {error && (
        <motion.p 
          id={`${id}-error`}
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="mt-1 text-red-500 text-sm flex items-center gap-1"
        >
          <span aria-hidden="true">⚠️</span> {error}
        </motion.p>
      )}
    </motion.div>
  );
};

// Map Component with enhanced UI and responsiveness
const LocationMap = ({ t }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.7 }}
      className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-gray-100 border-2 border-[#FF6F61]/20"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FF6F61]/10 pointer-events-none z-10"></div>
      
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-5">
          <div className="text-center">
            <motion.div 
              className="w-12 h-12 border-4 border-[#FF6F61]/20 border-t-[#FF6F61] rounded-full inline-block mb-3" 
              animate={{ rotate: 360 }} 
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
            />
            <p className="text-[#FF6F61]">{t('Loading map...', 'contact')}</p>
          </div>
        </div>
      )}

      <div className="w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[21/9] relative">
        <iframe
          title="K.Balaguruva Chettiar Son's Co"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3911.915857751505!2d77.72510208885495!3d11.3408564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba96f440bae951d%3A0x91c04bcc1158f4c9!2sK.%20Balaguruva%20Chettiar%20Firm!5e0!3m2!1sen!2sin!4v1744352571923!5m2!1sen!2sin"
          width="100%" 
          height="100%" 
          style={{ border: 0, position: 'absolute', top: 0, left: 0 }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setMapLoaded(true)}
          className="w-full h-full"
        />
      </div>
    </motion.div>
  );
};

// Main Contact Page Component
const ContactPage = () => {
  const { t } = useTranslation();
  const formRef = useRef(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const formFields = {
    name: {
      label: t('Full Name', 'home'),
      placeholder: t('Your name', 'contact'),
      error: t('Name is required', 'contact')
    },
    email: {
      label: t('Email', 'contact'),
      placeholder: t('your.email@example.com', 'contact'),
      error: t('Invalid email address', 'contact')
    },
    phone: {
      label: t('Phone Number', 'contact'),
      placeholder: t('Your phone number', 'contact'),
      error: t('Please enter a valid 10-digit phone number', 'contact')
    },
    subject: {
      label: t('Subject', 'contact'),
      placeholder: t('What is this about?', 'contact'),
      error: t('Subject is required', 'contact')
    },
    message: {
      label: t('Message', 'contact'),
      placeholder: t('Write your message here...', 'contact'),
      error: t('Message is required', 'contact')
    }
  };

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    if (phoneNumber.length < 5) return phoneNumber;
    if (phoneNumber.length < 10) {
      return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4)}`;
    }
    return `${phoneNumber.slice(0, 5)}-${phoneNumber.slice(5, 10)}`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = formFields.name.error;
    if (!formData.email.trim()) newErrors.email = formFields.email.error;
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) newErrors.email = formFields.email.error;
    if (!formData.phone.trim()) newErrors.phone = formFields.phone.error;
    else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[^\d]/g, ''))) newErrors.phone = formFields.phone.error;
    if (!formData.subject.trim()) newErrors.subject = formFields.subject.error;
    if (!formData.message.trim()) newErrors.message = formFields.message.error;
    return newErrors;
  };

  const SuccessMessage = () => (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.8 }}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#FFF8E7] text-gray-800 p-8 rounded-lg shadow-2xl z-50 min-w-[320px] max-w-md"
    >
      <div className="flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ 
            type: "spring", 
            stiffness: 200,
            delay: 0.2,
          }} 
          className="w-16 h-16 bg-gradient-to-r from-[#FF6F61] to-[#FF9B94] rounded-full flex items-center justify-center mb-4"
        >
          <FaCheck className="text-white text-2xl" />
        </motion.div>
        <h4 className="text-2xl font-bold mb-2">{t('Thank you!', 'contact')}</h4>
        <p className="text-gray-600 mb-4">{t('Your message has been sent successfully!', 'contact')}</p>
        <motion.p className="text-sm text-gray-500">{t('We will get back to you soon.', 'contact')}</motion.p>
      </div>
    </motion.div>
  );

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'phone') {
      value = formatPhoneNumber(value);
    }
    setFormData({ ...formData, [e.target.name]: value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = formRef.current.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) errorElement.focus();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const submissionData = {
        ...formData,
        phone: formData.phone.replace(/[^\d]/g, '')
      };
      
      const response = await fetch("https://final-balaguruva-chettiar-ecommerce.onrender.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error || "Error submitting form");

      setShowSuccess(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setShowSuccess(false), 3000);
      
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('role', 'alert');
      announcement.textContent = t('Your message has been sent successfully!', 'contact');
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 3000);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailClick = () => window.location.href = "mailto:contact.balaguruvachettiarsons@gmail.com";
  const handlePhoneClick = (number) => window.location.href = `tel:${number}`;
  const handleAddressClick = () => window.open("https://www.google.com/maps/dir//K.+Balaguruva+Chettiar+Firm,+90+Agraharam+Street,+Opposite+To+Rajan+Textiles,+Erode,+Tamil+Nadu+638001/@11.3408616,77.7247373,17z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3ba96f440bae951d:0x91c04bcc1158f4c9!2m2!1d77.7296082!2d11.3408564?entry=ttu&g_ep=EgoyMDI1MDUxMS4wIKXMDSoASAFQAw%3D%3D", "_blank");

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/documents/Contact Card - K.Balaguruva Chettiar Sons Co.pdf';
    link.download = 'Contact Card - K.Balaguruva Chettiar Sons Co.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={containerVariants} 
      className="min-h-[calc(100vh-12rem)] flex flex-col bg-[#FFF8E7] bg-gradient-to-b from-[#FFF8E7] to-[#FDF6F0]"
      style={{ background: 'linear-gradient(to bottom, #FFF8E7, #FDF6F0)', backgroundColor: '#FFF8E7' }}
    >
      <AnimatedBackground />
      <ScrollProgressBar />
      <AnimatePresence>{showSuccess && <SuccessMessage />}</AnimatePresence>

      {/* Main Content */}
      <div className="flex-grow">
        {/* Page Title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }} 
          className="text-center pt-6"
        >
          <motion.h2 
            variants={fadeInUp} 
            className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-[#FF6F61] to-[#FF9B94]"
          >
            {t('Contact Us', 'contact')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.8 }} 
            transition={{ delay: 0.4 }} 
            className="text-gray-600 max-w-lg mx-auto mb-12"
          >
            {t('Have questions or want to discuss your requirements? We\'re here to help!', 'contact')}
          </motion.p>
        </motion.div>

        {/* Contact Form and Info */}
        <div className="max-w-7xl mx-auto mb-16 px-4 sm:px-6 lg:px-8">
          {/* Send us a Message - Full Width */}
          <motion.div 
            variants={fadeInUp} 
            className="bg-[#FFF8E7] p-8 rounded-xl shadow-xl mb-12" 
            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <motion.div 
                className="p-2 bg-[#FF6F61]/10 rounded-lg text-[#FF6F61]" 
                whileHover={{ scale: 1.1, rotate: 15 }}
              >
                <FaPaperPlane size={20} />
              </motion.div>
              <h3 className="text-2xl font-bold text-[#FF6F61]">{t('Send us a Message', 'contact')}</h3>
            </div>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 relative" noValidate>
              <AnimatePresence>
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="absolute inset-0 bg-[#FFF8E7]/70 flex items-center justify-center z-20 rounded-xl"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <div className="text-center">
                      <motion.div 
                        className="w-16 h-16 border-4 border-[#FF6F61]/20 border-t-[#FF6F61] rounded-full inline-block" 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
                      />
                      <p className="mt-2 text-[#FF6F61] font-medium">{t('Sending...', 'contact')}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid md:grid-cols-2 gap-6">
                <FormInput
                  id="name"
                  name="name"
                  type="text"
                  label={formFields.name.label}
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder={formFields.name.placeholder}
                />
                <FormInput
                  id="phone"
                  name="phone"
                  type="tel"
                  label={formFields.phone.label}
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder={formFields.phone.placeholder}
                />
              </div>
              <FormInput
                id="email"
                name="email"
                type="email"
                label={formFields.email.label}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder={formFields.email.placeholder}
              />
              <FormInput
                id="subject"
                name="subject"
                type="text"
                label={formFields.subject.label}
                value={formData.subject}
                onChange={handleChange}
                error={errors.subject}
                placeholder={formFields.subject.placeholder}
              />
              <motion.div variants={itemVariants}>
                <label htmlFor="message" className="block mb-2 font-medium text-gray-700">{formFields.message.label}</label>
                <textarea 
                  id="message" 
                  name="message" 
                  value={formData.message} 
                  onChange={handleChange} 
                  required 
                  rows="5" 
                  aria-invalid={errors.message ? true : false}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className={`w-full p-3 border rounded-lg transition-colors ${
                    errors.message ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-[#FF6F61] focus:ring-2 focus:ring-[#FF6F61]/20"
                  }`} 
                  placeholder={formFields.message.placeholder} 
                />
                {errors.message && (
                  <motion.p 
                    id="message-error"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="mt-1 text-red-500 text-sm flex items-center gap-1"
                  >
                    <span aria-hidden="true">⚠️</span> {errors.message}
                  </motion.p>
                )}
              </motion.div>
              <motion.button 
                type="submit" 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.97 }} 
                className="w-full bg-gradient-to-r from-[#FF6F61] to-[#FF9B94] text-white px-8 py-4 rounded-lg flex items-center justify-center font-medium text-lg" 
                disabled={isLoading}
              >
                <FaPaperPlane className="mr-2" /> {isLoading ? t('Sending...', 'contact') : t('Send Message', 'contact')}
              </motion.button>
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md"
                  role="alert"
                >
                  <p className="text-red-600 flex items-center gap-2">
                    <span aria-hidden="true">⚠️</span> {errorMessage}
                  </p>
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Contact Information - Full Width with Left/Right Split */}
          <motion.div 
            variants={fadeInUp} 
            className="bg-[#FFF8E7] p-8 rounded-xl shadow-xl mb-12" 
            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <motion.div 
                className="p-2 bg-[#FF6F61]/10 rounded-lg text-[#FF6F61]" 
                whileHover={{ scale: 1.1, rotate: 15 }}
              >
                <FaMapMarkerAlt size={20} />
              </motion.div>
              <h3 className="text-2xl font-bold text-[#FF6F61]">{t('Contact Information', 'contact')}</h3>
            </div>
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Side: Office and Mobile */}
              <div className="space-y-6">
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, x: -50 },
                    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
                  }}
                  whileHover={{ scale: 1.03 }} 
                  className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-[#FFF8E7] to-[#FF6F61]/20 cursor-pointer" 
                  onClick={() => handlePhoneClick("+914242210189")}
                >
                  <div className="p-3 rounded-full text-[#FF6F61] bg-white"><FaPhone className="text-xl" /></div>
                  <div>
                    <p className="font-semibold text-gray-800">{t('Office', 'contact')}</p>
                    <p className="text-gray-600">+91 4242210189</p>
                  </div>
                </motion.div>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, x: -50 },
                    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
                  }}
                  whileHover={{ scale: 1.03 }} 
                  className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-[#FFF8E7] to-[#FF6F61]/20 cursor-pointer" 
                  onClick={() => handlePhoneClick("+919842785156")}
                >
                  <div className="p-3 rounded-full text-[#FF6F61] bg-white"><FaMobile className="text-xl" /></div>
                  <div>
                    <p className="font-semibold text-gray-800">{t('Mobile', 'contact')}</p>
                    <p className="text-gray-600">+91 9842785156</p>
                  </div>
                </motion.div>
              </div>
              {/* Right Side: Email and Address */}
              <div className="space-y-6">
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, x: 50 },
                    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
                  }}
                  whileHover={{ scale: 1.03 }} 
                  className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-[#FFF8E7] to-[#FF6F61]/20 cursor-pointer" 
                  onClick={handleEmailClick}
                >
                  <div className="p-3 rounded-full text-[#FF6F61] bg-white"><FaEnvelope className="text-xl" /></div>
                  <div>
                    <p className="font-semibold text-gray-800">{t('Email', 'contact')}</p>
                    <p className="text-gray-600">contact.balaguruvachettiarsons@gmail.com</p>
                  </div>
                </motion.div>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, x: 50 },
                    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
                  }}
                  whileHover={{ scale: 1.03 }} 
                  className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-[#FFF8E7] to-[#FF6F61]/20 cursor-pointer" 
                  onClick={handleAddressClick}
                >
                  <div className="p-3 rounded-full text-[#FF6F61] bg-white"><FaBuilding className="text-xl" /></div>
                  <div>
                    <p className="font-medium">{t('Address', 'contact')}</p>
                    <p className="text-gray-600">97, Agraharam Street, Erode, Tamil Nadu 638001</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            {/* Save Contact Button - Centered at Bottom */}
            <motion.div className="mt-8 flex justify-center">
              <motion.button
                onClick={handleDownload}
                className="bg-[#FFF8E7] text-[#FF6F61] px-6 py-3 rounded-lg flex items-center justify-center border border-[#FF6F61] shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaDownload className="mr-2" /> {t('Save Contact', 'contact')}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Map Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-0">
          <motion.h3 
            variants={fadeInUp} 
            className="text-2xl font-bold mb-4 text-gray-800 flex items-center"
          >
            <FaMapMarkerAlt className="mr-2 text-[#FF6F61]" />
            {t('Find Us', 'contact')}
          </motion.h3>
          <LocationMap t={t} />
        </div>
      </div>
    </motion.div>
  );
};

export default ContactPage;