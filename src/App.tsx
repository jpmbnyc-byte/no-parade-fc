import { useRef, useState } from "react";
import { Hero } from "@/components/Hero";
import { Collection } from "@/components/Collection";
import { Configurator } from "@/components/Configurator";
import { HallOfFame } from "@/components/HallOfFame";
import { Footer } from "@/components/Footer";
import { OrderComplete } from "@/pages/OrderComplete";
import { OrderCancel } from "@/pages/OrderCancel";
import type { ChampionId } from "@/lib/kit";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function App() {
  // Held here rather than in the configurator so the collection strip can
  // drive it — picking a shirt up there selects it down here.
  const [championId, setChampionId] = useState<ChampionId>("pele");
  const collectionRef = useRef<HTMLDivElement>(null);
  const configuratorRef = useRef<HTMLDivElement>(null);
  const hallRef = useRef<HTMLDivElement>(null);
  const path = window.location.pathname;

  if (path === "/order/complete") return <OrderComplete />;
  if (path === "/order/cancel") return <OrderCancel />;

  const scrollToCollection = () => collectionRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToConfigurator = () => configuratorRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToHall = () => hallRef.current?.scrollIntoView({ behavior: "smooth" });

  const pickChampion = (id: ChampionId) => {
    setChampionId(id);
    scrollToConfigurator();
  };

  return (
    <div>
      <Hero
        onHome={scrollToTop}
        onCollection={scrollToCollection}
        onBuild={scrollToConfigurator}
        onHall={scrollToHall}
      />
      <Collection ref={collectionRef} selected={championId} onSelect={pickChampion} />
      <Configurator ref={configuratorRef} championId={championId} onChampionChange={setChampionId} />
      <HallOfFame ref={hallRef} />
      <Footer
        onHome={scrollToTop}
        onCollection={scrollToCollection}
        onBuild={scrollToConfigurator}
        onHall={scrollToHall}
      />
    </div>
  );
}
