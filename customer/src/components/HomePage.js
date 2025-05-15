"use client"
import { motion } from "framer-motion"
import { FaLeaf, FaRecycle, FaIndustry, FaChevronDown } from "react-icons/fa"
import { useInView } from "react-intersection-observer"
import { useTranslation } from "../utils/TranslationContext"
// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition duration-300"
    whileHover={{ scale: 1.05, rotate: 2 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="flex items-center justify-center mb-6 text-6xl">{icon}</div>
    <h3 className="text-xl md:text-2xl font-semibold mb-4">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div> 
)

// Video Background Component Code
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
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          <span className="text-blue-400">{t("Welcome to Balaguruva Chettiar Son's Co", "home")}</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8">{t("Premium Quality Cookware Utensils for a Better Kitchen", "home")}</p>
        <motion.button
          className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-blue-600 transition duration-300"
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

// Features Section Component
const FeaturesSection = () => {
  const { t } = useTranslation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.section
      ref={ref}
      className="text-center px-4 md:px-16 py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-6">
        <span className="text-blue-600">{t("Discover Balaguruva Chettiar Son's Co", "home")}</span>
      </h2>
      <p className="text-lg md:text-xl text-gray-600 mb-12">
        {t("Crafted for excellence, sustainability, and innovation in every cookwares.", "home")}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        <FeatureCard
          icon={<FaLeaf className="text-green-500" />}
          title={t("Eco-Friendly", "home")}
          description={t("Our cookwares are produced using sustainable practices to minimize environmental impact.", "home")}
        />
        <FeatureCard
          icon={<FaRecycle className="text-blue-500" />}
          title={t("Recycled Materials", "home")}
          description={t("We offer a range of cookwares made from recycled materials, promoting circular economy.", "home")}
        />
        <FeatureCard
          icon={<FaIndustry className="text-purple-500" />}
          title={t("State-of-the-Art Production", "home")}
          description={t("Our modern facilities ensure consistent quality and efficient production.", "home")}
        />
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
      className="bg-blue-50 py-16 px-6 md:px-16 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
        <span className="text-blue-600">{t("Why Choose Balaguruva Chettiar Son's Co", "home")}</span>
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

// Sustainability Section Component
const SustainabilitySection = () => {
  const { t } = useTranslation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.section
      ref={ref}
      className="py-16 px-6 md:px-16 bg-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t("Our Commitment to Sustainability", "home")}</h2>
      <p className="text-lg md:text-xl text-gray-600 text-center mb-8">
        {t("At Balaguruva Chettiar Son's Co, we are dedicated to reducing our environmental footprint through innovative practices and sustainable materials.", "home")}
      </p>
      <div className="flex justify-center">
        <motion.button
          className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-green-600 transition duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t("Learn More About Our Initiatives", "home")}
        </motion.button>
      </div>
    </motion.section>
  )
}

// Main HomePage Component
const HomePage = () => (
  <div className="space-y-16">
    <VideoBackground />
    <FeaturesSection />
    <WhyChooseUsSection />
    <SustainabilitySection />
  </div>
)

export default HomePage

