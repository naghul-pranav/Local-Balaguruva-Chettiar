import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import {
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaWhatsapp,
  FaMobile, FaBuilding, FaFacebook, FaInstagram,
  FaLinkedin, FaTwitter, FaPaperPlane, FaClock,
  FaArrowUp, FaDownload, FaCheck
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
      className="fixed top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-purple-600 origin-left z-50"
      style={{ scaleX }}
    />
  );
};

// Animated Background
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-100 opacity-30"
          initial={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, scale: Math.random() * 0.5 + 0.5 }}
          animate={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, scale: Math.random() * 0.5 + 0.5 }}
          transition={{ duration: Math.random() * 20 + 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          style={{ width: `${Math.random() * 300 + 100}px`, height: `${Math.random() * 300 + 100}px` }}
        />
      ))}
    </div>
  );
};

// Back to Top Button
const BackToTopButton = () => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);
  
  React.useEffect(() => {
    const unsubscribe = scrollYProgress.onChange(v => {
      setVisible(v > 0.2);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-blue-600 text-white rounded-full shadow-xl z-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Back to top"
        >
          <FaArrowUp />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// Business Card Component
const ContactCard = ({ t }) => {
  const handleDownload = () => {
  const link = document.createElement('a');
  link.href = '/documents/Contact Card - Balaguruva Chettiar Sons Co.pdf';
  link.download = 'Contact Card - Balaguruva Chettiar Sons Co.pdf'; // Optional: Specifies the downloaded file name
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
  
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-xl shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -translate-x-10 -translate-y-10" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-5 rounded-full translate-x-5 translate-y-5" />
      
      <h3 className="text-xl font-bold mb-4">{t("Balaguruva Chettiar Son's Co", "contact")}</h3>
      <div className="space-y-3">
        <div className="flex items-center">
          <FaPhone className="mr-3 text-blue-200" /> 
          <span>+91 98427 85156</span>
        </div>
        <div className="flex items-center">
          <FaEnvelope className="mr-3 text-blue-200" /> 
          <span>contact.balaguruvachettiarsons@gmail.com</span>
        </div>
        <div className="flex items-center">
          <FaMapMarkerAlt className="mr-3 text-blue-200" /> 
          <span className="text-sm">{t("97, Agraharam Street, Erode", "contact")}</span>
        </div>
      </div>
      <motion.button
        onClick={handleDownload}
        className="mt-4 bg-white text-blue-800 px-4 py-2 rounded flex items-center justify-center w-full"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <FaDownload className="mr-2" /> {t('Save Contact', 'contact')}
      </motion.button>
    </motion.div>
  );
};

// Business Hours Component
const BusinessHours = ({ t }) => {
  const hours = [
    { day: t('Monday', 'contact'), hours: '10:00 AM - 8:00 PM' },
    { day: t('Tuesday', 'contact'), hours: '10:00 AM - 8:00 PM' },
    { day: t('Wednesday', 'contact'), hours: '10:00 AM - 8:00 PM' },
    { day: t('Thursday', 'contact'), hours: '10:00 AM - 8:00 PM' },
    { day: t('Friday', 'contact'), hours: '10:00 AM - 8:00 PM' },
    { day: t('Saturday', 'contact'), hours: '10:00 AM - 8:00 PM' },
    { day: t('Sunday', 'contact'), hours: t('Closed', 'contact') },
  ];
  
  const today = new Date().getDay(); // 0 is Sunday, 6 is Saturday
  
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="bg-white/90 p-6 rounded-xl shadow-xl mt-6"
    >
      <div className="flex items-center space-x-3 mb-4">
        <motion.div 
          className="p-2 bg-amber-100 rounded-lg text-amber-600"
          whileHover={{ scale: 1.1, rotate: 15 }}
        >
          <FaClock size={20} />
        </motion.div>
        <h3 className="text-xl font-bold text-amber-700">{t('Business Hours', 'contact')}</h3>
      </div>
      <div className="space-y-2">
        {hours.map((item, index) => (
          <div 
            key={index}
            className={`flex justify-between py-2 border-b border-gray-100 ${today === (index === 6 ? 0 : index + 1) ? 'font-bold text-blue-700' : ''}`}
          >
            <span>{item.day}</span>
            <span>{item.hours}</span>
          </div>
        ))}
      </div>
    </motion.div>
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
          error ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
      className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-gray-100"
    >
      {/* Map overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/30 pointer-events-none z-10"></div>
      
      {/* Map loading state */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-5">
          <div className="text-center">
            <motion.div 
              className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full inline-block mb-3" 
              animate={{ rotate: 360 }} 
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
            />
            <p className="text-blue-600">{t('Loading map...', 'contact')}</p>
          </div>
        </div>
      )}

      
      
      {/* Responsive map container with aspect ratio */}
      <div className="w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[21/9] relative">
        <iframe
          title="Balaguruva Chettiar Son's Co"
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

  // State Management
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const contactNumbers = [
    { 
      type: t('Office', 'contact'), 
      number: "+91 9842785156", 
      icon: FaPhone, 
      iconColor: "text-emerald-600", 
      bgColor: "from-emerald-50 to-teal-50" 
    },
    { 
      type: t('Mobile', 'contact'), 
      number: "+91 9842785156", 
      icon: FaMobile, 
      iconColor: "text-blue-600", 
      bgColor: "from-blue-50 to-indigo-50" 
    },
    { 
      type: t('WhatsApp', 'contact'), 
      number: "+91 9842785156", 
      icon: FaWhatsapp, 
      iconColor: "text-green-600", 
      bgColor: "from-green-50 to-emerald-50" 
    }
  ];

  // Form field labels and placeholders
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

  // Phone number formatting
  const formatPhoneNumber = (value) => {
    // Format for Indian phone numbers
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    if (phoneNumber.length < 5) return phoneNumber;
    if (phoneNumber.length < 10) {
      return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4)}`;
    }
    return `${phoneNumber.slice(0, 5)}-${phoneNumber.slice(5, 10)}`;
  };

  // Form Validation
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

  // Success Message Component
  const SuccessMessage = () => (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.8 }}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-gray-800 p-8 rounded-lg shadow-2xl z-50 min-w-[320px] max-w-md"
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
          className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4"
        >
          <FaCheck className="text-white text-2xl" />
        </motion.div>
        <h4 className="text-2xl font-bold mb-2">{t('Thank you!', 'contact')}</h4>
        <p className="text-gray-600 mb-4">{t('Your message has been sent successfully!', 'contact')}</p>
        <motion.p className="text-sm text-gray-500">{t('We will get back to you soon.', 'contact')}</motion.p>
      </div>
    </motion.div>
  );

  // Event Handlers
  const handleChange = (e) => {
    let value = e.target.value;
    
    // Apply formatting for phone input
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
      // Find first error element and focus it
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = formRef.current.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) errorElement.focus();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Prepare data - strip formatting from phone
      const submissionData = {
        ...formData,
        phone: formData.phone.replace(/[^\d]/g, '')
      };
      
      const response = await fetch("http://localhost:5008/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.details || data.error || "Error submitting form");

      setShowSuccess(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Announce success to screen readers
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
  const handlePhoneClick = () => window.location.href = "tel:+919842785156";
  const handleAddressClick = () => window.open("https://www.google.com/maps/dir//K.+Balaguruva+Chettiar+Firm,+90+Agraharam+Street,+Opposite+To+Rajan+Textiles,+Erode,+Tamil+Nadu+638001/@11.3408616,77.7247373,17z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3ba96f440bae951d:0x91c04bcc1158f4c9!2m2!1d77.7296082!2d11.3408564?entry=ttu&g_ep=EgoyMDI1MDUxMS4wIKXMDSoASAFQAw%3D%3D", "_blank");

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="p-6 min-h-screen relative">
      <AnimatedBackground />
      <ScrollProgressBar />
      <BackToTopButton />
      <AnimatePresence>{showSuccess && <SuccessMessage />}</AnimatePresence>

      {/* Page Title */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mb-12 text-center">
        <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">{t('Get in Touch With Us', 'contact')}</motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 0.4 }} className="text-gray-600 max-w-lg mx-auto">{t('Have questions or want to discuss your requirements? We\'re here to help!', 'contact')}</motion.p>
      </motion.div>

      {/* Contact Form and Info */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Contact Form */}
          <motion.div variants={fadeInUp} className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-xl" whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}>
            <div className="flex items-center space-x-3 mb-6">
              <motion.div className="p-2 bg-blue-100 rounded-lg text-blue-600" whileHover={{ scale: 1.1, rotate: 15 }}><FaPaperPlane size={20} /></motion.div>
              <h3 className="text-2xl font-bold text-blue-700">{t('Send us a Message', 'contact')}</h3>
            </div>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 relative" noValidate>
              <AnimatePresence>
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 rounded-xl"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <div className="text-center">
                      <motion.div 
                        className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full inline-block" 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
                      />
                      <p className="mt-2 text-blue-600 font-medium">{t('Sending...', 'contact')}</p>
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
                    errors.message ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-lg flex items-center justify-center font-medium text-lg" 
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

          {/* Contact Info */}
          <motion.div variants={fadeInUp} className="space-y-6">
            <motion.div className="bg-white/90 p-6 rounded-xl shadow-xl" whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}>
              <div className="flex items-center space-x-3 mb-6">
                <motion.div className="p-2 bg-blue-100 rounded-lg text-blue-600" whileHover={{ scale: 1.1, rotate: 15 }}><FaMapMarkerAlt size={20} /></motion.div>
                <h3 className="text-2xl font-bold text-blue-700">{t('Contact Information', 'contact')}</h3>
              </div>
              <motion.div variants={containerVariants} className="space-y-6">
                {contactNumbers.map((contact, index) => (
                  <motion.div 
                    key={index} 
                    variants={itemVariants} 
                    whileHover={{ scale: 1.03 }} 
                    className={`flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r ${contact.bgColor} cursor-pointer`} 
                    onClick={() => window.location.href = `tel:${contact.number}`}
                  >
                    <div className={`p-3 rounded-full ${contact.iconColor} bg-white`}><contact.icon className="text-xl" /></div>
                    <div><p className="font-semibold text-gray-800">{contact.type}</p><p className="text-gray-600">{contact.number}</p></div>
                  </motion.div>
                ))}
                <motion.div variants={itemVariants} whileHover={{ scale: 1.03 }} className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 cursor-pointer" onClick={handleEmailClick}>
                  <div className="p-3 rounded-full text-purple-600 bg-white"><FaEnvelope className="text-xl" /></div>
                  <div><p className="font-semibold text-gray-800">{t('Email', 'contact')}</p><p className="text-gray-600">contact.balaguruvachettiarsons@gmail.com</p></div>
                </motion.div>
                <motion.div variants={itemVariants} whileHover={{ scale: 1.03 }} className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 cursor-pointer" onClick={handleAddressClick}>
                  <div className="p-3 rounded-full text-indigo-600 bg-white"><FaBuilding className="text-xl" /></div>
                  <div><p className="font-medium">{t('Address', 'contact')}</p><p>97, Agraharam Street, Erode, Tamil Nadu 639003</p></div>
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Contact Card */}
            <ContactCard t={t} />
            
            {/* Business Hours */}
            <BusinessHours t={t} />
          </motion.div>
        </div>
      </div>

      {/* Map with improved responsiveness and UI */}
      <div className="max-w-7xl mx-auto px-0 sm:px-4 mb-12">
        <motion.h3 
          variants={fadeInUp} 
          className="text-2xl font-bold mb-4 text-gray-800 flex items-center"
        >
          <FaMapMarkerAlt className="mr-2 text-blue-600" />
          {t('Find Us', 'contact')}
        </motion.h3>
        <LocationMap t={t} />
      </div>
    </motion.div>
  );
};

export default ContactPage;