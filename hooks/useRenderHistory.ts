"use client";

import { useState, useEffect, useCallback } from "react";
import type { DesignQuestionnaire } from "@/types";

export interface RenderEntry {
  id: string;
  createdAt: number;
  outputUrl: string;
  originalImage: string;
  spaceType: "interior" | "exterior";
  style: string;
  roomType: string;
}

const STORAGE_KEY = "render_history";
const MAX_ENTRIES = 50;

function load(): RenderEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(entries: RenderEntry[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries.slice(0, MAX_ENTRIES))
    );
  } catch {
    // storage quota exceeded — drop oldest
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 10)));
    } catch {}
  }
}

export function useRenderHistory() {
  const [history, setHistory] = useState<RenderEntry[]>([]);

  useEffect(() => {
    setHistory(load());
  }, []);

  const addEntry = useCallback(
    (outputUrl: string, originalImage: string, q: DesignQuestionnaire) => {
      const entry: RenderEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
        outputUrl,
        originalImage,
        spaceType: q.spaceType,
        style: q.primaryStyle || "auto",
        roomType: q.roomType,
      };
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, MAX_ENTRIES);
        save(next);
        return next;
      });
      return entry;
    },
    []
  );

  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      save(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return { history, addEntry, removeEntry, clearAll };
}
