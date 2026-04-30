import 'server-only';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';

import { db } from '@/server/db/client';
import { lead_attribution } from '@/server/db/schema';
import { ulid } from '@/server/lib/ulid';

export const attributionInputSchema = z.object({
  utm_source: z.string().max(255).optional(),
  utm_medium: z.string().max(255).optional(),
  utm_campaign: z.string().max(255).optional(),
  utm_term: z.string().max(255).optional(),
  utm_content: z.string().max(255).optional(),
  gclid: z.string().max(500).optional(),
  fbclid: z.string().max(500).optional(),
  msclkid: z.string().max(500).optional(),
  ttclid: z.string().max(500).optional(),
  referrer: z.string().url().optional().or(z.literal('')),
  first_landing_page: z.string().max(2000).optional(),
  last_landing_page: z.string().max(2000).optional(),
  fbp: z.string().max(500).optional(),
  fbc: z.string().max(500).optional(),
});

export type AttributionInput = z.infer<typeof attributionInputSchema>;

export interface GeoData {
  country?: string;
  region?: string;
  city?: string;
}

export interface DeviceData {
  device?: string;
  browser?: string;
  os?: string;
}

const ATTRIBUTION_FIELDS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'msclkid',
  'ttclid',
  'referrer',
  'first_landing_page',
  'last_landing_page',
  'fbp',
  'fbc',
] as const;

/**
 * User-Agent parsing manual (sem dep externa).
 * Suficiente pra agregação de marketing — não pretende ser feature-complete.
 */
function parseUserAgent(ua: string | null | undefined): DeviceData {
  if (!ua) return {};
  const result: DeviceData = {};

  // Device kind
  if (/iPad|Tablet|PlayBook|(?:Android(?!.*Mobile))/i.test(ua)) {
    result.device = 'tablet';
  } else if (/Mobi|Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    result.device = 'mobile';
  } else {
    result.device = 'desktop';
  }

  // Browser family — ordem importa (Edge contém "Chrome", Chrome contém "Safari")
  if (/Edg\//i.test(ua)) result.browser = 'Edge';
  else if (/OPR\/|Opera/i.test(ua)) result.browser = 'Opera';
  else if (/Firefox\//i.test(ua)) result.browser = 'Firefox';
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) result.browser = 'Chrome';
  else if (/Chromium/i.test(ua)) result.browser = 'Chromium';
  else if (/Safari\//i.test(ua)) result.browser = 'Safari';
  else if (/MSIE|Trident\//i.test(ua)) result.browser = 'IE';

  // OS — iOS antes de macOS (iPad UA recente diz "Mac OS X")
  if (/iPhone|iPod/i.test(ua)) result.os = 'iOS';
  else if (/iPad/i.test(ua)) result.os = 'iPadOS';
  else if (/Android/i.test(ua)) result.os = 'Android';
  else if (/Windows NT/i.test(ua)) result.os = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(ua)) result.os = 'macOS';
  else if (/CrOS/i.test(ua)) result.os = 'ChromeOS';
  else if (/Linux/i.test(ua)) result.os = 'Linux';

  return result;
}

function pickAttributionFields(body: Record<string, unknown>): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  for (const key of ATTRIBUTION_FIELDS) {
    if (key in body) picked[key] = body[key];
  }
  return picked;
}

export async function extractAttributionFromRequest(
  req: NextRequest,
  body: Record<string, unknown>
): Promise<{
  attribution: AttributionInput;
  geo: GeoData;
  device: DeviceData;
}> {
  const candidate = pickAttributionFields(body);
  const parsed = attributionInputSchema.safeParse(candidate);
  const attribution: AttributionInput = parsed.success ? parsed.data : {};

  const country = req.headers.get('cf-ipcountry') ?? undefined;
  const region = req.headers.get('cf-region') ?? undefined;
  const city = req.headers.get('cf-ipcity') ?? undefined;
  const geo: GeoData = {
    ...(country ? { country } : {}),
    ...(region ? { region } : {}),
    ...(city ? { city } : {}),
  };

  const device = parseUserAgent(req.headers.get('user-agent'));

  return { attribution, geo, device };
}

export async function persistAttribution(input: {
  attribution: AttributionInput;
  geo: GeoData;
  device: DeviceData;
  contact_id?: string;
}): Promise<string> {
  const id = ulid();
  const { attribution, geo, device, contact_id } = input;

  await db.insert(lead_attribution).values({
    id,
    contact_id: contact_id ?? null,
    utm_source: attribution.utm_source ?? null,
    utm_medium: attribution.utm_medium ?? null,
    utm_campaign: attribution.utm_campaign ?? null,
    utm_term: attribution.utm_term ?? null,
    utm_content: attribution.utm_content ?? null,
    gclid: attribution.gclid ?? null,
    fbclid: attribution.fbclid ?? null,
    msclkid: attribution.msclkid ?? null,
    ttclid: attribution.ttclid ?? null,
    referrer: attribution.referrer ? attribution.referrer : null,
    first_landing_page: attribution.first_landing_page ?? null,
    last_landing_page: attribution.last_landing_page ?? null,
    device: device.device ?? null,
    browser: device.browser ?? null,
    os: device.os ?? null,
    country: geo.country ?? null,
    region: geo.region ?? null,
    city: geo.city ?? null,
    fbp: attribution.fbp ?? null,
    fbc: attribution.fbc ?? null,
  });

  return id;
}

export async function linkAttributionToContact(
  attribution_id: string,
  contact_id: string
): Promise<void> {
  await db
    .update(lead_attribution)
    .set({ contact_id, updated_at: new Date() })
    .where(eq(lead_attribution.id, attribution_id));
}
