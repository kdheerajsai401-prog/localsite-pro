"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Config {
  businessName: string;
  city: string;
  headline: string;
  subheadline: string;
  cta: string;
  accentColor: string;
}

export function Hero({ config }: { config: Config }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const lines = config.headline.split("\n");

  return (
    <section ref={ref} className="relative h-screen min-h-[640px] overflow-hidden flex items-center">
      {/* Parallax background layer */}
      <motion.div
        style={{ y: yBg }}
        className="absolute inset-0 z-0"
      >
        {/* Noise grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px",
          }}
        />

        {/* Geometric accent shapes */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full border opacity-[0.06]"
          style={{ borderColor: config.accentColor }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-60 -left-20 w-[500px] h-[500px] rounded-full border opacity-[0.04]"
          style={{ borderColor: config.accentColor }}
        />

        {/* Accent gradient bleed */}
        <div
          className="absolute top-0 right-0 w-1/2 h-full opacity-[0.07]"
          style={{
            background: `radial-gradient(ellipse at 80% 30%, ${config.accentColor}, transparent 70%)`,
          }}
        />

        {/* Vertical rule */}
        <div
          className="absolute left-[10vw] top-0 bottom-0 w-px opacity-20"
          style={{ background: `linear-gradient(to bottom, transparent, ${config.accentColor}, transparent)` }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: yText, opacity }}
        className="relative z-10 w-full max-w-6xl mx-auto px-8 lg:px-16"
      >
        {/* City tag */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="w-8 h-px" style={{ backgroundColor: config.accentColor }} />
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400">
            {config.city}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-black tracking-tight leading-[0.92] mb-8"
          style={{ fontSize: "clamp(3.5rem, 9vw, 8rem)" }}
        >
          {lines.map((line, i) => (
            <span key={i} className="block">
              {i === lines.length - 1 ? (
                <span style={{ color: config.accentColor }}>{line}</span>
              ) : (
                line
              )}
            </span>
          ))}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-zinc-400 max-w-xl leading-relaxed mb-12"
          style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)" }}
        >
          {config.subheadline}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex items-center gap-4"
        >
          <a
            href="#contact"
            className="group relative inline-flex items-center gap-3 px-8 py-4 font-bold text-sm tracking-wider uppercase overflow-hidden"
            style={{ background: config.accentColor, color: "#fff" }}
          >
            <span className="relative z-10">{config.cta}</span>
            <span className="relative z-10 transition-transform group-hover:translate-x-1">→</span>
            <div className="absolute inset-0 bg-white/10 translate-x-[-110%] group-hover:translate-x-0 transition-transform duration-300" />
          </a>

          <a
            href="#services"
            className="text-sm font-medium tracking-wide text-zinc-500 hover:text-zinc-200 transition-colors border-b border-zinc-700 hover:border-zinc-400 pb-0.5"
          >
            Our Services
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-600">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8"
          style={{ background: `linear-gradient(to bottom, ${config.accentColor}, transparent)` }}
        />
      </motion.div>

      {/* Business name watermark */}
      <div
        className="absolute bottom-10 right-8 text-[10px] tracking-[0.25em] uppercase text-zinc-700 font-bold select-none"
      >
        {config.businessName}
      </div>
    </section>
  );
}
