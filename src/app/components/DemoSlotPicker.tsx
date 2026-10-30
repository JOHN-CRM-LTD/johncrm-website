import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { CalendarDays, Globe, X } from 'lucide-react';
import {
  buildWeekGrid,
  formatSlotDateTime,
  groupSlotsByDay,
  monthRangeLabel,
  timeZoneLabel,
  visitorTimeZone,
  weekdayLabels,
} from '../../lib/demo-slots';

type DemoSlotPickerProps = {
  slots: readonly string[];
  value: string;
  onChange: (slot: string) => void;
  locale: string;
  placeholder: string;
  dialogTitle: string;
  confirmLabel: string;
  closeLabel: string;
  dateLabel: string;
  timeLabel: string;
  timeZoneNote: string;
  hktLabel: string;
};

/** Matches the popup's exit animation in product-landing.css. */
const CLOSE_MS = 160;

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
  placeholder,
  dialogTitle,
  confirmLabel,
  closeLabel,
  dateLabel,
  timeLabel,
  timeZoneNote,
  hktLabel,
}: DemoSlotPickerProps) {
  const timeZone = useRef(visitorTimeZone()).current;
  const days = useMemo(() => groupSlotsByDay(slots, timeZone, locale), [slots, timeZone, locale]);
  const cells = useMemo(() => buildWeekGrid(days), [days]);
  const weekdays = useMemo(() => weekdayLabels(locale), [locale]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Choices stay a draft until Confirm, so cancelling leaves the form's time alone.
  const [draftDayKey, setDraftDayKey] = useState('');
  const [draftSlot, setDraftSlot] = useState('');
  const [closing, setClosing] = useState(false);

  // A reload can remove the visitor's chosen slot, so don't keep submitting a stale one.
  useEffect(() => {
    if (value && !slots.includes(value)) onChange('');
  }, [slots, value, onChange]);

  // Stay open for the exit animation, then let the dialog hand focus back to the field.
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => {
      dialogRef.current?.close();
      setClosing(false);
    }, CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [closing]);

  if (!days.length) return null;

  const activeDay = days.find((day) => day.key === draftDayKey) ?? days[0];
  const activeDayIndex = days.indexOf(activeDay);
  const activeSlotIndex = activeDay.slots.findIndex((slot) => slot.iso === draftSlot);
  // Windows in Hong Kong often reports Asia/Shanghai, so name the zone only when it differs.
  const zoneName = days[0].slots[0].hktTime === null ? hktLabel : timeZoneLabel(timeZone, locale);

  const openDialog = () => {
    const chosenDay = days.find((day) => day.slots.some((slot) => slot.iso === value));
    setDraftDayKey((chosenDay ?? days[0]).key);
    setDraftSlot(chosenDay ? value : '');
    setClosing(false);
    dialogRef.current?.showModal();
  };

  const selectDay = (key: string) => {
    if (key === activeDay.key) return;
    setDraftDayKey(key);
    setDraftSlot('');
  };

  const confirm = () => {
    onChange(draftSlot);
    setClosing(true);
  };

  return (
    <div className="demo-slot-picker mt-2">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-labelledby="demo-slot-label demo-slot-value"
        onClick={openDialog}
        className="demo-slot-trigger"
        data-empty={value ? undefined : true}
      >
        <CalendarDays size={16} strokeWidth={1.75} aria-hidden="true" />
        <span id="demo-slot-value">
          {value ? formatSlotDateTime(value, timeZone, locale) : placeholder}
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="demo-slot-dialog-title"
        className="demo-slot-dialog"
        data-closing={closing ? true : undefined}
        onCancel={(event) => {
          event.preventDefault();
          setClosing(true);
        }}
        onClick={(event) => {
          // Only the backdrop reports the dialog itself as its target; the card covers the rest.
          if (event.target === event.currentTarget) setClosing(true);
        }}
      >
        <div className="demo-slot-card">
          <header className="demo-slot-header">
            <div>
              <h3 id="demo-slot-dialog-title" className="demo-slot-title">
                {dialogTitle}
              </h3>
              <p className="demo-slot-zone">
                <Globe size={13} strokeWidth={1.75} aria-hidden="true" />
                {timeZoneNote.replace('{timeZone}', zoneName)}
              </p>
            </div>
            <button
              type="button"
              aria-label={closeLabel}
              onClick={() => setClosing(true)}
              className="demo-slot-close"
            >
              <X size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </header>

          <div className="demo-slot-body">
            <div className="demo-slot-calendar">
              <p className="demo-slot-heading">{monthRangeLabel(days, timeZone, locale)}</p>
              <div className="demo-slot-weekdays" aria-hidden="true">
                {weekdays.map((weekday) => (
                  <span key={weekday}>{weekday}</span>
                ))}
              </div>
              <div
                role="radiogroup"
                aria-label={dateLabel}
                className="demo-slot-days"
                onKeyDown={(event) =>
                  moveWithArrows(event, days, activeDayIndex, (day) => selectDay(day.key))
                }
              >
                {cells.map(({ key, dayNumber, day }) => {
                  if (!day) {
                    return (
                      <span key={key} className="demo-slot-day-empty" aria-hidden="true">
                        {dayNumber}
                      </span>
                    );
                  }
                  const selected = day === activeDay;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={`${day.weekday}, ${day.date}`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => selectDay(day.key)}
                      className="demo-slot-day"
                    >
                      {dayNumber}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="demo-slot-day-times">
              <p className="demo-slot-heading">
                {activeDay.weekday}, {activeDay.date}
              </p>
              <div
                key={activeDay.key}
                role="radiogroup"
                aria-label={timeLabel}
                className="demo-slot-times"
                onKeyDown={(event) =>
                  moveWithArrows(event, activeDay.slots, activeSlotIndex, (slot) =>
                    setDraftSlot(slot.iso),
                  )
                }
              >
                {activeDay.slots.map((slot, index) => {
                  const selected = slot.iso === draftSlot;
                  return (
                    <button
                      key={slot.iso}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={selected || (activeSlotIndex === -1 && index === 0) ? 0 : -1}
                      onClick={() => setDraftSlot(slot.iso)}
                      className="demo-slot-time"
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <footer className="demo-slot-footer">
            <p aria-live="polite" className="demo-slot-summary" data-empty={draftSlot ? undefined : true}>
              {draftSlot
                ? formatSlotDateTime(draftSlot, timeZone, locale)
                : `${activeDay.weekday}, ${activeDay.date}`}
            </p>
            <button type="button" disabled={!draftSlot} onClick={confirm} className="demo-slot-confirm">
              {confirmLabel}
            </button>
          </footer>
        </div>
      </dialog>
    </div>
  );
}
