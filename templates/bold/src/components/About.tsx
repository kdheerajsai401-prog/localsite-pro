"use client";
import { motion } from "framer-motion";

interface Config {
  businessName: string;
  about: string;
  accentColor: string;
}

export function About({ config }: { config: Config }) {
  return (
    <section id="about" className="py-32 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: label + accent block */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-px" style={{ backgroundColor: config.accentColor }} />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500">
                About
              </span>
            </div>

            <h2
              className="text-5xl font-black leading-tight mb-0"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              {config.businessName}
            </h2>

            {/* Decorative block */}
            <div
              className="w-24 h-1.5 mt-6"
              style={{ backgroundColor: config.accentColor }}
            />
          </motion.div>

          {/* Right: about text */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <p className="text-zinc-300 leading-relaxed text-lg">
              {config.about}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
