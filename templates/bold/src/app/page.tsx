import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import config from "../../site.config.json";

export default function Home() {
  return (
    <main>
      <Hero config={config} />
      <Services config={config} />
      <About config={config} />
      <Contact config={config} />
    </main>
  );
}
