export type CurrencyCode = 'USD' | 'CNY' | 'HKD' | 'EUR' | 'AUD' | 'CAD';

const REGION_CURRENCY: Partial<Record<string, CurrencyCode>> = {
  HK: 'HKD',
  AU: 'AUD',
  CA: 'CAD',
  CN: 'CNY',
  AD: 'EUR',
  AT: 'EUR',
  BE: 'EUR',
  BG: 'EUR',
  CY: 'EUR',
  DE: 'EUR',
  EE: 'EUR',
  ES: 'EUR',
  FI: 'EUR',
  FR: 'EUR',
  GR: 'EUR',
  HR: 'EUR',
  IE: 'EUR',
  IT: 'EUR',
  LT: 'EUR',
  LU: 'EUR',
  LV: 'EUR',
  MC: 'EUR',
  ME: 'EUR',
  MT: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  SI: 'EUR',
  SK: 'EUR',
  SM: 'EUR',
  VA: 'EUR',
  XK: 'EUR',
};

// Asia/Shanghai is deliberately absent. Windows has one "China Standard Time" zone
// for Beijing and Hong Kong and usually reports it as Asia/Shanghai, so that value
// says nothing about which of the two a visitor is in.
const AMBIGUOUS_TIME_ZONES = new Set(['Asia/Shanghai', 'Asia/Chongqing', 'Asia/Harbin', 'PRC']);

const TIME_ZONE_CURRENCY: Partial<Record<string, CurrencyCode>> = {
  'Asia/Hong_Kong': 'HKD',
  Hongkong: 'HKD',
  'Asia/Urumqi': 'CNY',
  'Antarctica/Macquarie': 'AUD',
  'Pacific/Norfolk': 'AUD',
  'America/Atikokan': 'CAD',
  'America/Blanc-Sablon': 'CAD',
  'America/Cambridge_Bay': 'CAD',
  'America/Creston': 'CAD',
  'America/Dawson': 'CAD',
  'America/Dawson_Creek': 'CAD',
  'America/Edmonton': 'CAD',
  'America/Fort_Nelson': 'CAD',
  'America/Glace_Bay': 'CAD',
  'America/Goose_Bay': 'CAD',
  'America/Halifax': 'CAD',
  'America/Inuvik': 'CAD',
  'America/Iqaluit': 'CAD',
  'America/Moncton': 'CAD',
  'America/Montreal': 'CAD',
  'America/Nipigon': 'CAD',
  'America/Pangnirtung': 'CAD',
  'America/Rainy_River': 'CAD',
  'America/Rankin_Inlet': 'CAD',
  'America/Regina': 'CAD',
  'America/Resolute': 'CAD',
  'America/St_Johns': 'CAD',
  'America/Swift_Current': 'CAD',
  'America/Thunder_Bay': 'CAD',
  'America/Toronto': 'CAD',
  'America/Vancouver': 'CAD',
  'America/Whitehorse': 'CAD',
  'America/Winnipeg': 'CAD',
  'America/Yellowknife': 'CAD',
  'Atlantic/Azores': 'EUR',
  'Atlantic/Canary': 'EUR',
  'Atlantic/Madeira': 'EUR',
  'Europe/Amsterdam': 'EUR',
  'Europe/Andorra': 'EUR',
  'Europe/Athens': 'EUR',
  'Europe/Berlin': 'EUR',
  'Europe/Bratislava': 'EUR',
  'Europe/Brussels': 'EUR',
  'Europe/Dublin': 'EUR',
  'Europe/Helsinki': 'EUR',
  'Europe/Lisbon': 'EUR',
  'Europe/Ljubljana': 'EUR',
  'Europe/Luxembourg': 'EUR',
  'Europe/Madrid': 'EUR',
  'Europe/Malta': 'EUR',
  'Europe/Mariehamn': 'EUR',
  'Europe/Monaco': 'EUR',
  'Europe/Nicosia': 'EUR',
  'Europe/Paris': 'EUR',
  'Europe/Podgorica': 'EUR',
  'Europe/Riga': 'EUR',
  'Europe/Rome': 'EUR',
  'Europe/San_Marino': 'EUR',
  'Europe/Sofia': 'EUR',
  'Europe/Tallinn': 'EUR',
  'Europe/Vatican': 'EUR',
  'Europe/Vienna': 'EUR',
  'Europe/Vilnius': 'EUR',
  'Europe/Zagreb': 'EUR',
};

export function currencyForTimeZone(timeZone: string | undefined): CurrencyCode | null {
  if (!timeZone) return null;
  if (timeZone.startsWith('Australia/')) return 'AUD';
  return TIME_ZONE_CURRENCY[timeZone] ?? null;
}

export function currencyForRegion(region: string | undefined): CurrencyCode | null {
  if (!region) return null;
  return REGION_CURRENCY[region.toUpperCase()] ?? null;
}

function currencyForLocales(locales: readonly string[]): CurrencyCode | null {
  for (const locale of locales) {
    try {
      const parsed = new Intl.Locale(locale);
      // Bare "zh" or "zh-Hans" carries no region, but maximizes to mainland China.
      const region = parsed.region ?? (parsed.language === 'zh' ? parsed.maximize().region : undefined);
      const localeCurrency = currencyForRegion(region);
      if (localeCurrency) return localeCurrency;
    } catch {
      // Ignore malformed or unsupported locale values.
    }
  }
  return null;
}

/** Best guess from browser settings alone, used until the country lookup returns or if it fails. */
export function currencyFromBrowserSignals(
  timeZone: string | undefined,
  locales: readonly string[],
): CurrencyCode {
  if (timeZone && AMBIGUOUS_TIME_ZONES.has(timeZone)) {
    return currencyForLocales(locales) ?? 'HKD';
  }
  return currencyForTimeZone(timeZone) ?? currencyForLocales(locales) ?? 'USD';
}

export function detectInitialCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'USD';

  let timeZone: string | undefined;
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // Fall through to the browser locale when Intl timezone data is unavailable.
  }

  const locales = navigator.languages?.length ? navigator.languages : [navigator.language];
  return currencyFromBrowserSignals(timeZone, locales);
}

// Cloudflare answers this for any origin with the caller's country as `loc=XX`.
// It isn't a formally documented API, so every failure falls back to browser signals.
const COUNTRY_LOOKUP_URL = 'https://www.cloudflare.com/cdn-cgi/trace';
const COUNTRY_LOOKUP_TIMEOUT_MS = 2500;

export function parseTraceCountry(trace: string): string | null {
  const country = /^loc=([A-Z]{2})\s*$/m.exec(trace)?.[1];
  return country && country !== 'XX' ? country : null;
}

/** The visitor's currency by actual country. USD for any country outside the supported set. */
export async function lookupVisitorCurrency(): Promise<CurrencyCode | null> {
  try {
    const res = await fetch(COUNTRY_LOOKUP_URL, {
      signal: AbortSignal.timeout(COUNTRY_LOOKUP_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const country = parseTraceCountry(await res.text());
    return country ? (currencyForRegion(country) ?? 'USD') : null;
  } catch {
    return null;
  }
}
