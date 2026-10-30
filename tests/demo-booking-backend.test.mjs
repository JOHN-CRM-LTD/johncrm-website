import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const script = await readFile(new URL('../integrations/demo-booking/Code.gs', import.meta.url), 'utf8');
const manifest = JSON.parse(
  await readFile(new URL('../integrations/demo-booking/appsscript.json', import.meta.url), 'utf8'),
);

const HOUR = 60 * 60 * 1000;
// 09:00 HKT on Monday 2 November 2026.
const NOW = Date.parse('2026-11-02T01:00:00Z');

const validInput = (overrides = {}) => ({
  name: 'Jane Analyst',
  company: 'Acme Industries',
  email: 'Jane@Acme.com',
  teamSize: '6 to 20',
  message: 'Hello',
  language: 'EN',
  slot: '2026-11-03T02:00:00.000Z',
  ...overrides,
});

/** Loads Code.gs with the Apps Script services replaced by in-memory stand-ins. */
function loadBackend({ busy = [], freebusyErrors, insertError, mailError, tryLock = true } = {}) {
  const calls = { inserted: [], mailed: [], freebusy: [], cacheRemoved: [], lockReleased: 0 };
  const properties = {};
  const cache = {};
  const context = {
    console: { error() {} },
    Date: class extends Date {
      constructor(...args) {
        super(...(args.length ? args : [NOW]));
      }
      static now() {
        return NOW;
      }
    },
    Calendar: {
      Freebusy: {
        query(request) {
          calls.freebusy.push(request);
          return { calendars: { primary: { busy, errors: freebusyErrors } } };
        },
      },
      Events: {
        insert(event, calendarId, options) {
          if (insertError) throw insertError;
          calls.inserted.push({ event, calendarId, options });
          return { htmlLink: 'https://calendar.example/event', hangoutLink: 'https://meet.example/abc' };
        },
      },
    },
    MailApp: {
      sendEmail(message) {
        if (mailError) throw mailError;
        calls.mailed.push(message);
      },
    },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => tryLock,
        releaseLock: () => {
          calls.lockReleased += 1;
        },
      }),
    },
    CacheService: {
      getScriptCache: () => ({
        get: (key) => cache[key] ?? null,
        put: (key, value) => {
          cache[key] = value;
        },
        remove: (key) => {
          calls.cacheRemoved.push(key);
          delete cache[key];
        },
      }),
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) => properties[key] ?? null,
        setProperty: (key, value) => {
          properties[key] = value;
        },
      }),
    },
    Utilities: {
      getUuid: () => 'uuid',
      formatDate: (date) => date.toISOString(),
    },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (text) => ({ text, setMimeType() { return this; } }),
    },
  };
  vm.createContext(context);
  vm.runInContext(script, context);
  const post = (input) =>
    JSON.parse(context.doPost({ postData: { contents: JSON.stringify(input) } }).text);
  const get = (parameter) => JSON.parse(context.doGet({ parameter }).text);
  return { context, calls, post, get };
}

test('slots run 10:00 to 17:30 HKT every day, from two hours ahead for 14 days', () => {
  const { context } = loadBackend();
  const slots = context.buildCandidateSlots(NOW);

  // 09:00 now, so today's first slot is 11:00 HKT.
  assert.equal(new Date(slots[0]).toISOString(), '2026-11-02T03:00:00.000Z');
  for (const slot of slots) {
    const hkt = new Date(slot + 8 * HOUR);
    const minutes = hkt.getUTCHours() * 60 + hkt.getUTCMinutes();
    assert.ok(minutes >= 10 * 60 && minutes <= 17 * 60 + 30, hkt.toISOString());
    assert.equal(minutes % 30, 0);
  }

  // Saturdays and Sundays are offered too.
  const days = new Set(slots.map((slot) => new Date(slot + 8 * HOUR).getUTCDay()));
  assert.equal(days.size, 7);

  // Today loses 10:00 and 10:30. The other 14 days have all 16 slots.
  assert.equal(slots.length, 14 + 14 * 16);
});

