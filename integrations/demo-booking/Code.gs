// Demo booking backend for johncrm.com. Runs as biz.johncrm@gmail.com, so it can
// read that calendar's free/busy, add events to it and send mail from it. The
// website is static and holds no Google credentials. Deployment: see README.md.

var CONFIG = {
  CALENDAR_ID: 'primary',
  NOTIFY_EMAIL: 'biz.johncrm@gmail.com',
  TIME_ZONE: 'Asia/Hong_Kong',
  UTC_OFFSET_HOURS: 8, // Hong Kong has no daylight saving.
  OPEN_HOUR: 10,
  CLOSE_HOUR: 18,
  SLOT_MINUTES: 30,
  NOTICE_MINUTES: 120,
  HORIZON_DAYS: 14,
  SLOTS_CACHE_SECONDS: 60,
  LOCK_WAIT_MS: 10000,
  // This endpoint is public and sends calendar invites, so cap what it can be made to send.
  MAX_BOOKINGS_PER_EMAIL_PER_DAY: 2,
  MAX_BOOKINGS_PER_DAY: 20,
};

var MINUTE_MS = 60 * 1000;
var HOUR_MS = 60 * MINUTE_MS;
var DAY_MS = 24 * HOUR_MS;

/* ------------------------------- web app entry ------------------------------ */

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'slots') {
    try {
      return jsonResponse({ ok: true, slots: getCachedFreeSlots() });
    } catch (err) {
      console.error('Loading slots failed', err);
      return jsonResponse({ ok: false, code: 'server_error' });
    }
  }
  return jsonResponse({ ok: false, code: 'invalid' });
}

function doPost(e) {
  var input;
  try {
    input = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ ok: false, code: 'invalid' });
  }

  // A real person never sees the honeypot. Report success so bots learn nothing.
  if (input && input.botcheck) return jsonResponse({ ok: true });

  var booking = validateBooking(input, Date.now());
  if (!booking) return jsonResponse({ ok: false, code: 'invalid' });

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(CONFIG.LOCK_WAIT_MS)) return jsonResponse({ ok: false, code: 'server_error' });

  try {
    return jsonResponse(bookSlot(booking));
  } catch (err) {
    console.error('Booking failed', err);
    return jsonResponse({ ok: false, code: 'server_error' });
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/* ------------------------------ slot arithmetic ----------------------------- */

/** Every 30-minute start time from open to close, every day, within the booking window. */
function buildCandidateSlots(nowMs) {
  var offsetMs = CONFIG.UTC_OFFSET_HOURS * HOUR_MS;
  var localToday = Math.floor((nowMs + offsetMs) / DAY_MS) * DAY_MS;
  var earliest = nowMs + CONFIG.NOTICE_MINUTES * MINUTE_MS;
  var slots = [];

  for (var day = 0; day <= CONFIG.HORIZON_DAYS; day++) {
    var localMidnight = localToday + day * DAY_MS;
    for (
      var minutes = CONFIG.OPEN_HOUR * 60;
      minutes < CONFIG.CLOSE_HOUR * 60;
      minutes += CONFIG.SLOT_MINUTES
    ) {
      var start = localMidnight + minutes * MINUTE_MS - offsetMs;
      if (start >= earliest) slots.push(start);
    }
  }
  return slots;
}

/** Drops any slot overlapping a busy range. `busy` is [{ start, end }] of ISO strings. */
function filterFreeSlots(slots, busy) {
  var slotMs = CONFIG.SLOT_MINUTES * MINUTE_MS;
  return slots.filter(function (start) {
    return !busy.some(function (range) {
      return start < Date.parse(range.end) && start + slotMs > Date.parse(range.start);
    });
  });
}

function queryBusy(startMs, endMs) {
  var response = Calendar.Freebusy.query({
    timeMin: new Date(startMs).toISOString(),
    timeMax: new Date(endMs).toISOString(),
    timeZone: CONFIG.TIME_ZONE,
    items: [{ id: CONFIG.CALENDAR_ID }],
  });
  var calendar = response.calendars[CONFIG.CALENDAR_ID];
  // Without this check an unreadable calendar would look entirely free.
  if (!calendar || (calendar.errors && calendar.errors.length)) {
    throw new Error('Free/busy unavailable: ' + JSON.stringify(calendar && calendar.errors));
  }
  return calendar.busy || [];
}

function getFreeSlots(nowMs) {
  var slots = buildCandidateSlots(nowMs);
  if (!slots.length) return [];
  var busy = queryBusy(slots[0], slots[slots.length - 1] + CONFIG.SLOT_MINUTES * MINUTE_MS);
  return filterFreeSlots(slots, busy).map(function (start) {
    return new Date(start).toISOString();
  });
}

function getCachedFreeSlots() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('slots');
  if (cached) return JSON.parse(cached);
  var slots = getFreeSlots(Date.now());
  cache.put('slots', JSON.stringify(slots), CONFIG.SLOTS_CACHE_SECONDS);
  return slots;
}

