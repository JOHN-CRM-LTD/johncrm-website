import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { groupSlotsByDay, visitorTimeZone } from '../../lib/demo-slots';

type DemoSlotPickerProps = {
  slots: readonly string[];
  value: string;
  onChange: (slot: string) => void;
  locale: string;
  dateLabel: string;
  timeLabel: string;
  timeZoneNote: string;
  hktLabel: string;
};

/** Roving tabindex: one tab stop per group, arrow keys move between its options. */
function moveWithArrows<T>(
  event: KeyboardEvent<HTMLElement>,
  items: readonly T[],
  activeIndex: number,
  select: (item: T) => void,
) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
  if (!step || !items.length) return;
  event.preventDefault();
  const next = (activeIndex + step + items.length) % items.length;
  select(items[next]);
  const options = event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]');
  options[next]?.focus();
}

export default function DemoSlotPicker({
  slots,
  value,
  onChange,
  locale,
  dateLabel,
  timeLabel,
  timeZoneNote,
  hktLabel,
}: DemoSlotPickerProps) {
  const timeZone = useRef(visitorTimeZone()).current;
  const days = useMemo(() => groupSlotsByDay(slots, timeZone, locale), [slots, timeZone, locale]);
  const [dayKey, setDayKey] = useState('');

  const selectedDay = days.find((day) => day.slots.some((slot) => slot.iso === value));
  const activeDay = selectedDay ?? days.find((day) => day.key === dayKey) ?? days[0];

  // A reload can remove the visitor's chosen slot, so don't keep submitting a stale one.
  useEffect(() => {
    if (value && !slots.includes(value)) onChange('');
  }, [slots, value, onChange]);

  if (!activeDay) return null;

  const activeDayIndex = days.indexOf(activeDay);
  const activeSlotIndex = activeDay.slots.findIndex((slot) => slot.iso === value);
  // Windows in Hong Kong often reports Asia/Shanghai, so name the zone only when it differs.
  const zoneName = activeDay.slots[0].hktTime === null ? hktLabel : timeZone.replaceAll('_', ' ');

  const selectDay = (key: string) => {
    if (key === activeDay.key) return;
    setDayKey(key);
    onChange('');
  };

  return (
    <div className="demo-slot-picker mt-2">
      <div
        role="radiogroup"
        aria-label={dateLabel}
        className="demo-slot-days"
        onKeyDown={(event) =>
          moveWithArrows(event, days, activeDayIndex, (day) => selectDay(day.key))
        }
      >
        {days.map((day) => {
          const selected = day === activeDay;
          return (
            <button
              key={day.key}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectDay(day.key)}
              className="demo-slot-day"
            >
              <span>{day.weekday}</span>
              <strong>{day.date}</strong>
            </button>
          );
        })}
      </div>
      <div
        role="radiogroup"
        aria-label={timeLabel}
        className="demo-slot-times"
        onKeyDown={(event) =>
          moveWithArrows(event, activeDay.slots, activeSlotIndex, (slot) => onChange(slot.iso))
        }
      >
        {activeDay.slots.map((slot, index) => {
          const selected = slot.iso === value;
          return (
            <button
              key={slot.iso}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || (activeSlotIndex === -1 && index === 0) ? 0 : -1}
              onClick={() => onChange(slot.iso)}
              className="demo-slot-time"
            >
              <span>{slot.time}</span>
              {slot.hktTime && (
                <small>
                  {slot.hktTime} {hktLabel}
                </small>
              )}
            </button>
          );
        })}
      </div>
      <p className="demo-slot-note">{timeZoneNote.replace('{timeZone}', zoneName)}</p>
    </div>
  );
}
