"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function AnimatedLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        y: [0, -2, 0],
      }}
      transition={{
        opacity: { duration: 0.4 },
        y: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      whileHover={{
        scale: 1.08,
        transition: { type: "spring", stiffness: 400, damping: 20 },
      }}
      whileTap={{ scale: 0.94 }}
      className="inline-flex items-center select-none"
    >
      <Image
        src="/v6-logo.png"
        alt="V6 Logo"
        width={60}
        height={40}
        className="h-6.5 w-auto object-contain drop-shadow-sm transition-all duration-300 hover:drop-shadow-md sm:h-7.5 md:h-8"
        priority
      />
    </motion.div>
  );
}
