import { useRef } from "react";
import { Hero } from "@/components/Hero";
import { FeatureStrip } from "@/components/FeatureStrip";
import { Configurator } from "@/components/Configurator";
import { OrderComplete } from "@/pages/OrderComplete";
import { OrderCancel } from "@/pages/OrderCancel";

export function App() {
  const configuratorRef = useRef<HTMLDivElement>(null);
  const path = window.location.pathname;

  if (path === "/order/complete") return <OrderComplete />;
  if (path === "/order/cancel") return <OrderCancel />;

  return (
    <div>
      <Hero onStart={() => configuratorRef.current?.scrollIntoView({ behavior: "smooth" })} />
      <FeatureStrip />
      <Configurator ref={configuratorRef} />
    </div>
  );
}
