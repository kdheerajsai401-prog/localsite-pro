import config from "../../site.config.json";

const HOURS = [
  { day: "Monday – Friday", hours: "7:00 AM – 10:00 PM" },
  { day: "Saturday", hours: "8:00 AM – 10:00 PM" },
  { day: "Sunday", hours: "9:00 AM – 9:00 PM" },
];

export default function Home() {
  const accent = config.accentColor;
  const accentLight = `${accent}18`;

  return (
    <main>
      {/* Top bar */}
      <div className="bg-stone-900 text-stone-300 text-xs text-center py-2.5 tracking-wide">
        <span>Open Today · {config.phone} · {config.address}</span>
      </div>

      {/* Nav */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <div className="font-black text-stone-900 text-lg leading-tight">{config.businessName}</div>
            <div className="text-xs text-stone-400">{config.city}</div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-stone-500 font-medium">
            <a href="#services" className="hover:text-stone-900 transition-colors">Products</a>
            <a href="#hours" className="hover:text-stone-900 transition-colors">Hours</a>
            <a href="#about" className="hover:text-stone-900 transition-colors">About</a>
          </div>
          <a
            href={`tel:${config.phone.replace(/\D/g, "")}`}
            className="text-sm font-bold px-5 py-2.5 rounded-full text-white"
            style={{ backgroundColor: accent }}
          >
            {config.phone}
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6 overflow-hidden relative">
        {/* Warm background texture */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `radial-gradient(ellipse at 20% 50%, ${accent}15, transparent 60%), radial-gradient(ellipse at 80% 20%, ${accent}10, transparent 50%)`
        }} />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Open badge */}
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-green-50 border border-green-200">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-green-700 tracking-wide">Open Now</span>
              </div>

              <h1
                className="font-black text-stone-900 leading-[1.1] tracking-tight mb-5"
                style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)" }}
              >
                {config.headline}
              </h1>

              <p className="text-stone-500 leading-relaxed mb-8 text-lg max-w-md">
                {config.subheadline}
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#services"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm text-white"
                  style={{ backgroundColor: accent }}
                >
                  See What We Carry
                </a>
                <a
                  href="#hours"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  View Hours
                </a>
              </div>
            </div>

            {/* Hours card — prominent in hero */}
            <div id="hours" className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: accent }}>
                  ◷
                </div>
                <h2 className="font-black text-stone-900 text-lg">Store Hours</h2>
              </div>

              <div className="space-y-3">
                {HOURS.map((h) => (
                  <div key={h.day} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
                    <span className="text-sm font-medium text-stone-600">{h.day}</span>
                    <span className="text-sm font-bold text-stone-900">{h.hours}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-stone-100">
                <a
                  href={`tel:${config.phone.replace(/\D/g, "")}`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: accent }}
                >
                  <span>Call Us</span>
                  <span className="font-normal">·</span>
                  <span>{config.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services / Products */}
      <section id="services" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: accent }} />
            <div>
              <h2 className="font-black text-stone-900 text-3xl">What We Carry</h2>
              <p className="text-stone-400 text-sm mt-0.5">Fresh, stocked daily — just for the neighbourhood.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {config.services.map((service, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 border border-stone-100 hover:border-stone-200 hover:shadow-sm transition-all group"
                style={{ backgroundColor: i % 2 === 0 ? accentLight : "#fff" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black mb-4"
                  style={{ backgroundColor: accent, color: "#fff" }}
                >
                  {i + 1}
                </div>
                <h3 className="font-bold text-stone-900 mb-2">{service.name}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide"
              style={{ backgroundColor: accentLight, color: accent }}
            >
              Our Story
            </div>
            <h2 className="text-4xl font-black text-stone-900 mb-6 tracking-tight">
              Part of the neighbourhood since day one
            </h2>
            <p className="text-stone-500 leading-relaxed text-lg">{config.about}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div>
              <div className="font-black text-white text-xl mb-2">{config.businessName}</div>
              <div className="text-stone-400 text-sm">{config.city}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Contact</div>
              <a
                href={`tel:${config.phone.replace(/\D/g, "")}`}
                className="text-white font-bold text-lg hover:opacity-80 transition-opacity block mb-1"
              >
                {config.phone}
              </a>
              <div className="text-stone-400 text-sm">{config.address}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Hours</div>
              {HOURS.slice(0, 2).map((h) => (
                <div key={h.day} className="text-stone-400 text-sm mb-1">
                  {h.day}: <span className="text-white">{h.hours}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-8 border-t border-stone-800 text-xs text-stone-600">
            © {new Date().getFullYear()} {config.businessName} · All rights reserved
          </div>
        </div>
      </footer>
    </main>
  );
}
