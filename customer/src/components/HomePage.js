"use client"
import { motion } from "framer-motion";
import { HiOutlineChevronDown } from "react-icons/hi";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "../utils/TranslationContext";
import { Link } from "react-router-dom";

// Material Card Component
const MaterialCard = ({ image, name, benefit }) => (
  <motion.div
    className="bg-cream p-8 rounded-lg shadow-md text-center hover:shadow-lg transition duration-300 relative border border-transparent hover:border-terracotta"
    whileHover={{ scale: 1.05, rotate: 2 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="mb-4 -mt-12">
      <img src={image} alt={name} className="w-full h-48 object-cover rounded-md shadow-md" />
    </div>
    <h3 className="text-xl md:text-2xl font-semibold mb-3 text-gray-800 font-playfair">{name}</h3>
    <p className="text-gray-600 font-inter">{benefit}</p>
  </motion.div>
);

// Testimonial Card Component
const TestimonialCard = ({ quote, customer }) => (
  <motion.div
    className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 border border-transparent hover:border-copper"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 200 }}
  >
    <p className="text-gray-600 italic mb-4 pl-6 relative font-inter">
      <span className="absolute -left-2 top-0 text-terracotta text-4xl">"</span>
      {quote}
    </p>
    <p className="text-terracotta font-semibold text-right font-inter">{customer}</p>
  </motion.div>
);

// Video Background Component
const VideoBackground = () => {
  const { t } = useTranslation();
  return (
    <div className="relative h-screen overflow-hidden">
      <video autoPlay muted loop className="absolute inset-0 w-full h-full object-cover min-w-full min-h-full">
        <source src="/images/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-end justify-start p-8 md:p-16">
        <motion.div
          className="text-left max-w-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-playfair">
            <span className="text-terracotta">{t("Welcome to K.Balaguruva Chettiar Son's Co", "home")}</span>
          </h1>
          <p className="text-lg md:text-xl text-teal-400 mb-8 font-inter">{t("Premium Quality Cookware Utensils for a Better Kitchen", "home")}</p>
          <Link to="/products">
            <motion.button
              className="border-2 border-terracotta text-orange-200 px-6 py-3 rounded-full font-semibold text-lg hover:bg-copper hover:text-orange-200 hover:border-copper transition duration-300 font-inter"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("Explore Our Products", "home")}
            </motion.button>
          </Link>
        </motion.div>
      </div>
      <motion.div
        className="absolute bottom-8 right-8"
        animate={{ y: [0, 10, 0], rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
      >
        <HiOutlineChevronDown className="text-cream text-4xl" />
      </motion.div>
    </div>
  );
};

// Cookware Materials Section
const CookwareMaterialsSection = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const materials = [
    {
      image: "/images/brass-material.jpg",
      name: t("Brass", "home"),
      benefit: t("Naturally enhances flavors and ensures even heat distribution for perfect cooking.", "home"),
    },
    {
      image: "/images/bronze-material.jpg",
      name: t("Bronze", "home"),
      benefit: t("Durable and resistant to corrosion, ideal for long-lasting traditional cookware.", "home"),
    },
    {
      image: "/images/cast-iron-material.jpg",
      name: t("Cast Iron", "home"),
      benefit: t("Retains heat exceptionally well, making it perfect for slow cooking and searing.", "home"),
    },
  ];

  return (
    <motion.section
      ref={ref}
      className="text-center px-4 md:px-16 py-20 bg-gradient-to-b from-white to-[#FFE6E6]"
      style={{ background: 'linear-gradient(to bottom, #FFFFFF, #FFE6E6)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair relative inline-block">
        <span className="text-terracotta">{t("Our Premium Cookware Materials", "home")}</span>
        <span className="absolute -bottom-2 left-0 w-full h-1 bg-copper rounded-full" />
      </h2>
      <p className="text-lg md:text-xl text-gray-600 mb-12 font-inter">
        {t("Explore the benefits of our high-quality materials used in crafting traditional cookware.", "home")}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {materials.map((material, index) => (
          <div
            key={index}
            className={index % 2 === 0 ? "mt-0" : "mt-8"}
          >
            <MaterialCard
              image={material.image}
              name={material.name}
              benefit={material.benefit}
            />
          </div>
        ))}
      </div>
    </motion.section>
  );
};

// Why Choose Us Section Component
const WhyChooseUsSection = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.section
      ref={ref}
      className="bg-cream py-20 px-6 md:px-16 rounded-lg shadow-lg flex flex-col md:flex-row items-center gap-12"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="md:w-1/2">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 font-playfair">
          <span className="text-terracotta">{t("Why Choose K.Balaguruva Chettiar Son's Co", "home")}</span>
        </h2>
        <ul className="space-y-6 text-gray-700 text-lg leading-relaxed font-inter relative pl-6">
          <span className="absolute left-0 top-0 w-1 h-full bg-terracotta rounded-full" />
          {[
            t("Wide range of cookware types including copper, brass, bronze, and ceramic cookwares", "home"),
            t("Customizable options to meet your specific requirements and preferences", "home"),
            t("Commitment to delivering consistent quality and customer satisfaction", "home"),
            t("Sustainable practices and eco-friendly options", "home"),
            t("Competitive pricing with a focus on timely and reliable delivery", "home"),
          ].map((item, index) => (
            <motion.li
              key={`item${index + 1}`}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 * (index + 1) }}
              className="relative"
            >
              <span className="absolute -left-6 text-terracotta">•</span>
              {item}
            </motion.li>
          ))}
        </ul>
      </div>
      <div className="md:w-1/2">
        <img src="/images/balaguruva.jpg" alt="K.Balaguruva Chettiar Son's Co Cookware" className="w-full h-64 object-cover rounded-lg" />
      </div>
    </motion.section>
  );
};

// Customer Testimonials Section
const CustomerTestimonialsSection = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const testimonials = [
    {
      quote: t("The copper kadai I bought is amazing! It heats evenly and makes cooking so much easier.", "home"),
      customer: t("Priya S., Chennai", "home"),
    },
    {
      quote: t("I love the brass pot from K.Balaguruva Chettiar. It’s perfect for traditional recipes.", "home"),
      customer: t("Ramesh K., Coimbatore", "home"),
    },
    {
      quote: t("Excellent quality and fast delivery. The bronze uruli is a great addition to my kitchen!", "home"),
      customer: t("Anitha R., Madurai", "home"),
    },
  ];

  return (
    <motion.section
      ref={ref}
      className="py-20 px-6 md:px-16 bg-gradient-to-b from-teal-100 to-cream"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-terracotta font-playfair">
        {t("What Our Customers Say", "home")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className={index % 2 === 0 ? "mt-0" : "mt-12"}
          >
            <TestimonialCard
              quote={testimonial.quote}
              customer={testimonial.customer}
            />
          </div>
        ))}
      </div>
    </motion.section>
  );
};

// Main HomePage Component
const HomePage = () => (
  <div className="space-y-16">
    <VideoBackground />
    <CookwareMaterialsSection />
    <WhyChooseUsSection />
    <CustomerTestimonialsSection />
  </div>
);

export default HomePage;