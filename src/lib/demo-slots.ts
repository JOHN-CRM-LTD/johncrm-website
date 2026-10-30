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

export type DemoSlotCell = {
  key: string;
  dayNumber: number;
  /** The bookable day on this date, or null when it has no slots. */
  day: DemoSlotDay | null;
};

/** Lays days out in whole Sunday-to-Saturday weeks, keeping the dates that have no slots. */
export function buildWeekGrid(days: readonly DemoSlotDay[]): DemoSlotCell[] {
  if (!days.length) return [];
  const DAY_MS = 86_400_000;
  const byKey = new Map(days.map((day) => [day.key, day]));
  const first = new Date(`${days[0].key}T00:00:00Z`);
  const last = new Date(`${days[days.length - 1].key}T00:00:00Z`);
  const start = first.getTime() - first.getUTCDay() * DAY_MS;
  const end = last.getTime() + (6 - last.getUTCDay()) * DAY_MS;

  const cells: DemoSlotCell[] = [];
  for (let ms = start; ms <= end; ms += DAY_MS) {
    const date = new Date(ms);
    const key = date.toISOString().slice(0, 10);
    cells.push({ key, dayNumber: date.getUTCDate(), day: byKey.get(key) ?? null });
  }
  return cells;
}

/** Sunday-first weekday names for the calendar's column headings. */
export function weekdayLabels(locale: string) {
  const weekday = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', weekday: 'short' });
  // 1 November 2026 is a Sunday.
  return Array.from({ length: 7 }, (_, index) => weekday.format(Date.UTC(2026, 10, 1 + index)));
}

/** Names the months the days span, such as "Oct – Nov 2026". */
export function monthRangeLabel(days: readonly DemoSlotDay[], timeZone: string, locale: string) {
  if (!days.length) return '';
  return new Intl.DateTimeFormat(locale, { timeZone, month: 'short', year: 'numeric' }).formatRange(
    new Date(days[0].slots[0].iso),
    new Date(days[days.length - 1].slots[0].iso),
  );
}

/** A reader-friendly zone name such as "Eastern Time", or the IANA name if there is none. */
export function timeZoneLabel(timeZone: string, locale: string) {
  const name = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: 'longGeneric' })
    .formatToParts(new Date())
    .find((part) => part.type === 'timeZoneName')?.value;
  return name || timeZone.replaceAll('_', ' ');
}

export function visitorTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || BOOKING_TIME_ZONE;
  } catch {
    return BOOKING_TIME_ZONE;
  }
}
