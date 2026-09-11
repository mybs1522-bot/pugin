"use client";

import { useEffect, useState } from "react";

let globalCount = 8776;
const listeners = new Set<(count: number) => void>();

if (typeof window !== "undefined") {
  const win = window as unknown as {
    __userCountInterval?: ReturnType<typeof setInterval>;
  };
  if (!win.__userCountInterval) {
    win.__userCountInterval = setInterval(() => {
      const inc = Math.floor(Math.random() * 2) + 1;
      globalCount += inc;
      listeners.forEach((listener) => listener(globalCount));
    }, 8000);
  }
}

export function useSharedUserCount() {
  const [count, setCount] = useState(globalCount);

  useEffect(() => {
    setCount(globalCount);
    const listener = (newCount: number) => setCount(newCount);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return count;
}