test('a late evening request starts from the next morning', () => {
  const { context } = loadBackend();
  const elevenPmHkt = Date.parse('2026-11-02T15:00:00Z');
  const [first] = context.buildCandidateSlots(elevenPmHkt);
  assert.equal(new Date(first).toISOString(), '2026-11-03T02:00:00.000Z');
});

test('busy ranges remove only the slots they overlap', () => {
  const { context } = loadBackend();
  const slots = [Date.parse('2026-11-03T02:00:00Z'), Date.parse('2026-11-03T02:30:00Z'), Date.parse('2026-11-03T03:00:00Z')];
  const free = context.filterFreeSlots(slots, [{ start: '2026-11-03T02:15:00Z', end: '2026-11-03T02:45:00Z' }]);
  assert.deepEqual(Array.from(free), [slots[2]]);

  const touching = context.filterFreeSlots(slots, [{ start: '2026-11-03T02:30:00Z', end: '2026-11-03T03:00:00Z' }]);
  assert.deepEqual(Array.from(touching), [slots[0], slots[2]]);
});

test('the slots endpoint returns times only and hides event details', () => {
  const { get } = loadBackend({ busy: [{ start: '2026-11-03T02:00:00Z', end: '2026-11-03T02:30:00Z' }] });
  const response = get({ action: 'slots' });
  assert.equal(response.ok, true);
  assert.ok(response.slots.length > 0);
  assert.ok(!response.slots.includes('2026-11-03T02:00:00.000Z'));
  assert.ok(response.slots.includes('2026-11-03T02:30:00.000Z'));
  assert.deepEqual(Object.keys(response).sort(), ['ok', 'slots']);
});

test('an unreadable calendar reports an error instead of looking free', () => {
  const { get } = loadBackend({ freebusyErrors: [{ reason: 'notFound' }] });
  assert.deepEqual(get({ action: 'slots' }), { ok: false, code: 'server_error' });
});

test('slots are cached between requests', () => {
  const { get, calls } = loadBackend();
  get({ action: 'slots' });
  get({ action: 'slots' });
  assert.equal(calls.freebusy.length, 1);
});

test('unknown GET actions are refused', () => {
  const { get } = loadBackend();
  assert.deepEqual(get({}), { ok: false, code: 'invalid' });
});

test('a booking creates the event with Meet and an invite, and emails the team', () => {
  const { post, calls } = loadBackend();
  assert.deepEqual(post(validInput()), { ok: true, slot: '2026-11-03T02:00:00.000Z' });

  const [{ event, calendarId, options }] = calls.inserted;
  assert.equal(calendarId, 'primary');
  assert.equal(options.sendUpdates, 'all');
  assert.equal(options.conferenceDataVersion, 1);
  assert.equal(event.summary, 'JOHN CRM demo: Acme Industries');
  assert.equal(event.start.dateTime, '2026-11-03T02:00:00.000Z');
  assert.equal(event.end.dateTime, '2026-11-03T02:30:00.000Z');
  assert.equal(event.attendees[0].email, 'jane@acme.com');
  assert.equal(event.conferenceData.createRequest.conferenceSolutionKey.type, 'hangoutsMeet');

  const [mail] = calls.mailed;
  assert.equal(mail.to, 'biz.johncrm@gmail.com');
  assert.equal(mail.replyTo, 'jane@acme.com');
  assert.match(mail.subject, /^\[Demo Request\] JOHN CRM: Acme Industries/);
  assert.match(mail.body, /Hello/);
  assert.match(mail.body, /https:\/\/meet\.example\/abc/);
  assert.deepEqual(Array.from(calls.cacheRemoved), ['slots']);
  assert.equal(calls.lockReleased, 1);
});

test('the visitor’s free-text message stays out of the invite', () => {
  const { post, calls } = loadBackend();
  post(validInput({ message: 'Buy my product now' }));
  assert.doesNotMatch(JSON.stringify(calls.inserted[0].event), /Buy my product/);
  assert.match(calls.mailed[0].body, /Buy my product/);
});

