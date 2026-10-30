export const BOOKING_TIME_ZONE = 'Asia/Hong_Kong';

export type DemoSlot = {
  /** The slot's start, as the ISO string the booking backend expects back. */
  iso: string;
  time: string;
  /** The same start in HKT, or null when the visitor's clock already matches it. */
  hktTime: string | null;
};

export type DemoSlotDay = {
  key: string;
  weekday: string;
  date: string;
  slots: DemoSlot[];
};

/** Keeps only well-formed future start times from a backend response, oldest first. */
export function parseSlotsResponse(payload: unknown, nowMs: number): string[] {
  const slots = (payload as { ok?: unknown; slots?: unknown } | null)?.slots;
  if (!(payload as { ok?: unknown } | null)?.ok || !Array.isArray(slots)) {
    throw new Error('Unexpected slots response');
  }
  return slots
    .filter((slot): slot is string => typeof slot === 'string' && Date.parse(slot) > nowMs)
    .sort((a, b) => Date.parse(a) - Date.parse(b));
}

export function formatSlotTime(iso: string, timeZone: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatSlotDateTime(iso: string, timeZone: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

/** Groups slots by the visitor's own calendar day, which can differ from the HKT day. */
export function groupSlotsByDay(slots: readonly string[], timeZone: string, locale: string): DemoSlotDay[] {
  const dayKey = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const weekday = new Intl.DateTimeFormat(locale, { timeZone, weekday: 'short' });
  const date = new Intl.DateTimeFormat(locale, { timeZone, month: 'short', day: 'numeric' });

  const days = new Map<string, DemoSlotDay>();
  for (const iso of slots) {
    const start = new Date(iso);
    const key = dayKey.format(start);
    let day = days.get(key);
    if (!day) {
      day = { key, weekday: weekday.format(start), date: date.format(start), slots: [] };
      days.set(key, day);
    }
    const time = formatSlotTime(iso, timeZone, locale);
    const hktTime = formatSlotTime(iso, BOOKING_TIME_ZONE, locale);
    day.slots.push({ iso, time, hktTime: hktTime === time ? null : hktTime });
  }
  return [...days.values()];
}

export function visitorTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || BOOKING_TIME_ZONE;
  } catch {
    return BOOKING_TIME_ZONE;
  }
}
