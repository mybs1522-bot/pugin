"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

export interface SubscriptionState {
  subscribed: boolean;
  status: "active" | "trialing" | null;
  trialEnd: number | null;
  cancelAtPeriodEnd: boolean;
  hadTrial: boolean;
  generationCount: number;
  generationLimit: number;
  loading: boolean;
}

const DEFAULT: SubscriptionState = {
  subscribed: false,
  status: null,
  trialEnd: null,
  cancelAtPeriodEnd: false,
  hadTrial: false,
  generationCount: 0,
  generationLimit: 3,
  loading: true,
};

export function useSubscription(): SubscriptionState & {
  refresh: () => Promise<void>;
} {
  const { data: session, status: sessionStatus } = useSession();
  const [state, setState] = useState<SubscriptionState>(DEFAULT);

  const fetchState = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const [sub, usage] = await Promise.all([
        fetch("/api/stripe/subscription").then((r) => r.json()),
        fetch("/api/usage").then((r) => r.json()),
      ]);
      const cancelAtPeriodEnd = sub.cancelAtPeriodEnd ?? false;
      setState({
        subscribed: (sub.subscribed ?? false) && !cancelAtPeriodEnd,
        status: sub.status ?? null,
        trialEnd: sub.trialEnd ?? null,
        cancelAtPeriodEnd,
        hadTrial: sub.hadTrial ?? false,
        generationCount: usage.count ?? 0,
        generationLimit: usage.limit ?? 3,
        loading: false,
      });
    } catch {
      setState({ ...DEFAULT, loading: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session?.user) {
      const isPaidLocal =
        typeof window !== "undefined" &&
        (localStorage.getItem("v6_is_paid") === "true" ||
          localStorage.getItem("v6_plan_status") === "paid");
      setState({
        ...DEFAULT,
        subscribed: isPaidLocal,
        status: isPaidLocal ? "trialing" : null,
        loading: false,
      });
      return;
    }
    fetchState();
  }, [session, sessionStatus, fetchState]);

  return { ...state, refresh: fetchState };
}
