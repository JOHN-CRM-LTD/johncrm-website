import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const { formatSlotTime, groupSlotsByDay, parseSlotsResponse } = await import('../src/lib/demo-slots.ts');
const source = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');

const TEN_AM_HKT = '2026-11-02T02:00:00.000Z';
const FIVE_THIRTY_PM_HKT = '2026-11-02T09:30:00.000Z';
const NEXT_DAY_TEN_AM_HKT = '2026-11-03T02:00:00.000Z';

test('slot responses keep future times in order and reject anything malformed', () => {
  const now = Date.parse('2026-11-02T00:00:00Z');
  assert.deepEqual(
    parseSlotsResponse({ ok: true, slots: [NEXT_DAY_TEN_AM_HKT, TEN_AM_HKT, '2026-11-01T02:00:00Z', 'soon', 7] }, now),
    [TEN_AM_HKT, NEXT_DAY_TEN_AM_HKT],
  );
  assert.throws(() => parseSlotsResponse({ ok: false, code: 'server_error' }, now));
  assert.throws(() => parseSlotsResponse({ ok: true }, now));
  assert.throws(() => parseSlotsResponse(null, now));
});

test('visitors in HKT see one time per slot', () => {
  const [day] = groupSlotsByDay([TEN_AM_HKT], 'Asia/Hong_Kong', 'en-US');
  assert.equal(day.slots[0].time, '10:00 AM');
  assert.equal(day.slots[0].hktTime, null);
});

test('Asia/Shanghai reads the same as HKT, so it shows one time too', () => {
  const [day] = groupSlotsByDay([TEN_AM_HKT], 'Asia/Shanghai', 'en-US');
  assert.equal(day.slots[0].hktTime, null);
});

test('other timezones see their local time with HKT alongside', () => {
  const [day] = groupSlotsByDay([TEN_AM_HKT], 'America/Toronto', 'en-US');
  assert.equal(day.slots[0].time, '9:00 PM');
  assert.equal(day.slots[0].hktTime, '10:00 AM');
});

test('slots group by the visitor’s own calendar day', () => {
  const inHongKong = groupSlotsByDay([TEN_AM_HKT, FIVE_THIRTY_PM_HKT, NEXT_DAY_TEN_AM_HKT], 'Asia/Hong_Kong', 'en-US');
  assert.deepEqual(inHongKong.map((day) => day.slots.length), [2, 1]);
  assert.equal(inHongKong[0].key, '2026-11-02');

  // In Toronto, 10:00 AM HKT on the 2nd is still the evening of the 1st.
  const inToronto = groupSlotsByDay([TEN_AM_HKT, FIVE_THIRTY_PM_HKT], 'America/Toronto', 'en-US');
  assert.deepEqual(inToronto.map((day) => day.key), ['2026-11-01', '2026-11-02']);
});

test('slot times format per locale', () => {
  assert.equal(formatSlotTime(FIVE_THIRTY_PM_HKT, 'Asia/Hong_Kong', 'en-US'), '5:30 PM');
});

test('booking goes to the Apps Script backend, with Web3Forms as the fallback', () => {
  assert.match(source, /SALES_CONTACT_EMAIL = 'biz\.johncrm@gmail\.com'/);
  assert.match(source, /'Content-Type': 'text\/plain;charset=utf-8'/);
  assert.match(source, /outcome\.code === 'slot_taken'/);
  assert.match(source, /await sendViaWeb3Forms\(fields\)/);
  assert.match(source, /name="preferred_time"/);
});
