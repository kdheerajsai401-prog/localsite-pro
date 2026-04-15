import config from "../../site.config.json";

export default function Home() {
  const accent = config.accentColor;

  return (
    <main>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-slate-900 tracking-tight">{config.businessName}</span>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-500 font-medium">
            <a href="#services" className="hover:text-slate-900 transition-colors">Services</a>
            <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
            <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
          </div>
          <a
            href="#contact"
            className="text-sm font-semibold px-5 py-2.5 rounded-full text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            {config.cta}
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            {/* Trust tag */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-slate-50 border border-slate-200">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
              <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                Serving {config.city}
              </span>
            </div>

            <h1
              className="font-black text-slate-900 leading-[1.05] tracking-tight mb-6"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)" }}
            >
              {config.headline}
            </h1>

            <p className="text-slate-500 leading-relaxed mb-10 max-w-xl" style={{ fontSize: "1.125rem" }}>
              {config.subheadline}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-sm text-white shadow-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: accent, boxShadow: `0 8px 24px ${accent}40` }}
              >
                {config.cta}
                <span>→</span>
              </a>
              <a
                href={`tel:${config.phone.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <span className="text-base">📞</span>
                {config.phone}
              </a>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-20 pt-10 border-t border-slate-100 grid grid-cols-3 gap-8 max-w-2xl">
            {[
              { stat: "15+", label: "Years in practice" },
              { stat: "2,000+", label: "Patients served" },
              { stat: "5.0 ★", label: "Google rating" },
            ].map((item) => (
              <div key={item.stat}>
                <div className="text-3xl font-black text-slate-900 mb-1">{item.stat}</div>
                <div className="text-sm text-slate-400">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <span
              className="text-xs font-bold tracking-[0.2em] uppercase mb-3 block"
              style={{ color: accent }}
            >
              Our Services
            </span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Comprehensive care, <br className="hidden md:block" />every stage of life.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.services.map((service, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-7 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300 group"
              >
                {/* Icon spot */}
                <div
                  className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center text-white text-lg font-bold"
                  style={{ backgroundColor: `${accent}18`, color: accent }}
                >
                  {i + 1}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{service.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span
                className="text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
                style={{ color: accent }}
              >
                About Us
              </span>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                {config.businessName}
              </h2>
              <div className="w-12 h-1 rounded-full mb-8" style={{ backgroundColor: accent }} />
              <p className="text-slate-600 leading-relaxed text-lg">{config.about}</p>
            </div>

            {/* Visual accent panel */}
            <div className="relative">
              <div
                className="rounded-3xl h-72 lg:h-96 flex items-center justify-center"
                style={{ backgroundColor: `${accent}10`, border: `2px solid ${accent}20` }}
              >
                <div className="text-center p-8">
                  <div
                    className="text-6xl font-black mb-3"
                    style={{ color: accent }}
                  >
                    {config.city}
                  </div>
                  <div className="text-slate-400 text-sm font-medium">{config.businessName}</div>
                </div>
              </div>
              {/* Decorative circle */}
              <div
                className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20"
                style={{ backgroundColor: accent }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact" className="py-24 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span
            className="text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
            style={{ color: accent }}
          >
            Get In Touch
          </span>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
            Ready to book your appointment?
          </h2>
          <p className="text-slate-400 mb-10 max-w-md mx-auto">
            Call us directly or stop by — we&apos;re accepting new patients and happy to answer questions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href={`tel:${config.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              {config.phone}
            </a>
          </div>

          <div className="text-slate-500 text-sm">{config.address}</div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-slate-800 text-xs text-slate-600">
            © {new Date().getFullYear()} {config.businessName} · {config.city}
          </div>
        </div>
      </section>
    </main>
  );
}
