"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { staggerContainer, fadeUp } from "@/lib/utils/motionVariants";

const collageImages = {
  col1: {
    top: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80",
    bottom:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
  },
  col2: {
    top: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80",
    bottom:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80",
  },
};

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] bg-surface flex items-center overflow-hidden">
      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-primary/[0.04] to-transparent hidden lg:block pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-xl"
          >
            <motion.span
              variants={fadeUp}
              className="text-[11px] font-medium bg-primary/10 py-0.5 px-1.5 border border-primary flex items-center gap-2 w-fit rounded-full text-primary uppercase tracking-[0.2em]"
            >
              <span className="bg-primary h-2 w-2 rounded-full animate-pulse" />
              Rental Properties in Nigeria
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-main tracking-tight mt-6 leading-[1.05]"
            >
              Find Your Next Home
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg text-slate-500 mt-6 leading-relaxed max-w-md"
            >
              Browse verified rental properties across Lagos, Abuja, and Port
              Harcourt. Connect directly with landlords — no agents, no
              middlemen.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap gap-4 mt-10"
            >
              <Link
                href="/listings"
                className="bg-primary text-white px-8 py-3.5 rounded-xl font-medium hover:bg-emerald-800 active:scale-95 transition-all duration-150 text-base"
              >
                Explore Listings
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="relative h-[420px] sm:h-[480px] lg:h-[600px]"
          >
            <div className="flex gap-4 sm:gap-5 h-full">
              <div className="flex-1 grid grid-rows-[auto_1fr] gap-4 sm:gap-5 min-h-0">
                <div className="relative w-full h-[160px] sm:h-[200px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
                  <Image
                    src={collageImages.col1.top}
                    alt="Living room in a modern Nigerian apartment"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="relative w-full min-h-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
                  <Image
                    src={collageImages.col1.bottom}
                    alt="Modern apartment building exterior"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </div>
              <div className="flex-1 grid grid-rows-[1fr_auto] gap-4 sm:gap-5 min-h-0">
                <div className="relative w-full min-h-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
                  <Image
                    src={collageImages.col2.bottom}
                    alt="Bright open-plan living and dining area"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="relative w-full h-[160px] sm:h-[200px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
                  <Image
                    src={collageImages.col2.top}
                    alt="Modern bedroom with warm natural lighting"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
