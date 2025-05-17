import React from "react";
import { motion } from "framer-motion";
import { FaHistory, FaUsers, FaBullseye } from "react-icons/fa";
import { useInView } from "react-intersection-observer";
import { useTranslation } from '../utils/TranslationContext'

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

  // UseInView hooks for each section
  const [historyRef, historyInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [teamRef, teamInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [missionRef, missionInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-12 bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-10 text-center text-teal-600 font-playfair">
        {t("About Balaguruva Chettiar Son's Co", "about")}
      </h2>

      {/* Our History Section */}
      <motion.section
        ref={historyRef}
        className="mb-12 mt-20 bg-teal-100 p-6 rounded-lg shadow-md"
        initial="hidden"
        animate={historyInView ? "visible" : "hidden"}
        variants={sectionVariants}
        custom={0.2}
      >
        <h3 className="text-2xl md:text-3xl font-semibold mb-4 flex items-center text-teal-600">
          <FaHistory className="mr-3 text-teal-500" /> {t("Our History", "about")}
        </h3>
        <p className="text-lg text-gray-700">
          {t("Founded in 1992, Balaguruva Chettiar Son's Co has been at the forefront of the cookware industry for over three decades. What started as a small family-owned business has grown into a leading manufacturer of high-quality cookwares, serving customers worldwide.", "about")}
        </p>
      </motion.section>

      {/* Our Team Section */}
      <motion.section
        ref={teamRef}
        className="mb-12 bg-teal-100 p-6 rounded-lg shadow-md"
        initial="hidden"
        animate={teamInView ? "visible" : "hidden"}
        variants={sectionVariants}
        custom={0.4}
      >
        <h3 className="text-2xl md:text-3xl font-semibold mb-4 flex items-center text-teal-600">
          <FaUsers className="mr-3 text-teal-500" /> {t("Our Team", "about")}
        </h3>
        <p className="text-lg text-gray-700">
          {t("Our success is built on the expertise and dedication of our team. From our skilled craftsmen to our innovative designers, every member of Balaguruva Chettiar Son's Co is committed to delivering excellence in every cookware utensil we produce.", "about")}
        </p>
      </motion.section>

      {/* Our Mission Section */}
      <motion.section
        ref={missionRef}
        className="bg-teal-100 p-6 rounded-lg shadow-md"
        initial="hidden"
        animate={missionInView ? "visible" : "hidden"}
        variants={sectionVariants}
        custom={0.6}
      >
        <h3 className="text-2xl md:text-3xl font-semibold mb-4 flex items-center text-teal-600">
          <FaBullseye className="mr-3 text-teal-500" /> {t("Our Mission", "about")}
        </h3>
        <p className="text-lg text-gray-700">
          {t("At Balaguruva Chettiar Son's Co, our mission is to preserve the art of traditional cookware craftsmanship while delivering exceptional quality to kitchens worldwide. We aim to inspire culinary creativity with cookware that lasts for generations.", "about")}
        </p>
      </motion.section>
    </motion.div>
  );
};

export default AboutPage;