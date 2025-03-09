"use client";

import { type User } from "@prisma/client";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { CategoriesSection } from "~/components/CategoriesSection";
import { FeaturedProducts } from "~/components/FeaturedProducts";
import { Testimonials } from "~/components/Testimonials";
import { CallToAction } from "~/components/CallToAction";
import { Hero } from "~/components/Hero";

const HomeContent = ({ user }: { user: User | null }) => {
  const controls = useAnimation();

  useEffect(() => {
    void controls.start({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    });
  }, [controls]);
  return (
    <>
    <Hero />
    <motion.div initial={{ opacity: 0, y: 20 }} animate={controls}>
      <CategoriesSection />
      <FeaturedProducts />
      <Testimonials />
      <CallToAction />
    </motion.div>
    </>
  );
};

export default HomeContent;
