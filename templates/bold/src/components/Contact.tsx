"use client";
import { motion } from "framer-motion";

interface Config {
  businessName: string;
  city: string;
  phone: string;
  address: string;
  cta: string;
  accentColor: string;
}

export function Contact({ config }: { config: Config }) {
  return (
    <section id="contact" className="py-32 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12"
        >
          {/* Left */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-px" style={{ backgroundColor: config.accentColor }} />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500">
                Find Us
              </span>
            </div>

            <h2
              className="font-black leading-tight mb-10"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Ready to get started?
            </h2>

            <div className="space-y-4 text-zinc-400">
              <div className="flex items-center gap-4">
                <span style={{ color: config.accentColor }}>→</span>
                <a
                  href={`tel:${config.phone.replace(/\D/g, "")}`}
                  className="text-lg font-bold text-white hover:opacity-80 transition-opacity tracking-wide"
                >
                  {config.phone}
                </a>
              </div>
              <div className="flex items-start gap-4">
                <span style={{ color: config.accentColor }}>→</span>
                <span className="text-zinc-400">{config.address}</span>
              </div>
            </div>
          </div>

          {/* Right: CTA */}
          <div className="shrink-0">
            <a
              href={`tel:${config.phone.replace(/\D/g, "")}`}
              className="group inline-flex items-center gap-4 px-10 py-5 font-bold text-sm tracking-wider uppercase"
              style={{ background: config.accentColor, color: "#fff" }}
            >
              {config.cta}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </motion.div>

        {/* Footer bar */}
        <div className="mt-24 pt-8 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-700 tracking-wide">
          <span>{config.businessName} · {config.city}</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </section>
  );
}