test('a slot booked meanwhile is refused and nothing is created', () => {
  const { post, calls } = loadBackend({ busy: [{ start: '2026-11-03T02:00:00Z', end: '2026-11-03T02:30:00Z' }] });
  assert.deepEqual(post(validInput()), { ok: false, code: 'slot_taken' });
  assert.equal(calls.inserted.length, 0);
  assert.equal(calls.mailed.length, 0);
});

test('invalid bookings are refused', () => {
  const cases = [
    { name: '' },
    { company: '' },
    { email: 'not-an-email' },
    { slot: 'tomorrow' },
    { slot: '2026-11-03T02:10:00.000Z' }, // Not on a slot boundary.
    { slot: '2026-11-03T01:30:00.000Z' }, // 09:30 HKT, before opening.
    { slot: '2026-11-03T10:00:00.000Z' }, // 18:00 HKT, closing time.
    { slot: '2026-11-02T02:00:00.000Z' }, // Inside the two hours' notice.
    { slot: '2027-01-05T02:00:00.000Z' }, // Past the booking window.
    { company: 'Visit https://spam.example' },
    { name: 'www.spam.example' },
  ];
  for (const overrides of cases) {
    const { post, calls } = loadBackend();
    assert.deepEqual(post(validInput(overrides)), { ok: false, code: 'invalid' }, JSON.stringify(overrides));
    assert.equal(calls.inserted.length, 0);
  }
});

test('malformed POST bodies are refused', () => {
  const { context } = loadBackend();
  const response = context.doPost({ postData: { contents: 'not json' } });
  assert.deepEqual(JSON.parse(response.text), { ok: false, code: 'invalid' });
});

test('the honeypot looks like success but books nothing', () => {
  const { post, calls } = loadBackend();
  assert.deepEqual(post(validInput({ botcheck: 'on' })), { ok: true });
  assert.equal(calls.inserted.length, 0);
  assert.equal(calls.mailed.length, 0);
});

test('one email address is limited per day', () => {
  const { post, calls } = loadBackend();
  assert.equal(post(validInput({ slot: '2026-11-03T02:00:00.000Z' })).ok, true);
  assert.equal(post(validInput({ slot: '2026-11-03T02:30:00.000Z', email: 'JANE@acme.com' })).ok, true);
  assert.deepEqual(post(validInput({ slot: '2026-11-03T03:00:00.000Z' })), { ok: false, code: 'rate_limited' });
  assert.equal(calls.inserted.length, 2);
});

test('the daily booking cap closes booking for everyone', () => {
  const { post } = loadBackend();
  for (let i = 0; i < 20; i += 1) {
    assert.equal(post(validInput({ email: `person${i}@acme.com` })).ok, true);
  }
  assert.deepEqual(post(validInput({ email: 'late@acme.com' })), { ok: false, code: 'booking_closed' });
});

test('a mail failure does not undo a booking that already exists', () => {
  const { post, calls } = loadBackend({ mailError: new Error('quota') });
  assert.equal(post(validInput()).ok, true);
  assert.equal(calls.inserted.length, 1);
});

test('a calendar failure reports an error and releases the lock', () => {
  const { post, calls } = loadBackend({ insertError: new Error('calendar down') });
  assert.deepEqual(post(validInput()), { ok: false, code: 'server_error' });
  assert.equal(calls.lockReleased, 1);
});

test('a busy lock reports an error so the site can fall back', () => {
  const { post, calls } = loadBackend({ tryLock: false });
  assert.deepEqual(post(validInput()), { ok: false, code: 'server_error' });
  assert.equal(calls.inserted.length, 0);
});

test('the manifest enables the Calendar service and allows anonymous visitors', () => {
  assert.deepEqual(manifest.webapp, { executeAs: 'USER_DEPLOYING', access: 'ANYONE_ANONYMOUS' });
  assert.equal(manifest.dependencies.enabledAdvancedServices[0].userSymbol, 'Calendar');
  assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/script.send_mail'));
});
