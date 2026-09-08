export const FB_PIXEL_ID =
  process.env.NEXT_PUBLIC_FB_PIXEL_ID || "835553756314839";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Trigger Facebook standard PageView
 */
export const pageview = () => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "PageView");
  }
};

/**
 * Trigger standard Facebook Pixel event
 */
export const event = (
  name: string,
  options: Record<string, any> = {},
  eventId?: string
) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (eventId) {
      window.fbq("track", name, options, { eventID: eventId });
    } else {
      window.fbq("track", name, options);
    }
  }
};

/**
 * Trigger custom Facebook Pixel event
 */
export const customEvent = (
  name: string,
  options: Record<string, any> = {},
  eventId?: string
) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (eventId) {
      window.fbq("trackCustom", name, options, { eventID: eventId });
    } else {
      window.fbq("trackCustom", name, options);
    }
  }
};
