# Demo booking backend

A Google Apps Script web app that runs as biz.johncrm@gmail.com. The website's "Book a Demo" form uses it to:

- list free 30-minute slots, 10:00 AM to 6:00 PM HKT, every day, from 2 hours ahead up to 14 days out
- create a calendar event with a Google Meet link and invite the visitor
- email the request to biz.johncrm@gmail.com

Anything on that calendar blocks its slots, including all-day events, unless the event is marked "Free". To block a holiday, add an all-day event.

Until the site has the script's URL, the form asks for a preferred time and sends the request through Web3Forms instead. The same happens for visitors who can't reach Google, such as those in mainland China. Those requests create no calendar event.

## Set it up

1. Sign in to Google as **biz.johncrm@gmail.com** and open <https://script.google.com>. Use a browser profile with only that account signed in, because Apps Script can get confused by several signed-in accounts.
2. Click **New project** and name it `JOHN CRM demo booking`.
3. Open **Project Settings** (gear icon) and tick **Show "appsscript.json" manifest file in editor**.
4. Back in **Editor**, replace the contents of `appsscript.json` and `Code.gs` with the files in this folder, then save.
5. Click **Deploy > New deployment**. Choose the type **Web app**, set **Execute as** to **Me** and **Who has access** to **Anyone**, then click **Deploy**.
6. Approve the permission screen. Google will warn that the app is unverified, which is expected for your own script. Choose **Advanced**, then **Go to JOHN CRM demo booking**.
7. Copy the **Web app URL**, which ends in `/exec`.
8. Set `DEMO_BOOKING_URL` in `src/app/App.tsx` to that URL, then deploy the site. The URL is public by design.

Share the biz.johncrm calendar with the team (**Calendar settings > Share with specific people**) so bookings show up on their calendars too.

## Check it

Open `<Web app URL>?action=slots` in a private window. You should see `{"ok":true,"slots":[...]}`.

## Change it

Hours, notice period, booking window and the daily caps are in `CONFIG` at the top of `Code.gs`. After any edit, use **Deploy > Manage deployments**, edit the deployment and pick **New version**. Saving alone doesn't update the live URL. Choosing New version keeps the URL the same.

## Limits

- Consumer Gmail accounts can send about 100 emails a day through Apps Script.
- The script accepts at most 20 bookings a day and 2 per email address a day. Past the daily cap, requests fall back to Web3Forms so they aren't lost.
