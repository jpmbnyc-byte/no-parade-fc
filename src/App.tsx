import { useRef, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Hero } from "@/components/Hero";
import { Collection } from "@/components/Collection";
import { Configurator } from "@/components/Configurator";
import { HallOfFame } from "@/components/HallOfFame";
import { Footer } from "@/components/Footer";
import { Bag } from "@/components/Bag";
import { useCart } from "@/lib/cart";
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
  const [bagOpen, setBagOpen] = useState(false);
  const cart = useCart();
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
      <TopBar
        onHome={scrollToTop}
        onCollection={scrollToCollection}
        onBuild={scrollToConfigurator}
        onHall={scrollToHall}
        bagCount={cart.count}
        subtotal={cart.subtotal}
        onBag={() => setBagOpen(true)}
      />
      <Hero onBuild={scrollToConfigurator} onCollection={scrollToCollection} />
      <Collection ref={collectionRef} selected={championId} onSelect={pickChampion} />
      <Configurator
        ref={configuratorRef}
        championId={championId}
        onChampionChange={setChampionId}
        onAdd={(item) => {
          cart.add(item);
          setBagOpen(true);
        }}
      />
      <HallOfFame ref={hallRef} onSelect={pickChampion} />
      <Bag
        open={bagOpen}
        items={cart.items}
        subtotal={cart.subtotal}
        onClose={() => setBagOpen(false)}
        onRemove={cart.remove}
      />
      <Footer
        onHome={scrollToTop}
        onCollection={scrollToCollection}
        onBuild={scrollToConfigurator}
        onHall={scrollToHall}
      />
    </div>
  );
}
