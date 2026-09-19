import { useCallback, useEffect, useState } from "react";
import { championById, priceFor, type ChampionId, type Mode, type Size } from "@/lib/kit";

export type CartItem = {
  /** Stable per-line id, so two identical builds can still be removed apart. */
  key: string;
  championId: ChampionId;
  mode: Mode;
  size: Size;
  name: string;
  number: string;
};

const STORAGE_KEY = "npfc.bag.v1";

export function itemPrice(item: CartItem): number {
  return priceFor(item.mode);
}

export function itemLabel(item: CartItem): string {
  const champion = championById(item.championId);
  const mode = item.mode === "tribute" ? "Tribute" : item.mode === "blank" ? "Blank" : "Custom";
  return `${champion.legendName} — ${champion.colorLabel} · ${mode} · ${item.size}`;
}

export function itemPrint(item: CartItem): string | null {
  if (item.mode === "tribute") {
    const champion = championById(item.championId);
    return `${champion.legendName.toUpperCase()} ${champion.legendNumber}`;
  }
  if (item.mode === "custom") return `${item.name.toUpperCase()} ${item.number}`;
  return null;
}

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    // Private mode, blocked storage, or something else wrote to the key.
    return [];
  }
}

function write(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // The bag still works for this page view; it just will not survive a reload.
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  // Read after mount rather than in the initializer: this runs once, and
  // keeps the first render identical whether or not storage is available.
  useEffect(() => setItems(read()), []);

  const add = useCallback((item: Omit<CartItem, "key">) => {
    setItems((prev) => {
      const next = [...prev, { ...item, key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }];
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.key !== key);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    write([]);
  }, []);

  const subtotal = items.reduce((sum, i) => sum + itemPrice(i), 0);

  return { items, add, remove, clear, subtotal, count: items.length };
}