/* -------------------------------- validation -------------------------------- */

function cleanLine(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\r\n\t]+/g, ' ').trim().slice(0, maxLength);
}

function hasLink(value) {
  return /:\/\/|www\.|\.(com|net|org|io|ru|cn|xyz)\b/i.test(value);
}

/** Returns a clean booking, or null. Name and company reach the invite, so no links there. */
function validateBooking(input, nowMs) {
  if (!input || typeof input !== 'object') return null;

  var name = cleanLine(input.name, 100);
  var company = cleanLine(input.company, 100);
  var email = cleanLine(input.email, 200).toLowerCase();
  var message = typeof input.message === 'string' ? input.message.trim().slice(0, 2000) : '';
  var language = cleanLine(input.language, 10);
  var start = typeof input.slot === 'string' ? Date.parse(input.slot) : NaN;

  if (!name || !company || hasLink(name) || hasLink(company)) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (buildCandidateSlots(nowMs).indexOf(start) === -1) return null;

  return {
    name: name,
    company: company,
    email: email,
    message: message,
    language: language,
    start: start,
  };
}

/* ---------------------------------- booking --------------------------------- */

/** Counts live in one property for the current HKT day, so yesterday's reset themselves. */
function checkAndCountBooking(email, nowMs) {
  var today = new Date(nowMs + CONFIG.UTC_OFFSET_HOURS * HOUR_MS).toISOString().slice(0, 10);
  var properties = PropertiesService.getScriptProperties();
  var stored = JSON.parse(properties.getProperty('bookingCounts') || 'null');
  var counts = stored && stored.date === today ? stored : { date: today, total: 0, emails: {} };

  if (counts.total >= CONFIG.MAX_BOOKINGS_PER_DAY) return 'booking_closed';
  if ((counts.emails[email] || 0) >= CONFIG.MAX_BOOKINGS_PER_EMAIL_PER_DAY) return 'rate_limited';

  counts.total += 1;
  counts.emails[email] = (counts.emails[email] || 0) + 1;
  properties.setProperty('bookingCounts', JSON.stringify(counts));
  return null;
}

function formatHkt(ms) {
  return Utilities.formatDate(new Date(ms), CONFIG.TIME_ZONE, 'EEE d MMM yyyy, h:mm a') + ' HKT';
}

function bookSlot(booking) {
  var end = booking.start + CONFIG.SLOT_MINUTES * MINUTE_MS;

  // Re-check under the lock: the visitor's slot list may be up to a minute old.
  if (queryBusy(booking.start, end).length) return { ok: false, code: 'slot_taken' };

  var refused = checkAndCountBooking(booking.email, Date.now());
  if (refused) return { ok: false, code: refused };

  // The visitor sees this event, so their free-text message stays out of it and
  // goes only to the team email below. That keeps invites from carrying spam.
  var event = Calendar.Events.insert(
    {
      summary: 'JOHN CRM demo: ' + booking.company,
      description: [
        'Name: ' + booking.name,
        'Company: ' + booking.company,
        'Email: ' + booking.email,
        '',
        'Booked from johncrm.com',
      ].join('\n'),
      start: { dateTime: new Date(booking.start).toISOString(), timeZone: CONFIG.TIME_ZONE },
      end: { dateTime: new Date(end).toISOString(), timeZone: CONFIG.TIME_ZONE },
      attendees: [{ email: booking.email, displayName: booking.name }],
      conferenceData: {
        createRequest: {
          requestId: Utilities.getUuid(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
    CONFIG.CALENDAR_ID,
    { conferenceDataVersion: 1, sendUpdates: 'all' },
  );

  CacheService.getScriptCache().remove('slots');

  // The booking already exists on the calendar, so a mail failure must not undo it.
  try {
    MailApp.sendEmail({
      to: CONFIG.NOTIFY_EMAIL,
      replyTo: booking.email,
      name: 'JOHN CRM Website',
      subject: '[Demo Request] JOHN CRM: ' + booking.company + ', ' + formatHkt(booking.start),
      body: [
        'New demo booked from johncrm.com.',
        '',
        'When: ' + formatHkt(booking.start),
        'Name: ' + booking.name,
        'Company: ' + booking.company,
        'Email: ' + booking.email,
        'Language: ' + (booking.language || 'Not given'),
        '',
        'Message:',
        booking.message || '(none)',
        '',
        'Calendar event: ' + (event.htmlLink || ''),
        'Google Meet: ' + (event.hangoutLink || ''),
      ].join('\n'),
    });
  } catch (err) {
    console.error('Booked, but the notification email failed', err);
  }

  return { ok: true, slot: new Date(booking.start).toISOString() };
}
