"use client"
import { motion } from "framer-motion"
import { FaChevronDown } from "react-icons/fa"
import { useInView } from "react-intersection-observer"
import { useTranslation } from "../utils/TranslationContext"

// Material Card Component
const MaterialCard = ({ image, name, benefit }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition duration-300"
    whileHover={{ scale: 1.05, rotate: 1 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="mb-4">
      <img src={image} alt={name} className="w-full h-48 object-cover rounded-md" />
    </div>
    <h3 className="text-xl md:text-2xl font-semibold mb-2 text-gray-800">{name}</h3>
    <p className="text-gray-600">{benefit}</p>
  </motion.div>
)

// Testimonial Card Component
const TestimonialCard = ({ quote, customer }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-md text-center"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 200 }}
  >
    <p className="text-gray-600 italic mb-4">"{quote}"</p>
    <p className="text-teal-600 font-semibold">{customer}</p>
  </motion.div>
)

// Video Background Component
const VideoBackground = () => {
  const { t } = useTranslation()
  return (
    <div className="relative h-screen overflow-hidden">
      <video autoPlay muted loop className="absolute inset-0 w-full h-full object-cover min-w-full min-h-full">
        <source src="/images/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-playfair">
            <span className="text-teal-400">{t("Welcome to Balaguruva Chettiar Son's Co", "home")}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">{t("Premium Quality Cookware Utensils for a Better Kitchen", "home")}</p>
          <motion.button
            className="bg-teal-600 text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-teal-700 transition duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t("Explore Our Products", "home")}
          </motion.button>
        </motion.div>
      </div>
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
      >
        <FaChevronDown className="text-white text-4xl" />
      </motion.div>
    </div>
  )
}

// Cookware Materials Section
const CookwareMaterialsSection = () => {
  const { t } = useTranslation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

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
  ]

  return (
    <motion.section
      ref={ref}
      className="text-center px-4 md:px-16 py-16 bg-gray-50"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-6">
        <span className="text-teal-600">{t("Our Premium Cookware Materials", "home")}</span>
      </h2>
      <p className="text-lg md:text-xl text-gray-600 mb-12">
        {t("Explore the benefits of our high-quality materials used in crafting traditional cookware.", "home")}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {materials.map((material, index) => (
          <MaterialCard
            key={index}
            image={material.image}
            name={material.name}
            benefit={material.benefit}
          />
        ))}
      </div>
    </motion.section>
  )
}

// Why Choose Us Section Component
const WhyChooseUsSection = () => {
  const { t } = useTranslation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.section
      ref={ref}
      className="bg-indigo-50 py-16 px-6 md:px-16 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
        <span className="text-teal-600">{t("Why Choose Balaguruva Chettiar Son's Co", "home")}</span>
      </h2>
      <ul className="list-disc list-inside space-y-4 text-gray-700 text-lg leading-relaxed">
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
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.section>
  )
}

// Customer Testimonials Section
const CustomerTestimonialsSection = () => {
  const { t } = useTranslation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const testimonials = [
    {
      quote: t("The copper kadai I bought is amazing! It heats evenly and makes cooking so much easier.", "home"),
      customer: t("Priya S., Chennai", "home"),
    },
    {
      quote: t("I love the brass pot from Balaguruva Chettiar. It’s perfect for traditional recipes.", "home"),
      customer: t("Ramesh K., Coimbatore", "home"),
    },
    {
      quote: t("Excellent quality and fast delivery. The bronze uruli is a great addition to my kitchen!", "home"),
      customer: t("Anitha R., Madurai", "home"),
    },
  ]

  return (
    <motion.section
      ref={ref}
      className="py-16 px-6 md:px-16 bg-teal-100"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-teal-800">
        {t("What Our Customers Say", "home")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            quote={testimonial.quote}
            customer={testimonial.customer}
          />
        ))}
      </div>
    </motion.section>
  )
}

// Main HomePage Component
const HomePage = () => (
  <div className="space-y-16">
    <VideoBackground />
    <CookwareMaterialsSection />
    <WhyChooseUsSection />
    <CustomerTestimonialsSection />
  </div>
)

export default HomePage