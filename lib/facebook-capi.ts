import crypto from "crypto";

export const FB_PIXEL_ID =
  process.env.NEXT_PUBLIC_FB_PIXEL_ID ||
  process.env.FB_PIXEL_ID ||
  "835553756314839";

export const FB_CAPI_ACCESS_TOKEN =
  process.env.FB_CAPI_ACCESS_TOKEN ||
  process.env.FB_ACCESS_TOKEN ||
  "EAADE6Lnxf9MBSbur5TW9ulFN2eZBBfNd0b2YrbuH1UtNOxS2nl5VFMJGyLF2VdxSoWHZBMatifv7HHObZBtPZCf89YBFJ9SpJ9TjOjOcI2teKFO2k5Wru8UBZBQ2KEPFJt5BHAg9FveQ5UHlH6r9iZARQYdiN8E7brEhZAk9ffHA3KfXaYfhLuZBTuL5Wmwk3EZAIewZDZD";

/**
 * Hash string to SHA-256 lowercase hex per Meta Conversions API requirement
 */
export function hashData(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return undefined;
  return crypto.createHash("sha256").update(trimmed).digest("hex");
}

export interface FacebookUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
  externalId?: string;
}

export interface FacebookCustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  order_id?: string;
  status?: string;
  [key: string]: any;
}

export interface FacebookCapiEventParams {
  eventName: string;
  eventId?: string;
  eventTime?: number;
  eventSourceUrl?: string;
  userData?: FacebookUserData;
  customData?: FacebookCustomData;
  testEventCode?: string;
}

/**
 * Send event to Meta Conversions API (CAPI)
 */
export async function sendFacebookCapiEvent({
  eventName,
  eventId,
  eventTime = Math.floor(Date.now() / 1000),
  eventSourceUrl,
  userData = {},
  customData,
  testEventCode = process.env.FB_TEST_EVENT_CODE,
}: FacebookCapiEventParams) {
  if (!FB_PIXEL_ID || !FB_CAPI_ACCESS_TOKEN) {
    console.warn("Facebook Pixel ID or CAPI Access Token is missing.");
    return { success: false, error: "Missing configuration" };
  }

  const normalizedUserData: Record<string, any> = {};

  if (userData.email) {
    const hashedEmail = hashData(userData.email);
    if (hashedEmail) normalizedUserData.em = [hashedEmail];
  }
  if (userData.phone) {
    const hashedPhone = hashData(userData.phone.replace(/[^0-9]/g, ""));
    if (hashedPhone) normalizedUserData.ph = [hashedPhone];
  }
  if (userData.firstName) {
    const hashedFn = hashData(userData.firstName);
    if (hashedFn) normalizedUserData.fn = [hashedFn];
  }
  if (userData.lastName) {
    const hashedLn = hashData(userData.lastName);
    if (hashedLn) normalizedUserData.ln = [hashedLn];
  }
  if (userData.externalId) {
    const hashedExtId = hashData(userData.externalId);
    if (hashedExtId) normalizedUserData.external_id = [hashedExtId];
  }
  if (userData.clientIpAddress) {
    normalizedUserData.client_ip_address = userData.clientIpAddress;
  }
  if (userData.clientUserAgent) {
    normalizedUserData.client_user_agent = userData.clientUserAgent;
  }
  if (userData.fbp) {
    normalizedUserData.fbp = userData.fbp;
  }
  if (userData.fbc) {
    normalizedUserData.fbc = userData.fbc;
  }

  const payload: Record<string, any> = {
    data: [
      {
        event_name: eventName,
        event_time: eventTime,
        action_source: "website",
        event_id: eventId,
        event_source_url: eventSourceUrl,
        user_data: normalizedUserData,
        custom_data: customData,
      },
    ],
  };

  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${FB_PIXEL_ID}/events?access_token=${encodeURIComponent(
      FB_CAPI_ACCESS_TOKEN
    )}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Meta CAPI Error Response:", data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Meta CAPI Request Failed:", error);
    return { success: false, error: (error as Error).message };
  }
}
