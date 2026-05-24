"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/utils/motionVariants";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section";
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  as = "div",
}: AnimatedSectionProps) {
  const Component = as === "section" ? motion.section : motion.div;

  return (
    <Component
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </Component>
  );
}
