"use client";
import { motion } from "framer-motion";

interface Config {
  services: Array<{ name: string; description: string }>;
  accentColor: string;
}

export function Services({ config }: { config: Config }) {
  return (
    <section id="services" className="py-32 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-8 lg:px-16">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <div className="w-10 h-px" style={{ backgroundColor: config.accentColor }} />
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500">
            What We Do
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-900">
          {config.services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group bg-zinc-950 p-8 hover:bg-zinc-900 transition-colors duration-300 relative overflow-hidden"
            >
              {/* Number */}
              <span
                className="text-xs font-bold tracking-[0.15em] uppercase mb-6 block"
                style={{ color: config.accentColor }}
              >
                0{i + 1}
              </span>

              {/* Name */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                {service.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                {service.description}
              </p>

              {/* Hover accent line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                style={{ backgroundColor: config.accentColor }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
