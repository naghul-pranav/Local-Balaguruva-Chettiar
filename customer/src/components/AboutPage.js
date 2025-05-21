import React from "react";
import { motion } from "framer-motion";
import { FaHistory, FaUsers, FaBullseye } from "react-icons/fa";
import { useInView } from "react-intersection-observer";
import { useTranslation } from '../utils/TranslationContext';

// Animated Background Component with Teal-Copper Hybrid
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_#319795_0%,_transparent_50%)] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_#B87333_0%,_transparent_50%)] opacity-20" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-transparent to-[#B87333]/10"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

const AboutPage = () => {
  const { t } = useTranslation();

  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay }
    }),
  };

  // Animation for headings
  const headingVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Animation for icons
  const iconVariants = {
    hidden: { rotate: -10, opacity: 0 },
    visible: {
      rotate: 0,
      opacity: 1,
      transition: { duration: 0.5, type: "spring", stiffness: 100 }
    }
  };

  // UseInView hooks for each section
  const [historyRef, historyInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [teamRef, teamInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [missionRef, missionInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-12 bg-gradient-to-b from-gray-50 to-[#B87333]/5 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatedBackground />

      <h2 className="text-4xl md:text-5xl font-bold mb-10 text-center text-teal-600 font-playfair relative">
        {t("About K.Balaguruva Chettiar Son's Co", "about")}
        <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-teal-600 to-[#B87333] rounded-full" />
      </h2>

      {/* Our History Section */}
      <motion.section
        ref={historyRef}
        className="mb-12 mt-20 bg-gradient-to-r from-teal-100 to-[#B87333]/10 p-6 rounded-lg shadow-lg border border-teal-200/50"
        initial="hidden"
        animate={historyInView ? "visible" : "hidden"}
        variants={sectionVariants}
        custom={0.2}
        whileHover={{ boxShadow: "0 10px 30px rgba(184, 115, 51, 0.2)", y: -5 }}
      >
        <motion.h3
          className="text-2xl md:text-3xl font-semibold mb-4 flex items-center text-teal-600 relative"
          variants={headingVariants}
          initial="hidden"
          animate={historyInView ? "visible" : "hidden"}
        >
          <motion.div variants={iconVariants} className="mr-3 text-teal-500">
            <FaHistory />
          </motion.div>
          {t("Our History", "about")}
          <span className="absolute -bottom-1 left-0 w-16 h-1 bg-gradient-to-r from-teal-600 to-[#B87333] rounded-full" />
        </motion.h3>
        <p className="text-lg text-gray-700 font-sans">
          {t("Founded in 1992, K.Balaguruva Chettiar Son's Co has been at the forefront of the cookware industry for over three decades. What started as a small family-owned business has grown into a leading manufacturer of high-quality cookwares, serving customers worldwide.", "about")}
        </p>
      </motion.section>

      {/* Our Team Section */}
      <motion.section
        ref={teamRef}
        className="mb-12 bg-gradient-to-r from-teal-100 to-[#B87333]/10 p-6 rounded-lg shadow-lg border border-teal-200/50"
        initial="hidden"
        animate={teamInView ? "visible" : "hidden"}
        variants={sectionVariants}
        custom={0.4}
        whileHover={{ boxShadow: "0 10px 30px rgba(184, 115, 51, 0.2)", y: -5 }}
      >
        <motion.h3
          className="text-2xl md:text-3xl font-semibold mb-4 flex items-center text-teal-600 relative"
          variants={headingVariants}
          initial="hidden"
          animate={teamInView ? "visible" : "hidden"}
        >
          <motion.div variants={iconVariants} className="mr-3 text-teal-500">
            <FaUsers />
          </motion.div>
          {t("Our Team", "about")}
          <span className="absolute -bottom-1 left-0 w-16 h-1 bg-gradient-to-r from-teal-600 to-[#B87333] rounded-full" />
        </motion.h3>
        <p className="text-lg text-gray-700 font-sans">
          {t("Our success is built on the expertise and dedication of our team. From our skilled craftsmen to our innovative designers, every member of K.Balaguruva Chettiar Son's Co is committed to delivering excellence in every cookware utensil we produce.", "about")}
        </p>
      </motion.section>

      {/* Our Mission Section */}
      <motion.section
        ref={missionRef}
        className="bg-gradient-to-r from-teal-100 to-[#B87333]/10 p-6 rounded-lg shadow-lg border border-teal-200/50"
        initial="hidden"
        animate={missionInView ? "visible" : "hidden"}
        variants={sectionVariants}
        custom={0.6}
        whileHover={{ boxShadow: "0 10px 30px rgba(184, 115, 51, 0.2)", y: -5 }}
      >
        <motion.h3
          className="text-2xl md:text-3xl font-semibold mb-4 flex items-center text-teal-600 relative"
          variants={headingVariants}
          initial="hidden"
          animate={missionInView ? "visible" : "hidden"}
        >
          <motion.div variants={iconVariants} className="mr-3 text-teal-500">
            <FaBullseye />
          </motion.div>
          {t("Our Mission", "about")}
          <span className="absolute -bottom-1 left-0 w-16 h-1 bg-gradient-to-r from-teal-600 to-[#B87333] rounded-full" />
        </motion.h3>
        <p className="text-lg text-gray-700 font-sans">
          {t("At K.Balaguruva Chettiar Son's Co, our mission is to preserve the art of traditional cookware craftsmanship while delivering exceptional quality to kitchens worldwide. We aim to inspire culinary creativity with cookware that lasts for generations.", "about")}
        </p>
      </motion.section>
    </motion.div>
  );
};

export default AboutPage;