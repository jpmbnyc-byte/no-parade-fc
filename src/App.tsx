import { useRef } from "react";
import { Hero } from "@/components/Hero";
import { FeatureStrip } from "@/components/FeatureStrip";
import { Configurator } from "@/components/Configurator";
import { Footer } from "@/components/Footer";
import { OrderComplete } from "@/pages/OrderComplete";
import { OrderCancel } from "@/pages/OrderCancel";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function App() {
  const aboutRef = useRef<HTMLDivElement>(null);
  const configuratorRef = useRef<HTMLDivElement>(null);
  const path = window.location.pathname;

  if (path === "/order/complete") return <OrderComplete />;
  if (path === "/order/cancel") return <OrderCancel />;

  const scrollToAbout = () => aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToConfigurator = () => configuratorRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div>
      <Hero onHome={scrollToTop} onAbout={scrollToAbout} onBuild={scrollToConfigurator} />
      <div ref={aboutRef}>
        <FeatureStrip />
      </div>
      <Configurator ref={configuratorRef} />
      <Footer onHome={scrollToTop} onAbout={scrollToAbout} onBuild={scrollToConfigurator} />
    </div>
  );
}
