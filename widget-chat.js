/*!
 * JOHN CRM website chat widget. Self-contained inside a closed Shadow DOM.
 * Visitor supplied values are always rendered with textContent, never HTML.
 * Chat history lives only in the visitor's browser (localStorage) — the
 * widget never lists other sessions from the server.
 */
(function () {
  "use strict";
  var script = document.currentScript;
  if (!script) return;
  var SITE_KEY = script.getAttribute("data-site-key") || "";
  if (!SITE_KEY)
    return console.error("[johncrm-chat] data-site-key is required");
  var BASE = script.getAttribute("data-base") || new URL(script.src).origin;
  var API = BASE + "/api/webchat/public";
  var STORAGE_KEY = "johncrm-webchat:" + SITE_KEY;
  var LEGACY_STORAGE_KEY = "orvex-webchat:" + SITE_KEY;
  var MAX_CHATS = 20;
  var MAX_MESSAGES = 200;
  var MOBILE_QUERY = "(max-width: 640px)";
  var pageScrollLock = null;
  var pinchGuard = null;
  var panelMotion = null;
  var composerMotions = [];
  var newChatMotions = [];
  var outgoingFeed = null;
  var pageSlide = null;
  var swipe = null;
  var suppressSwipeClickUntil = 0;
  var state = {
    config: null,
    open: false,
    view: "chat",
    chats: [],
    activeToken: null,
    draftStartedAt: null,
    seen: {},
    unread: 0,
    pollTimer: null,
    sending: false,
    uploading: false,
    exporting: false,
    // In-flight lazy session mint (see ensureSession) — shared so a burst of
    // sends/uploads never mints two leads for one visitor.
    sessionPromise: null,
    attachments: [],
    // Someone (human agent or AI) is mid-response on the ACTIVE chat —
    // reported by the poll's `typing` flag; renders the "…" bubble and
    // speeds the poll up while true.
    typing: false,
    // Feed scroll position carried across hides; see saveFeedScroll.
    feedScroll: null,
  };

  function loadStore() {
    var legacyToken = null;
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw && raw.charAt(0) === "{") {
        var parsed = JSON.parse(raw);
        if (parsed && Object.prototype.toString.call(parsed.chats) === "[object Array]")
          state.chats = parsed.chats;
      } else if (raw) {
        // Pre-history format: the stored value was the bare visitor token.
        legacyToken = raw;
      } else {
        legacyToken = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      }
    } catch (e) {}
    if (legacyToken) {
      var iso = new Date().toISOString();
      state.chats = [
        {
          token: legacyToken,
          name: "",
          email: null,
          createdAt: iso,
          updatedAt: iso,
          closed: false,
          lastId: 0,
          messages: [],
        },
      ];
      saveStore();
    }
    state.chats.forEach(function (chat) {
      var seen = {};
      // Drops a message saved twice by an older widget version.
      chat.messages = (chat.messages || []).filter(function (message) {
        if (message.id == null) return true;
        if (seen[message.id]) return false;
        seen[message.id] = true;
        return true;
      });
      state.seen[chat.token] = seen;
    });
    sortChats();
    // Saved conversations are available in History. A website visit starts
    // with a local draft instead of automatically resuming the latest chat.
    state.activeToken = null;
  }
  function sortChats() {
    state.chats.sort(function (a, b) {
      return (
        Date.parse(b.updatedAt || b.createdAt || 0) -
        Date.parse(a.updatedAt || a.createdAt || 0)
      );
    });
  }
  function saveStore() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ v: 2, chats: state.chats }),
      );
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (e) {}
  }
  function activeChat() {
    for (var i = 0; i < state.chats.length; i++)
      if (state.chats[i].token === state.activeToken) return state.chats[i];
    return null;
  }
  function recordMessage(chat, message) {
    chat.messages = chat.messages || [];
    if (message.id != null)
      for (var i = 0; i < chat.messages.length; i++)
        if (chat.messages[i].id === message.id) return;
    chat.messages.push(message);
    if (chat.messages.length > MAX_MESSAGES)
      chat.messages.splice(0, chat.messages.length - MAX_MESSAGES);
    chat.updatedAt = message.at || new Date().toISOString();
    saveStore();
  }
  function getJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok)
        throw Object.assign(new Error("http " + r.status), {
          status: r.status,
        });
      return r.json();
    });
  }
  function postJSON(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok)
          throw Object.assign(
            new Error(data && data.error ? data.error : "http " + r.status),
            { status: r.status },
          );
        return data;
      });
    });
  }

  var host = document.createElement("div");
  host.setAttribute("data-johncrm-chat", "");
  var root = host.attachShadow ? host.attachShadow({ mode: "closed" }) : host;
  var el = {};
  // Register on the document because @property inside a shadow stylesheet is
  // not supported consistently. Another widget may already have registered it.
  if (window.CSS && window.CSS.registerProperty) {
    try {
      window.CSS.registerProperty({
        name: "--johncrm-scroll-thumb", syntax: "<color>", inherits: true,
        initialValue: "transparent",
      });
    } catch (e) {}
  }

  // Readable text color for surfaces painted with the brand color: WCAG
  // relative luminance decides white vs dark-slate, so a light brand color
  // (yellow, mint, white) no longer renders unreadable white-on-light. The
  // server guarantees `color` is normalized #rrggbb; anything else falls
  // back to white text.
  function textOn(hex) {
    var m = /^#([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return "#fff";
    var n = parseInt(m[1], 16);
    function lin(c) {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    var L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
    return L > 0.2 ? "#0f172a" : "#fff";
  }

  /** #rrggbb -> [r,g,b]; anything else -> null. */
  function rgb(hex) {
    var m = /^#([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return null;
    var n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function translucent(hex, opacity) {
    var color = rgb(hex);
    return color ? "rgba(" + color.join(",") + "," + opacity + ")" : hex;
  }

  /** Blend `amount` (0-1) of `tint` into `base`; both #rrggbb. */
  function mix(base, tint, amount) {
    var a = rgb(base);
    var b = rgb(tint);
    if (!a || !b) return base;
    var out = "#";
    for (var i = 0; i < 3; i++) {
      var v = Math.round(a[i] + (b[i] - a[i]) * amount);
      out += ("0" + v.toString(16)).slice(-2);
    }
    return out;
  }

  /**
   * Every surface in the widget is DERIVED from the one brand colour plus the
   * colour scheme: neutrals carry a few percent of the brand hue so a teal
   * widget and a magenta one each read as one designed object rather than a
   * brand-coloured header bolted onto grey chrome. Only the alert red and the
   * scrim stay fixed — they mean "error" and "shadow", not "brand".
   */
  function palette(brand, dark) {
    var fg = textOn(brand);
    return {
      brand: brand,
      onBrand: fg,
      brandHover: fg === "#fff" ? "rgba(255,255,255,.16)" : "rgba(15,23,42,.08)",
      surface: dark ? mix("#111a2b", brand, 0.08) : "#ffffff",
      feed: dark ? mix("#0b1220", brand, 0.1) : mix("#f8fafc", brand, 0.05),
      raised: dark ? mix("#1b2739", brand, 0.08) : "#ffffff",
      field: dark ? mix("#1f2c3f", brand, 0.12) : mix("#f1f5f9", brand, 0.06),
      border: dark ? mix("#33415a", brand, 0.1) : mix("#e2e8f0", brand, 0.08),
      borderStrong: dark ? mix("#475569", brand, 0.1) : "#94a3b8",
      text: dark ? "#e8eef7" : "#0f172a",
      muted: dark ? "#94a3b8" : "#64748b",
      faint: dark ? "#64748b" : "#94a3b8",
      danger: dark ? "#fb7185" : "#dc2626",
    };
  }

  function css(color, dark) {
    var p = palette(color, dark);
    return (
      ":host{all:initial}" +
      // The default tap highlight is a rectangle: on round buttons a press
      // would flash a square behind the icon before :active paints the
      // circle. Remove it; every touch control has its own :active state.
      "*,*:before,*:after{box-sizing:border-box;-webkit-tap-highlight-color:transparent}" +
      // Shadow DOM does not inherit the app's scrollbar styles. Keep native
      // wheel, touch, keyboard and thumb dragging, fading only the thumb colour.
      ".scroll-fade{--johncrm-scroll-thumb:transparent;scrollbar-width:thin;scrollbar-color:var(--johncrm-scroll-thumb) transparent;transition:--johncrm-scroll-thumb .25s ease}.scroll-fade.scrolling{--johncrm-scroll-thumb:" + translucent(p.muted, 0.5) + "}" +
      // Standard scrollbar-color overrides WebKit's button styling in Chromium.
      "@supports selector(::-webkit-scrollbar){.scroll-fade{scrollbar-width:auto;scrollbar-color:auto}}" +
      ".scroll-fade::-webkit-scrollbar{width:10px;height:10px}.scroll-fade::-webkit-scrollbar-track,.scroll-fade::-webkit-scrollbar-corner{background:transparent}.scroll-fade::-webkit-scrollbar-thumb{background:var(--johncrm-scroll-thumb);border:3px solid transparent;background-clip:content-box;border-radius:999px}.scroll-fade::-webkit-scrollbar-button{display:none;width:0;height:0}" +
      ".wrap{position:fixed;bottom:28px;right:28px;z-index:2147483000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif}" +
      ".bubble{position:relative;z-index:1;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.22);display:flex;align-items:center;justify-content:center;background:" +
      p.brand +
      ";transition:opacity .24s ease,transform .38s cubic-bezier(.22,1,.36,1)}" +
      ".bubble img.custom-png{width:100%;height:100%;border-radius:50%}" +
      ".bubble.hidden{opacity:0;pointer-events:none;transform:scale(.65)}.bubble svg{width:25px;height:25px;fill:" + p.onBrand + "}" +
      ".bubble img{width:28px;height:28px;object-fit:contain;pointer-events:none}" +
      ".badge{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;border-radius:10px;background:#e11d48;color:#fff;font-size:12px;font-weight:700;display:none;align-items:center;justify-content:center;padding:0 5px}" +
      // Keep the clipping shell transparent: a pale fill behind the header
      // bleeds through its anti-aliased edge, especially at fractional DPI.
      ".panel{position:absolute;bottom:70px;right:0;width:390px;max-width:calc(100vw - 32px);height:640px;max-height:calc(100vh - 110px);background:transparent;border-radius:10px;box-shadow:0 16px 44px rgba(0,0,0,.24);display:none;flex-direction:column;overflow:hidden;overscroll-behavior:contain;transform-origin:top left}.panel.open,.panel.closing{display:flex}.panel.closing{pointer-events:none}" +
      // Mobile keyboard/zoom transients: while the visual viewport animates,
      // the panel's visual-viewport rect can lag a frame behind and expose a
      // strip of the host page. This full-screen sheet sits behind the panel
      // so the visitor never glimpses the website through that strip.
      ".jc-backdrop{display:none}" +
      ".panel-body{flex:1;min-height:0;display:flex;flex-direction:column;background-color:" + p.feed + ";background-image:radial-gradient(circle," + mix(p.feed, p.muted, 0.24) + " 1px,transparent 1px);background-size:20px 20px}" +
      ".chat-actions{position:absolute;top:12px;left:12px;z-index:4;display:flex;align-items:center;padding:4px;border-radius:999px;background:" + translucent(p.surface, .94) + ";box-shadow:0 4px 18px rgba(15,23,42,.12);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}.chat-actions button,.panel-close{display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;border:0;border-radius:50%;background:transparent;color:" + p.muted + ";cursor:pointer}.chat-actions button:hover:not(:disabled),.chat-actions button:active:not(:disabled),.panel-close:hover,.panel-close:active{background:" + p.field + ";color:" + p.text + "}.chat-actions button:focus-visible,.panel-close:focus-visible{outline:2px solid " + p.borderStrong + ";outline-offset:-2px}.chat-actions button:disabled{opacity:.4;cursor:default}.chat-actions svg,.panel-close svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.panel-close{position:absolute;top:16px;right:16px;z-index:4}.panel-body{padding-top:76px}" +
      ".feed{flex:1;min-height:0;overflow-y:auto;padding:16px;background:transparent;display:flex;flex-direction:column;gap:9px;overscroll-behavior:contain}.msg{max-width:82%;padding:9px 13px;border-radius:16px;font-size:13.5px;line-height:1.45;white-space:pre-wrap;word-break:break-word}.msg.in{align-self:flex-start;background:" + p.raised + ";color:" + p.text + ";border:1px solid " + p.border + ";border-bottom-left-radius:5px}.msg.out{align-self:flex-end;background:" +
      p.brand +
      ";color:" + p.onBrand + ";border-bottom-right-radius:5px}.msg a{color:inherit;text-decoration:none}.msg img{display:block;max-width:210px;max-height:190px;border-radius:10px;margin-top:7px}.file{display:block;margin-top:7px;font-size:12px}" +
      ".msg-time{float:right;margin:6px 0 -2px 12px;font-size:10px;line-height:14px;white-space:nowrap;color:" + p.muted + "}.msg:not(.typing):after{content:'';display:block;clear:both}.msg.out .msg-time{color:inherit;opacity:.7}.conversation-intro{flex:none;text-align:center;color:" + p.muted + ";padding-bottom:5px;font-size:11px;line-height:1.5}.conversation-intro a{color:inherit;font-size:11px;font-weight:400;text-decoration:none}.conversation-intro a:focus-visible{outline:2px solid " + p.borderStrong + ";outline-offset:3px;border-radius:2px}" +
      ".compose{flex:none;background:transparent;padding:10px}.pending{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}.pending:empty{display:none}.pending-item{display:flex;align-items:center;gap:5px;max-width:100%;padding:4px 9px;border:1px solid " + p.border + ";border-radius:999px;font-size:11px;color:" + p.text + ";background:" + p.field + "}.pending-item button{border:0;background:transparent;color:" + p.muted + ";cursor:pointer;font-size:14px;line-height:1}.compose-row{display:flex;align-items:center;gap:8px}.compose-field{position:relative;flex:1;min-width:0}.compose textarea{display:block;width:100%;min-width:0;resize:none;border:1px solid " + p.border + ";background:" + p.raised + ";color:" + p.text + ";border-radius:22px;padding:11px 48px 11px 14px;font-size:13.5px;line-height:20px;font-family:inherit;height:44px;overflow-x:hidden;overflow-y:hidden;scrollbar-width:none;outline:none}.compose textarea::-webkit-scrollbar{display:none;width:0;height:0}.compose textarea::placeholder{color:" + p.muted + "}.compose textarea:focus{border-color:" +
      p.borderStrong +
      "}.icon-button{height:44px;width:44px;flex:none;border:0;border-radius:999px;cursor:pointer;display:flex;align-items:center;justify-content:center}.icon-button:focus-visible{outline:2px solid " + p.borderStrong + ";outline-offset:2px}.attach{position:absolute;right:0;top:0;background:transparent;color:" + p.muted + "}.attach:focus-visible{outline-offset:-4px}.attach:hover,.attach:active{color:" + p.text + "}.send{background:" +
      p.brand +
      ";color:" + p.onBrand + "}.icon-button:disabled{opacity:.5;cursor:default}.icon-button svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}" +
      ".msg.in:not(.typing){margin-left:40px;margin-top:22px;max-width:calc(100% - 40px)}.chatbot-name{position:absolute;left:0;top:-23px;max-width:100%;font-size:11px;line-height:18px;font-weight:500;color:" + p.muted + ";white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.chatbot-avatar{position:absolute;left:-40px;top:0;width:30px;height:30px;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:50%;background:" + p.field + ";color:" + p.text + ";font-size:12px;font-weight:600}.msg .chatbot-avatar img{width:100%;height:100%;max-width:none;max-height:none;object-fit:contain;border-radius:50%;margin:0}.msg.typing{margin-left:40px}" +
      // Consecutive incoming messages carry the sender once; follow-ups hug
      // the first bubble instead of repeating the avatar-name block.
      ".msg.in.continued,.msg.typing.continued{margin-top:2px}" +
      ".panel-body{position:relative}.feed{overflow-x:hidden}.feed-leaving{position:absolute;top:0;left:0;right:0;z-index:1;overflow:hidden;pointer-events:none}.feed-leaving .conversation-intro{visibility:hidden}" +
      ".panel-body{overflow:hidden}.chat-page{position:relative;display:flex;flex:1;min-height:0;flex-direction:column;background:inherit}.page-sliding{position:absolute!important;inset:76px 0 0;min-width:0;will-change:transform,filter}.draft-preview{pointer-events:none}" +
      // pan-y only, across the whole panel: a pinch starting anywhere inside
      // the chat zooms the page's visual viewport, which desyncs the
      // full-screen panel bound to it. The host page outside stays zoomable.
      "@media (max-width:640px){.panel,.feed,.hist{touch-action:pan-y}}" +
      ".msg{transform-origin:bottom left}.msg.out{transform-origin:bottom right}.msg.pending .msg-time{opacity:.45}" +
      ".send-wrap{display:flex;flex:none}.send{transition:background-color .18s ease,transform .18s cubic-bezier(.22,1,.36,1),box-shadow .18s ease}.send svg{transition:transform .18s cubic-bezier(.22,1,.36,1)}" +
      "@media (hover:hover) and (pointer:fine){.send:not(:disabled):hover{background-color:" + mix(p.brand, p.onBrand === "#fff" ? "#ffffff" : "#0f172a", 0.1) + "}.send:not(:disabled):hover svg{transform:translateX(3px)}}" +
      ".send:not(:disabled):active{transform:scale(.95);box-shadow:0 2px 5px " + translucent(p.brand, 0.16) + "}" +
      // Solid fills above remain the fallback when backdrop filtering is unavailable.
      "@supports (backdrop-filter:blur(4px)) or (-webkit-backdrop-filter:blur(4px)){" +
      ".msg{-webkit-backdrop-filter:blur(.7px) saturate(130%);backdrop-filter:blur(.7px) saturate(130%)}.compose textarea{-webkit-backdrop-filter:blur(4px) saturate(155%);backdrop-filter:blur(4px) saturate(155%)}" +
      ".msg.in,.compose textarea{background:" + translucent(p.raised, dark ? 0.56 : 0.4) + ";border-color:" + translucent(p.border, 0.55) + ";box-shadow:0 4px 16px rgba(15,23,42,.06),inset 0 1px 0 " + translucent("#ffffff", dark ? 0.13 : 0.75) + "}" +
      ".msg.in{background:" + translucent(p.raised, dark ? 0.44 : 0.3) + "}" +
      ".msg.out{background:" + translucent(p.brand, 0.96) + ";color:" + textOn(mix(p.feed, p.brand, 0.96)) + ";box-shadow:inset 0 1px 0 " + translucent(p.onBrand === "#fff" ? "#ffffff" : "#0f172a", 0.2) + "}" +
      "}" +
      ".hist{flex:1;min-height:0;display:none;flex-direction:column;gap:8px;padding:14px;background:" + p.feed + ";overflow-y:auto;overscroll-behavior:contain}" +
      ".hist-item{display:flex;align-items:center;gap:10px;background:" + p.raised + ";border:1px solid " + p.border + ";border-radius:14px;padding:10px 12px;cursor:pointer}.hist-item:hover,.hist-item:active{border-color:" + p.borderStrong + "}.hist-item.active{border-color:" +
      p.brand +
      "}.hist-main{flex:1;min-width:0}.hist-prev{margin:0;font-size:13px;color:" + p.text + ";white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hist-meta{margin:3px 0 0;font-size:11px;color:" + p.muted + ";display:flex;align-items:center;gap:6px}" +
      ".tag{display:inline-flex;padding:1px 8px;border-radius:999px;background:" + p.field + ";color:" + p.muted + ";font-size:10px;font-weight:600}" +
      ".hist-del{width:24px;height:24px}" +
      // Match the app's plain X, circular hover, and keyboard-only focus.
      "button.close-button{display:inline-flex;flex:none;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border:0;border-radius:50%;background:transparent;color:" + p.muted + ";box-shadow:none;outline:none;cursor:pointer;transition:background-color 150ms ease,color 150ms ease}.pending-item .close-button,.hist-del.close-button{width:24px;height:24px}.close-button svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}.pending-item .close-button svg,.hist-del.close-button svg{width:14px;height:14px}.close-button:hover,.close-button:active,.close-button:focus-visible{background:" + p.field + ";color:" + p.text + "}.close-button:focus-visible{outline:2px solid " + p.borderStrong + ";outline-offset:2px}" +
      ".hist-empty{margin:auto;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;color:" + p.muted + ";font-size:13px}" +
      ".pill-btn{border:none;border-radius:999px;background:" +
      p.brand +
      ";color:" + p.onBrand + ";font-weight:700;font-size:13px;padding:10px 18px;cursor:pointer}" +
      ".closed-note{display:none;flex-direction:column;align-items:center;gap:9px;border-top:1px solid " + p.border + ";background:" + p.surface + ";padding:14px;font-size:12.5px;color:" + p.muted + "}.closed-note p{margin:0}" +
      ".error{color:" + p.danger + ";font-size:12px;display:none;margin:0 0 7px;padding:0 4px}" +
      ".pre{flex:1;display:flex;flex-direction:column;gap:10px;padding:18px;background:" + p.feed + ";overflow-y:auto}.pre p{margin:0 0 2px;font-size:13.5px;color:" + p.text + ";line-height:1.5}.pre label{font-size:12px;font-weight:600;color:" + p.muted + "}.pre input{border:1px solid " + p.border + ";background:" + p.surface + ";color:" + p.text + ";border-radius:999px;padding:9px 14px;font-size:13.5px;font-family:inherit;outline:none}.pre input:focus{border-color:" + p.brand + "}.pre button{margin-top:6px;border:none;border-radius:999px;background:" + p.brand + ";color:" + p.onBrand + ";font-weight:700;font-size:13.5px;padding:11px;cursor:pointer}" +
      ".msg.typing{display:inline-flex;align-items:center;gap:4px;padding:13px 14px}" +
      ".msg.typing .dot{width:7px;height:7px;border-radius:50%;background:" + p.muted + ";opacity:.4;animation:jc-dot 1.2s infinite ease-in-out}" +
      ".msg.typing .dot:nth-child(2){animation-delay:.15s}.msg.typing .dot:nth-child(3){animation-delay:.3s}" +
      "@keyframes jc-dot{0%,60%,100%{opacity:.35;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}" +
      "@media (max-width:640px){" +
      ".wrap{right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom))}" +
      ".jc-backdrop.show{display:block;position:fixed;inset:0;background:" + p.feed + ";pointer-events:none}" +
      ".panel{position:fixed;top:var(--jc-viewport-top,0px);left:var(--jc-viewport-left,0px);right:auto;bottom:auto;width:var(--jc-viewport-width,100vw);max-width:none;height:var(--jc-viewport-height,100dvh);max-height:none;border-radius:0;box-shadow:none}" +
      ".chat-actions{top:max(12px,env(safe-area-inset-top));left:max(12px,env(safe-area-inset-left))}.panel-close{top:calc(max(12px,env(safe-area-inset-top)) + 4px);right:max(16px,env(safe-area-inset-right))}.panel-body{padding-top:calc(76px + env(safe-area-inset-top))}.page-sliding{top:calc(76px + env(safe-area-inset-top))}" +
      ".feed{padding:14px max(12px,env(safe-area-inset-right)) 14px max(12px,env(safe-area-inset-left));gap:10px}.msg{max-width:88%;padding:10px 13px;font-size:15px;line-height:1.5}.msg img{max-width:min(70vw,280px);max-height:240px}" +
      ".compose{padding:10px max(10px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left))}.compose textarea{padding-top:10px;padding-bottom:10px;font-size:16px;line-height:1.4}.icon-button svg{width:20px;height:20px}" +
      ".hist{padding:12px max(12px,env(safe-area-inset-right)) 12px max(12px,env(safe-area-inset-left))}.hist-item{min-height:64px;padding:11px 12px}.hist-prev{font-size:14px}.hist-meta{font-size:12px}.hist-del{min-width:44px;min-height:44px}.pill-btn{min-height:44px;font-size:14px}.closed-note{padding:16px}" +
      // Removing a pending attachment mid-typing is a thumb action: give the
      // chip's X a real target instead of the 24px desktop control.
      ".pending-item{min-height:36px}.pending-item .close-button{width:36px;height:36px}" +
      "}" +
      "@media (prefers-reduced-motion:reduce){.bubble,.send,.send svg,.scroll-fade,button.close-button{transition:none}.send:not(:disabled):active{transform:none}.msg.typing .dot{animation:none;opacity:.6}}"
    );
  }

  function isMobileViewport() {
    return window.matchMedia
      ? window.matchMedia(MOBILE_QUERY).matches
      : window.innerWidth <= 640;
  }

  // Phones and tablets expose a software keyboard with no Shift+Enter.
  function isCoarsePointer() {
    return !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  }

  // Software keyboards only open for taps on the field itself. Focusing the
  // textarea programmatically — opening the panel, switching chats — would
  // slam the keyboard over the conversation before the visitor chose to type,
  // so on touch devices the dialog surface takes focus instead; desktop keeps
  // the composer focused for immediate typing.
  function focusForTyping() {
    if (isCoarsePointer()) focusWithoutScrolling(el.panel);
    else focusWithoutScrolling(el.input);
  }

  // While the composer or viewport resizes (keyboard opening/closing, the
  // textarea growing), the feed's height changes under an unchanged scrollTop
  // and can strand the newest messages off-screen. A feed already at its
  // bottom stays pinned to the bottom.
  function feedPinnedToBottom() {
    var feed = el.feed;
    if (!feed || !feed.clientHeight) return false;
    return feed.scrollHeight - feed.scrollTop - feed.clientHeight < 48;
  }
  function pinFeedToBottom() {
    if (el.feed && el.feed.clientHeight) el.feed.scrollTop = el.feed.scrollHeight;
  }

  // Browsers drop a scroller's position when an ancestor is display:none'd
  // (WebKit zeroes it), so closing the panel or paging to History would send
  // the feed back to the greeting. The position is carried across hides:
  // null = nothing to restore, -1 = content was rebuilt while hidden and the
  // next show settles at the newest message.
  function saveFeedScroll() {
    if (state.feedScroll == null && el.feed && el.feed.clientHeight)
      state.feedScroll = el.feed.scrollTop;
  }
  function applySavedFeedScroll() {
    var feed = el.feed;
    if (!feed || !feed.clientHeight || state.feedScroll == null) return;
    feed.scrollTop = state.feedScroll < 0 ? feed.scrollHeight : state.feedScroll;
    state.feedScroll = null;
  }

  // iOS Safari zooms the page on "gesturestart" regardless of touch-action;
  // block it at the document level while the full-screen chat is open.
  function setPinchGuard(on) {
    if (on === !!pinchGuard) return;
    if (on) {
      pinchGuard = function (event) {
        event.preventDefault();
      };
      document.addEventListener("gesturestart", pinchGuard, { passive: false });
    } else {
      document.removeEventListener("gesturestart", pinchGuard);
      pinchGuard = null;
    }
  }

  // Mobile Safari can keep scrolling the document behind a fixed overlay even
  // when overflow is hidden. Freezing the body at the current offset prevents
  // that scroll bleed; every inline value is restored exactly on close.
  function lockPageScroll() {
    if (pageScrollLock || !document.body || !isMobileViewport()) return;
    var doc = document.documentElement;
    var body = document.body;
    pageScrollLock = {
      x: window.scrollX || 0,
      y: window.scrollY || 0,
      docOverflow: doc.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
    };
    doc.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = -pageScrollLock.y + "px";
    body.style.left = -pageScrollLock.x + "px";
    body.style.right = "0";
    body.style.width = "100%";
  }

  function unlockPageScroll() {
    if (!pageScrollLock || !document.body) return;
    var saved = pageScrollLock;
    var doc = document.documentElement;
    var body = document.body;
    pageScrollLock = null;
    doc.style.overflow = saved.docOverflow;
    body.style.overflow = saved.bodyOverflow;
    body.style.position = saved.bodyPosition;
    body.style.top = saved.bodyTop;
    body.style.left = saved.bodyLeft;
    body.style.right = saved.bodyRight;
    body.style.width = saved.bodyWidth;
    window.scrollTo(saved.x, saved.y);
  }

  function focusWithoutScrolling(target) {
    if (!target) return;
    try {
      target.focus({ preventScroll: true });
    } catch (e) {
      target.focus();
    }
  }

  // The visual viewport is the usable screen above the software keyboard.
  // Keeping the full-screen panel bound to it prevents the composer from
  // slipping behind iOS/Android browser chrome or the on-screen keyboard.
  function syncMobilePresentation() {
    if (!el.panel) return;
    if (!isMobileViewport()) {
      el.panel.removeAttribute("aria-modal");
      [
        "--jc-viewport-top",
        "--jc-viewport-left",
        "--jc-viewport-width",
        "--jc-viewport-height",
      ].forEach(function (name) {
        el.panel.style.removeProperty(name);
      });
      el.backdrop.classList.remove("show");
      setPinchGuard(false);
      unlockPageScroll();
      return;
    }
    el.panel.setAttribute("aria-modal", "true");
    var pinned = feedPinnedToBottom();
    var viewport = window.visualViewport;
    el.panel.style.setProperty(
      "--jc-viewport-top",
      (viewport ? viewport.offsetTop : 0) + "px",
    );
    el.panel.style.setProperty(
      "--jc-viewport-left",
      (viewport ? viewport.offsetLeft : 0) + "px",
    );
    el.panel.style.setProperty(
      "--jc-viewport-width",
      Math.min(viewport ? viewport.width : window.innerWidth, window.innerWidth) +
        "px",
    );
    el.panel.style.setProperty(
      "--jc-viewport-height",
      (viewport ? viewport.height : window.innerHeight) + "px",
    );
    if (pinned) pinFeedToBottom();
    setPinchGuard(state.open);
    // Any layout-viewport area the visual viewport does not cover (keyboard,
    // pinch zoom, toolbar collapse) would show the host page while the panel
    // rect catches up — paint the backdrop over it instead.
    var uncovered = viewport
      ? Math.max(
          window.innerHeight - (viewport.offsetTop + viewport.height),
          window.innerWidth - (viewport.offsetLeft + viewport.width),
        )
      : 0;
    el.backdrop.classList.toggle("show", state.open && uncovered > 24);
    if (state.open) lockPageScroll();
  }

  // The software keyboard animates in and out asynchronously: visualViewport
  // events cover it on current browsers, but some in-app browsers report the
  // final size late (or once). A short frame loop after a composer focus or
  // blur re-syncs the panel until the viewport has settled.
  function settleMobileViewport() {
    if (!isMobileViewport() || !state.open) return;
    var remaining = 36;
    function tick() {
      syncMobilePresentation();
      if (state.open && --remaining > 0) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var ICON_CHAT =
    '<svg viewBox="0 0 24 24"><path d="M12 3C6.5 3 2 6.9 2 11.7c0 2.7 1.4 5.1 3.7 6.7-.1.6-.5 2.1-1.5 3.3 0 0 2.6-.4 4.5-1.6 1 .3 2.1.4 3.3.4 5.5 0 10-3.9 10-8.8S17.5 3 12 3z"/></svg>';
  var ICON_EXPORT = '<svg viewBox="0 0 24 24"><path d="M12 3v12m-4-4 4 4 4-4M5 16v4h14v-4"/></svg>';
  var ICON_PLUS = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';
  var ICON_CLOSE =
    '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  var ICON_HISTORY =
    '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>';
  var ICON_BACK =
    '<svg viewBox="0 0 24 24"><path d="m12 19-7-7 7-7M19 12H5"/></svg>';
  var ICON_ATTACH =
    '<svg viewBox="0 0 24 24"><path d="m21.4 11.6-8.5 8.5a6 6 0 0 1-8.5-8.5l8.5-8.5a4 4 0 0 1 5.7 5.7l-8.5 8.5a2 2 0 0 1-2.8-2.8l7.8-7.8"/></svg>';
  var ICON_SEND =
    '<svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>';

  function button(label, icon, cls) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = cls || "";
    b.setAttribute("aria-label", label);
    b.title = label;
    // A string is one of our own inline SVG constants; an element is a
    // customer-supplied icon, which is appended and never stringified into
    // innerHTML.
    if (typeof icon === "string") b.innerHTML = icon;
    else if (icon) b.appendChild(icon);
    return b;
  }

  /**
   * 'light' | 'dark' | 'auto'. 'auto' is resolved HERE, in the visitor's
   * browser, and never on the server: /config is cached per site key, so a
   * server-resolved scheme would hand one visitor's OS preference to the next.
   */
  function prefersDark() {
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  function darkMode(config) {
    var theme = (config && config.theme) || "light";
    if (theme === "dark") return true;
    if (theme === "auto") return prefersDark();
    return false;
  }

  /**
   * The launcher glyph. A customer icon is server-sanitized SVG (helpers/svg.ts)
   * and is rendered through <img src="data:…"> — an image context, where no
   * browser runs script or fetches external refs. Never inject it as markup.
   */
  function launcherIcon(config) {
    if (config && config.iconPng) {
      var png = document.createElement("img");
      png.src = config.iconPng; png.alt = ""; png.className = "custom-png";
      return png;
    }
    if (!config || !config.icon) return ICON_CHAT;
    try {
      var encoded = btoa(unescape(encodeURIComponent(config.icon)));
      var img = document.createElement("img");
      img.src = "data:image/svg+xml;base64," + encoded;
      img.alt = "";
      return img;
    } catch (e) {
      return ICON_CHAT;
    }
  }

  function build(config) {
    var wrap = document.createElement("div");
    wrap.className = "wrap";
    var style = document.createElement("style");
    style.textContent = css(config.color, darkMode(config));
    // 'auto' follows the visitor while the page is open — someone flipping
    // their OS to dark at dusk should not have to reload to stop being
    // flash-banged by a white panel.
    if ((config.theme || "light") === "auto" && window.matchMedia) {
      var query = window.matchMedia("(prefers-color-scheme: dark)");
      var onSchemeChange = function () {
        style.textContent = css(config.color, prefersDark());
      };
      if (query.addEventListener) query.addEventListener("change", onSchemeChange);
      else if (query.addListener) query.addListener(onSchemeChange);
    }
    var bubble = button(config.chatbotName || config.title, launcherIcon(config), "bubble");
    bubble.setAttribute("aria-haspopup", "dialog");
    bubble.setAttribute("aria-expanded", "false");
    var badge = document.createElement("span");
    badge.className = "badge";
    bubble.appendChild(badge);
    var panel = document.createElement("div");
    panel.className = "panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", config.chatbotName || config.title);
    panel.setAttribute("aria-hidden", "true");
    panel.inert = true;
    // Focus target when the composer must not steal focus on touch devices.
    panel.tabIndex = -1;
    var backdrop = document.createElement("div");
    backdrop.className = "jc-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    var back = button("Back to chat", ICON_BACK, "history-back");
    back.style.display = "none";
    var actions = document.createElement("div");
    actions.className = "chat-actions";
    actions.setAttribute("role", "group");
    actions.setAttribute("aria-label", "Chat actions");
    var exportChat = button("Export chat", ICON_EXPORT);
    var history = button("Chat history", ICON_HISTORY);
    var fresh = button("New chat", ICON_PLUS);
    var close = button("Close", ICON_CLOSE, "panel-close");
    actions.appendChild(exportChat);
    actions.appendChild(history);
    actions.appendChild(back);
    actions.appendChild(fresh);

    // No pre-chat form: a visitor types straight into the composer and the
    // session is minted on their first message (ensureSession).
    var err = document.createElement("p");
    err.className = "error";

    var feed = document.createElement("div");
    feed.className = "feed";
    var hist = document.createElement("div");
    hist.className = "hist";
    var compose = document.createElement("div");
    compose.className = "compose";
    var pending = document.createElement("div");
    pending.className = "pending";
    var row = document.createElement("div");
    row.className = "compose-row";
    var field = document.createElement("div");
    field.className = "compose-field";
    var picker = document.createElement("input");
    picker.type = "file";
    picker.multiple = true;
    picker.accept = "image/png,image/jpeg,image/gif,image/webp,application/pdf";
    picker.style.display = "none";
    var attach = button(
      "Attach image or PDF",
      ICON_ATTACH,
      "icon-button attach",
    );
    var input = document.createElement("textarea");
    input.rows = 1;
    input.placeholder = "Type a message…";
    var send = button("Send", ICON_SEND, "icon-button send");
    var sendWrap = document.createElement("div");
    sendWrap.className = "send-wrap";
    sendWrap.appendChild(send);
    row.appendChild(picker);
    field.appendChild(input);
    field.appendChild(attach);
    row.appendChild(field);
    row.appendChild(sendWrap);
    err.setAttribute("role", "alert");
    compose.appendChild(pending);
    compose.appendChild(row);
    var closedNote = document.createElement("div");
    closedNote.className = "closed-note";
    var closedText = document.createElement("p");
    closedText.textContent = "This chat has ended.";
    var closedNew = document.createElement("button");
    closedNew.type = "button";
    closedNew.className = "pill-btn";
    closedNew.textContent = "Start a new chat";
    closedNote.appendChild(closedText);
    closedNote.appendChild(closedNew);
    var panelBody = document.createElement("div");
    panelBody.className = "panel-body";
    var chatPage = document.createElement("div");
    chatPage.className = "chat-page";
    [feed, err, compose, closedNote].forEach(function (node) {
      chatPage.appendChild(node);
    });
    panelBody.appendChild(hist);
    panelBody.appendChild(chatPage);
    panel.appendChild(actions);
    panel.appendChild(close);
    panel.appendChild(panelBody);
    wrap.appendChild(backdrop);
    wrap.appendChild(panel);
    wrap.appendChild(bubble);
    root.appendChild(style);
    root.appendChild(wrap);
    el = {
      bubble: bubble,
      badge: badge,
      backdrop: backdrop,
      panel: panel,
      panelBody: panelBody,
      chatPage: chatPage,
      close: close,
      exportChat: exportChat,
      back: back,
      history: history,
      fresh: fresh,
      err: err,
      feed: feed,
      hist: hist,
      compose: compose,
      closedNote: closedNote,
      pending: pending,
      picker: picker,
      attach: attach,
      input: input,
      send: send,
      field: field,
      sendWrap: sendWrap,
    };
    [feed, hist].forEach(function (scroller) {
      var fadeTimer;
      scroller.classList.add("scroll-fade");
      scroller.addEventListener("scroll", function () {
        scroller.classList.add("scrolling");
        window.clearTimeout(fadeTimer);
        fadeTimer = window.setTimeout(function () {
          scroller.classList.remove("scrolling");
        }, 700);
      }, { passive: true });
    });
    syncMobilePresentation();
    window.addEventListener("resize", syncMobilePresentation);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", syncMobilePresentation);
      window.visualViewport.addEventListener("scroll", syncMobilePresentation);
    }
    renderFeed();
    setView("chat");
    bubble.addEventListener("click", toggle);
    close.addEventListener("click", toggle);
    exportChat.addEventListener("click", exportTranscript);
    back.addEventListener("click", leaveHistory);
    history.addEventListener("click", function () {
      if (state.view === "history") leaveHistory();
      else navigateView("history");
    });
    bindPageSwipes();
    fresh.addEventListener("click", newChat);
    closedNew.addEventListener("click", newChat);
    attach.addEventListener("click", function () {
      picker.click();
    });
    picker.addEventListener("change", selectFiles);
    send.addEventListener("click", sendMessage);
    input.addEventListener("input", resizeComposer);
    input.addEventListener("focus", settleMobileViewport);
    input.addEventListener("blur", settleMobileViewport);
    window.addEventListener("resize", resizeComposer);
    // Re-measure wrapping after the panel opens or its available width changes.
    var composerWidth = 0;
    new ResizeObserver(function (entries) {
      var width = entries[0].contentRect.width;
      if (width === composerWidth) return;
      composerWidth = width;
      resizeComposer();
    }).observe(input);
    input.addEventListener("keydown", function (e) {
      // Software keyboards have no Shift+Enter, so on touch the return key
      // makes a new line and only the Send button sends. isComposing keeps
      // IME confirmations (CJK input) from sending mid-composition.
      if (
        e.key === "Enter" &&
        !e.shiftKey &&
        !e.isComposing &&
        !isCoarsePointer()
      ) {
        e.preventDefault();
        sendMessage();
      }
    });
    panel.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        toggle();
        return;
      }
      if (e.key === "Tab" && state.open && isMobileViewport()) {
        var focusable = Array.prototype.slice
          .call(
            panel.querySelectorAll(
              'button:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])',
            ),
          )
          .filter(function (node) {
            return node.getClientRects().length > 0 && !node.closest("[inert]");
          });
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && e.target === first) {
          e.preventDefault();
          focusWithoutScrolling(last);
        } else if (!e.shiftKey && e.target === last) {
          e.preventDefault();
          focusWithoutScrolling(first);
        }
      }
    });
  }

  function showError(text) {
    el.err.textContent = text;
    el.err.style.display = text ? "block" : "none";
  }
  function updateExportButton() {
    el.exportChat.disabled = state.exporting || state.sending || !activeChat() || state.view !== "chat";
    el.exportChat.setAttribute("aria-busy", String(state.exporting));
    el.exportChat.title = state.exporting ? "Exporting chat…" : "Export chat";
  }
  function exportTranscript() {
    var chat = activeChat();
    if (!chat || state.exporting || state.sending || state.view !== "chat") return;
    state.exporting = true;
    updateExportButton();
    showError("");
    var timezone = "UTC";
    try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
    fetch(API + "/export", {
      method: "POST", credentials: "omit", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorToken: chat.token, timezone: timezone }),
    }).then(function (response) {
      if (!response.ok || (response.headers.get("Content-Type") || "").indexOf("application/pdf") < 0) throw new Error("export");
      return response.blob();
    }).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url; link.download = "chat-transcript.pdf";
      root.appendChild(link); link.click(); link.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
    }).catch(function () {
      if (chat.token === state.activeToken) showError("Could not export this chat. Please try again.");
    }).then(function () {
      state.exporting = false;
      updateExportButton();
    });
  }
  function setView(view, skipComposerMotion) {
    clearPageSlide();
    clearNewChatMotion();
    if (state.view === "chat" && view !== "chat") saveFeedScroll();
    var composerWasHidden = el.compose.style.display !== "block";
    state.view = view;
    updateExportButton();
    var chat = activeChat();
    var inChat = view === "chat";
    var closed = chat && chat.closed;
    el.chatPage.style.display = inChat ? "flex" : "none";
    el.hist.style.display = view === "history" ? "flex" : "none";
    el.feed.style.display = inChat ? "flex" : "none";
    if (inChat) applySavedFeedScroll();
    // No chat yet is a WRITABLE state — the composer mints the session.
    el.compose.style.display = inChat && !closed ? "block" : "none";
    el.closedNote.style.display = inChat && closed ? "flex" : "none";
    el.back.style.display = view === "history" ? "flex" : "none";
    el.history.style.display = view === "history" ? "none" : "flex";
    if (view === "history") renderHistory();
    if (!skipComposerMotion && state.open && inChat && !closed && composerWasHidden) animateComposer(false);
  }
  function leaveHistory() {
    navigateView("chat");
  }
  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function clearPageSlide() {
    swipe = null;
    if (!pageSlide) return;
    var slide = pageSlide;
    pageSlide = null;
    slide.motions.forEach(function (motion) {
      motion.onfinish = null;
      motion.cancel();
    });
    [slide.from, slide.to].forEach(function (page) {
      page.classList.remove("page-sliding");
      page.style.transform = "";
      page.style.filter = "";
      page.style.zIndex = "";
      page.inert = false;
      page.removeAttribute("aria-hidden");
    });
    if (slide.target === "new") slide.to.remove();
    el.chatPage.style.display = state.view === "chat" ? "flex" : "none";
    el.hist.style.display = state.view === "history" ? "flex" : "none";
  }
  function preparePageSlide(target) {
    clearPageSlide();
    clearNewChatMotion();
    clearComposerMotion();
    var from = state.view === "history" ? el.hist : el.chatPage;
    var to = target === "history" ? el.hist : el.chatPage;
    if (target === "history") renderHistory();
    else if (target === "new") {
      // A preview is only visual: holding/cancelling never changes the session.
      to = el.chatPage.cloneNode(true);
      to.classList.add("draft-preview");
      var previewFeed = to.querySelector(".feed");
      previewFeed.textContent = "";
      previewFeed.appendChild(el.feed.querySelector(".conversation-intro").cloneNode(true));
      var greeting = el.greeting.cloneNode(true);
      setBubbleTime(greeting, new Date().toISOString(), "Conversation started at ");
      previewFeed.appendChild(greeting);
      to.querySelector(".pending").textContent = "";
      to.querySelector(".error").style.display = "none";
      to.querySelector(".closed-note").style.display = "none";
      to.querySelector(".compose").style.display = "block";
      el.panelBody.appendChild(to);
    } else {
      var chat = activeChat();
      el.feed.style.display = "flex";
      el.compose.style.display = chat && chat.closed ? "none" : "block";
      el.closedNote.style.display = chat && chat.closed ? "flex" : "none";
      // The chat page is re-shown for the slide itself; settle the feed
      // before it is visible mid-animation.
      applySavedFeedScroll();
    }
    var slide = pageSlide = {
      target: target, from: from, to: to,
      direction: target === "history" ? -1 : 1,
      width: el.panelBody.clientWidth, progress: 0, motions: [],
    };
    [from, to].forEach(function (page) {
      page.style.display = "flex";
      page.classList.add("page-sliding");
      page.inert = true;
      page.setAttribute("aria-hidden", "true");
    });
    from.style.zIndex = "2";
    to.style.zIndex = "1";
    paintPageSlide(0);
    return slide;
  }
  function pageSlideFrame(slide, progress, incoming) {
    var distance = slide.direction * slide.width;
    return {
      transform: "translateX(" + (incoming ? -distance * (1 - progress) : distance * progress) + "px)",
      filter: incoming && !reducedMotion()
        ? "blur(" + (3 * (1 - progress)) + "px) brightness(" + (0.84 + 0.16 * progress) + ")"
        : "none",
    };
  }
  function paintPageSlide(progress) {
    var slide = pageSlide;
    if (!slide) return;
    slide.progress = progress;
    [slide.from, slide.to].forEach(function (page, index) {
      var frame = pageSlideFrame(slide, progress, index === 1);
      page.style.transform = frame.transform;
      page.style.filter = frame.filter;
    });
  }
  function settlePageSlide(commit) {
    var slide = pageSlide;
    if (!slide) return;
    function finish() {
      if (pageSlide !== slide) return;
      clearPageSlide();
      if (commit) {
        if (slide.target === "new") newChat(true);
        else setView(slide.target, true);
        focusCurrentPage();
      }
    }
    if (reducedMotion() || !slide.from.animate) { finish(); return; }
    var end = commit ? 1 : 0;
    var duration = Math.max(140, 340 * Math.abs(end - slide.progress));
    [slide.from, slide.to].forEach(function (page, index) {
      var motion = page.animate([
        pageSlideFrame(slide, slide.progress, index === 1),
        pageSlideFrame(slide, end, index === 1),
      ], { duration: duration, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" });
      slide.motions.push(motion);
      if (index === 1) motion.onfinish = finish;
    });
  }
  function navigateView(view) {
    if (pageSlide || view === state.view) return;
    if (!state.open || reducedMotion() || !el.hist.animate) {
      setView(view);
      focusCurrentPage();
      return;
    }
    preparePageSlide(view);
    settlePageSlide(true);
  }
  function focusCurrentPage() {
    if (!state.open) return;
    var chat = activeChat();
    if (state.view === "history") focusWithoutScrolling(el.back);
    else if (chat && chat.closed) focusWithoutScrolling(el.close);
    else focusForTyping();
  }
  function bindPageSwipes() {
    el.panelBody.addEventListener("pointerdown", function (event) {
      if (swipe && event.pointerId !== swipe.id) { clearPageSlide(); return; }
      if (event.pointerType !== "touch" || !event.isPrimary || !isMobileViewport() ||
        !state.open || pageSlide || newChatMotions.length || panelMotion ||
        !event.target.closest(".feed,.hist") ||
        event.target.closest("button,a,input,textarea,video,audio")) return;
      swipe = { id: event.pointerId, x: event.clientX, y: event.clientY,
        lastX: event.clientX, lastTime: event.timeStamp, velocity: 0, target: null };
    });
    el.panelBody.addEventListener("pointermove", function (event) {
      if (!swipe || event.pointerId !== swipe.id) return;
      var gesture = swipe;
      var dx = event.clientX - gesture.x;
      var dy = event.clientY - gesture.y;
      if (!gesture.target) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return;
        if (Math.abs(dy) > Math.abs(dx) * 0.8) { swipe = null; return; }
        var target = dx < 0 ? "history" : state.view === "history" ? "chat" : "new";
        if (target === state.view || (target === "new" &&
          (state.sending || state.uploading || state.sessionPromise))) { swipe = null; return; }
        preparePageSlide(target);
        swipe = gesture;
        gesture.target = target;
        el.panelBody.setPointerCapture(event.pointerId);
      }
      var elapsed = event.timeStamp - gesture.lastTime;
      gesture.velocity = elapsed > 0 ? (event.clientX - gesture.lastX) / elapsed : 0;
      gesture.lastX = event.clientX;
      gesture.lastTime = event.timeStamp;
      paintPageSlide(Math.max(0, Math.min(1, dx * pageSlide.direction / pageSlide.width)));
      event.preventDefault();
    }, { passive: false });
    function release(event) {
      if (!swipe || event.pointerId !== swipe.id) return;
      var gesture = swipe;
      swipe = null;
      if (!gesture.target || !pageSlide) return;
      suppressSwipeClickUntil = Date.now() + 400;
      var recentFlick = event.timeStamp - gesture.lastTime < 80 &&
        gesture.velocity * pageSlide.direction > 0.5 && pageSlide.progress * pageSlide.width > 48;
      var commit = event.type === "pointerup" && (pageSlide.progress >= 0.3 || recentFlick);
      if (el.panelBody.hasPointerCapture(event.pointerId)) el.panelBody.releasePointerCapture(event.pointerId);
      settlePageSlide(commit);
    }
    el.panelBody.addEventListener("pointerup", release);
    el.panelBody.addEventListener("pointercancel", release);
    el.panelBody.addEventListener("lostpointercapture", function (event) {
      // Taking capture from the touched bubble also emits a bubbling loss event.
      // Only losing the container's own capture cancels our gesture.
      if (event.target === el.panelBody) release(event);
    });
    el.panelBody.addEventListener("click", function (event) {
      if (Date.now() >= suppressSwipeClickUntil) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    window.addEventListener("resize", clearPageSlide);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", clearPageSlide);
    document.addEventListener("visibilitychange", function () { if (document.hidden) clearPageSlide(); });
  }
  function clearComposerMotion() {
    composerMotions.forEach(function (motion) {
      if (motion) motion.cancel();
    });
    composerMotions = [];
  }
  function animateComposer(resuming) {
    if (
      !el.field.animate ||
      (window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      clearComposerMotion();
      return;
    }
    if (el.compose.style.display !== "block") return;
    [el.field, el.sendWrap].forEach(function (element, index) {
      var previous = composerMotions[index];
      var first = {
        opacity: 0,
        transform: index ? "translateX(52px) rotate(120deg)" : "translateY(18px)",
      };
      if (resuming || previous) {
        var current = window.getComputedStyle(element);
        first = { opacity: current.opacity, transform: current.transform };
      }
      if (previous) previous.cancel();
      // Animate a wrapper so Send's press response never competes with its roll.
      var motion = element.animate([first, { opacity: 1, transform: "none" }], {
        duration: index ? 420 : 380,
        delay: resuming || previous ? 0 : index ? 130 : 80,
        easing: "cubic-bezier(.22,1,.36,1)",
        fill: "both",
      });
      composerMotions[index] = motion;
      motion.onfinish = function () {
        if (composerMotions[index] !== motion) return;
        composerMotions[index] = null;
        motion.cancel();
      };
    });
  }
  function animatePanel(open) {
    // Preserve the rendered frame when reversing an unfinished transition.
    // Measuring after cancel() would jump back to the fully expanded panel.
    var current = null;
    if (panelMotion) {
      var currentStyle = window.getComputedStyle(el.panel);
      current = {
        transform: currentStyle.transform,
        opacity: currentStyle.opacity,
        borderRadius: currentStyle.borderRadius,
      };
      panelMotion.cancel();
      panelMotion = null;
    }
    el.panel.className = open ? "panel open" : "panel closing";
    if (
      !el.panel.animate ||
      (window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      el.panel.className = open ? "panel open" : "panel";
      if (!open) clearComposerMotion();
      return;
    }
    // The base layout is untransformed here. Use the launcher's centre plus
    // its layout size, since its own fade/scale may still be in progress.
    var panelBox = el.panel.getBoundingClientRect();
    var launcherBox = el.bubble.getBoundingClientRect();
    var width = el.bubble.offsetWidth;
    var height = el.bubble.offsetHeight;
    var x = launcherBox.left + launcherBox.width / 2 - width / 2 - panelBox.left;
    var y = launcherBox.top + launcherBox.height / 2 - height / 2 - panelBox.top;
    var collapsed = {
      transform:
        "translate(" + x + "px," + y + "px) scale(" +
        width / panelBox.width + "," + height / panelBox.height + ")",
      opacity: 0,
      borderRadius: "50%",
    };
    var expanded = {
      transform: "none",
      opacity: 1,
      borderRadius: window.getComputedStyle(el.panel).borderRadius,
    };
    var motion = el.panel.animate(
      [current || (open ? collapsed : expanded), open ? expanded : collapsed],
      {
        duration: open ? 380 : 280,
        easing: open ? "cubic-bezier(.22,1,.36,1)" : "cubic-bezier(.4,0,.2,1)",
        fill: "both",
      },
    );
    panelMotion = motion;
    motion.onfinish = function () {
      if (panelMotion !== motion) return;
      el.panel.className = state.open ? "panel open" : "panel";
      if (!state.open) clearComposerMotion();
      panelMotion = null;
      motion.cancel();
    };
  }
  function toggle() {
    clearPageSlide();
    clearNewChatMotion();
    var resuming = !!panelMotion;
    state.open = !state.open;
    if (state.open) syncMobilePresentation();
    el.panel.inert = !state.open;
    el.panel.setAttribute("aria-hidden", String(!state.open));
    animatePanel(state.open);
    el.bubble.classList.toggle("hidden", state.open);
    el.bubble.setAttribute("aria-hidden", String(state.open));
    el.bubble.setAttribute("aria-expanded", String(state.open));
    el.bubble.tabIndex = state.open ? -1 : 0;
    if (state.open) {
      if (!activeChat() && !state.draftStartedAt) {
        state.draftStartedAt = new Date().toISOString();
        renderGreetingTime();
      }
      animateComposer(resuming);
      state.unread = 0;
      renderBadge();
      poll();
      schedulePoll();
      var chat = activeChat();
      if (state.view === "history") focusWithoutScrolling(el.back);
      else if (chat && chat.closed) focusWithoutScrolling(el.close);
      else focusForTyping();
      // The closing panel goes display:none after the animation; carry the
      // feed position across that hide so reopening lands where the visitor
      // left off, not on the greeting.
      applySavedFeedScroll();
    } else {
      saveFeedScroll();
      setPinchGuard(false);
      el.backdrop.classList.remove("show");
      unlockPageScroll();
      schedulePoll();
      focusWithoutScrolling(el.bubble);
    }
  }
  function renderBadge() {
    el.badge.style.display = state.unread > 0 ? "flex" : "none";
    el.badge.textContent = state.unread > 9 ? "9+" : String(state.unread);
  }
  function renderPending() {
    el.pending.textContent = "";
    state.attachments.forEach(function (attachment, index) {
      var item = document.createElement("div");
      item.className = "pending-item";
      var label = document.createElement("span");
      label.textContent = attachment.fileName;
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "close-button";
      remove.innerHTML = ICON_CLOSE;
      remove.setAttribute("aria-label", "Remove " + attachment.fileName);
      remove.addEventListener("click", function () {
        state.attachments.splice(index, 1);
        renderPending();
      });
      item.appendChild(label);
      item.appendChild(remove);
      el.pending.appendChild(item);
    });
  }
  function renderAttachments(container, attachments) {
    (attachments || []).forEach(function (attachment) {
      // Public API paths belong to CRM, even when this widget is embedded on
      // another website or restores a relative URL from local chat history.
      var downloadUrl;
      try {
        downloadUrl = new URL(attachment.downloadUrl, BASE + "/");
        if (downloadUrl.protocol !== "https:" && downloadUrl.protocol !== "http:") return;
      } catch (_) {
        return;
      }
      var link = document.createElement("a");
      link.href = downloadUrl.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      if (attachment.contentType.indexOf("image/") === 0) {
        var image = document.createElement("img");
        image.src = downloadUrl.href;
        image.alt = attachment.fileName;
        link.appendChild(image);
      } else {
        link.className = "file";
        link.textContent = attachment.fileName;
      }
      container.appendChild(link);
    });
  }
  function appendBubble(text, out, id, pending, attachments, at, animate) {
    var div = document.createElement("div");
    div.className = "msg " + (out ? "out" : "in") + (pending ? " pending" : "");
    var content = document.createElement("span");
    content.className = "msg-text";
    content.textContent = text || "";
    div.appendChild(content);
    renderAttachments(div, attachments);
    setBubbleTime(div, at);
    if (!out) {
      // The sender block (avatar + name) belongs to the FIRST bubble of a
      // run; follow-ups arrive bare and tight below it. The typing dots are
      // never a predecessor: the reply that replaces them re-introduces the
      // sender.
      var previous = el.feed.lastElementChild;
      if (
        previous &&
        previous.classList.contains("in") &&
        !previous.classList.contains("typing")
      ) {
        div.classList.add("continued");
      } else {
        var name = document.createElement("span");
        name.className = "chatbot-name";
        name.textContent = state.config.chatbotName || state.config.title;
        name.title = name.textContent;
        var avatar = document.createElement("span");
        avatar.className = "chatbot-avatar";
        avatar.setAttribute("aria-hidden", "true");
        if (state.config.avatar) {
          var picture = document.createElement("img");
          picture.src = state.config.avatar; picture.alt = "";
          avatar.appendChild(picture);
        } else avatar.textContent = Array.from(name.textContent || "C")[0].toUpperCase();
        div.appendChild(name);
        div.appendChild(avatar);
      }
    }
    if (id != null) div.setAttribute("data-id", String(id));
    el.feed.appendChild(div);
    if (animate) animateMessage(div, out);
    el.feed.scrollTop = el.feed.scrollHeight;
    return div;
  }
  function animateMessage(bubble, out) {
    // Only newly sent/received messages enter; rebuilding history is immediate.
    if (
      !state.open || state.view !== "chat" || document.hidden || !bubble.animate ||
      (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) return;
    var motion = bubble.animate(
      [
        { opacity: 0, transform: "translate(" + (out ? 6 : -6) + "px,14px) scale(.98)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 300, easing: "cubic-bezier(.22,1,.36,1)" },
    );
    motion.onfinish = function () { motion.cancel(); };
  }
  function setBubbleTime(bubble, value, description) {
    var date = value ? new Date(value) : null;
    var time = bubble.querySelector(".msg-time");
    if (!date || isNaN(date.getTime())) {
      if (time) time.remove();
      return;
    }
    if (!time) {
      time = document.createElement("time");
      time.className = "msg-time";
      bubble.appendChild(time);
    }
    var hours = date.getHours();
    var label = (hours % 12 || 12) + ":" + ("0" + date.getMinutes()).slice(-2) + (hours < 12 ? " AM" : " PM");
    time.dateTime = date.toISOString();
    time.textContent = label;
    time.setAttribute("aria-label", (description || "Message time ") + label);
    time.title = date.toLocaleString();
  }
  function renderGreetingTime() {
    if (!el.greeting) return;
    var chat = activeChat();
    setBubbleTime(el.greeting, chat ? chat.startedAt || chat.createdAt : state.draftStartedAt, "Conversation started at ");
  }
  function renderFeed() {
    clearNewChatMotion();
    el.feed.textContent = "";
    // Rebuilt content: the next time the feed is shown it settles on the
    // newest message rather than a stale saved position.
    state.feedScroll = -1;
    if (!state.config) return;
    var intro = document.createElement("div");
    intro.className = "conversation-intro";
    var attribution = document.createElement("a");
    attribution.textContent = "Powered by JOHN CRM";
    attribution.href = "https://www.johncrm.com/";
    attribution.target = "_blank";
    attribution.rel = "noopener noreferrer";
    intro.appendChild(attribution);
    el.feed.appendChild(intro);
    el.greeting = appendBubble(state.config.greeting, false, null, false, []);
    renderGreetingTime();
    var chat = activeChat();
    if (!chat) return;
    (chat.messages || []).forEach(function (message) {
      appendBubble(
        message.text,
        message.out,
        message.id,
        false,
        message.attachments || [],
        message.at,
      );
    });
    renderTyping();
  }
  // The "…" typing bubble: someone (human agent or AI) is mid-response.
  // Always (re-)appended LAST so a message arriving in the same poll never
  // lands below the dots.
  function renderTyping() {
    var node = el.feed.querySelector(".msg.typing");
    if (!state.typing) {
      if (node) node.remove();
      return;
    }
    if (!node) {
      node = document.createElement("div");
      node.className = "msg in typing";
      var ahead = el.feed.lastElementChild;
      if (
        ahead &&
        ahead.classList.contains("in") &&
        !ahead.classList.contains("typing")
      )
        node.classList.add("continued");
      node.setAttribute("role", "status");
      node.setAttribute("aria-label", "Typing");
      for (var i = 0; i < 3; i++) {
        var dot = document.createElement("span");
        dot.className = "dot";
        node.appendChild(dot);
      }
    }
    // Only (re-)append when out of place — an unconditional append every poll
    // would yank the scroll position away from a visitor reading history.
    if (node !== el.feed.lastElementChild) {
      el.feed.appendChild(node);
      el.feed.scrollTop = el.feed.scrollHeight;
    }
  }
  function setTyping(on) {
    on = !!on;
    if (state.typing === on) {
      // Same state, but new messages may have appended below the bubble —
      // re-seat it at the bottom.
      if (on) renderTyping();
      return;
    }
    state.typing = on;
    renderTyping();
    // Poll faster while a response is being composed so it lands promptly.
    schedulePoll();
  }
  function chatPreview(chat) {
    var messages = chat.messages || [];
    for (var i = messages.length - 1; i >= 0; i--) {
      if (messages[i].text) return messages[i].text;
      var attachments = messages[i].attachments || [];
      if (attachments.length) return attachments[0].fileName;
    }
    return "New conversation";
  }
  function formatWhen(iso) {
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      var now = new Date();
      if (d.toDateString() === now.toDateString())
        return d.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "";
    }
  }
  function renderHistory() {
    el.hist.textContent = "";
    sortChats();
    if (!state.chats.length) {
      var empty = document.createElement("div");
      empty.className = "hist-empty";
      var note = document.createElement("p");
      note.textContent = "No conversations yet.";
      var startNew = document.createElement("button");
      startNew.type = "button";
      startNew.className = "pill-btn";
      startNew.textContent = "Start a new chat";
      startNew.addEventListener("click", newChat);
      empty.appendChild(note);
      empty.appendChild(startNew);
      el.hist.appendChild(empty);
      return;
    }
    state.chats.forEach(function (chat) {
      var item = document.createElement("div");
      item.className =
        "hist-item" + (chat.token === state.activeToken ? " active" : "");
      item.setAttribute("role", "button");
      item.tabIndex = 0;
      var main = document.createElement("div");
      main.className = "hist-main";
      var preview = document.createElement("p");
      preview.className = "hist-prev";
      preview.textContent = chatPreview(chat);
      var meta = document.createElement("p");
      meta.className = "hist-meta";
      var when = document.createElement("span");
      when.textContent = formatWhen(chat.updatedAt || chat.createdAt);
      meta.appendChild(when);
      if (chat.closed) {
        var tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = "Ended";
        meta.appendChild(tag);
      }
      main.appendChild(preview);
      main.appendChild(meta);
      var del = document.createElement("button");
      del.type = "button";
      del.className = "hist-del close-button";
      del.innerHTML = ICON_CLOSE;
      del.setAttribute("aria-label", "Delete conversation");
      del.title = "Delete conversation";
      del.addEventListener("click", function (event) {
        event.stopPropagation();
        deleteChat(chat.token);
      });
      item.appendChild(main);
      item.appendChild(del);
      item.addEventListener("click", function () {
        openChat(chat.token);
      });
      item.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openChat(chat.token);
        }
      });
      el.hist.appendChild(item);
    });
  }
  function openChat(token) {
    state.activeToken = token;
    state.attachments = [];
    // Typing state belongs to the previous chat until the next poll answers.
    state.typing = false;
    renderPending();
    renderFeed();
    navigateView("chat");
    var chat = activeChat();
    if (chat && !chat.closed) {
      poll();
      schedulePoll();
      if (!pageSlide) focusForTyping();
    }
  }
  function deleteChat(token) {
    var chat = null;
    for (var i = 0; i < state.chats.length; i++)
      if (state.chats[i].token === token) chat = state.chats[i];
    if (!chat) return;
    // Ending the CRM-side session is best effort: the local copy goes away
    // regardless, so the visitor is never stuck with an undeletable chat.
    if (!chat.closed)
      postJSON(API + "/close", { visitorToken: token }).catch(function () {});
    state.chats = state.chats.filter(function (entry) {
      return entry.token !== token;
    });
    delete state.seen[token];
    if (state.activeToken === token) {
      state.activeToken = state.chats.length ? state.chats[0].token : null;
      if (!state.activeToken) state.draftStartedAt = new Date().toISOString();
      renderFeed();
    }
    saveStore();
    renderHistory();
  }
  function markClosed(chat) {
    if (!chat || chat.closed) return;
    chat.closed = true;
    if (chat.token === state.activeToken) setTyping(false);
    saveStore();
    if (chat.token === state.activeToken && state.view === "chat")
      setView("chat");
    else if (state.view === "history") renderHistory();
  }
  function openSession() {
    return postJSON(API + "/session", { siteKey: SITE_KEY }).then(function (
      data,
    ) {
      var iso = new Date().toISOString();
      var chat = {
        token: data.visitorToken,
        // Anonymous by default — the server labels the lead and an agent
        // renames it once the visitor identifies themself in the chat.
        name: "",
        email: null,
        createdAt: iso,
        // Preserve when the visitor first saw this conversation's greeting.
        startedAt: state.draftStartedAt || iso,
        updatedAt: iso,
        closed: false,
        lastId: 0,
        messages: [],
      };
      state.chats.unshift(chat);
      if (state.chats.length > MAX_CHATS)
        state.chats.splice(MAX_CHATS, state.chats.length - MAX_CHATS);
      state.seen[chat.token] = {};
      state.activeToken = chat.token;
      updateExportButton();
      saveStore();
      schedulePoll();
      return chat;
    });
  }
  // The session (and its CRM lead client) is minted LAZILY, on the visitor's
  // first message or attachment — opening the panel alone must never create a
  // lead. Concurrent callers share one in-flight mint.
  function ensureSession() {
    var chat = activeChat();
    if (chat && !chat.closed) return Promise.resolve(chat);
    if (state.sessionPromise) return state.sessionPromise;
    state.sessionPromise = openSession().then(
      function (created) {
        state.sessionPromise = null;
        return created;
      },
      function (e) {
        state.sessionPromise = null;
        throw e;
      },
    );
    return state.sessionPromise;
  }
  function sessionError(e) {
    showError(
      e && e.status === 429
        ? "Too many attempts — please wait a moment"
        : "Could not start the chat — please try again",
    );
  }
  function clearNewChatMotion() {
    newChatMotions.forEach(function (motion) {
      motion.onfinish = null;
      motion.cancel();
    });
    newChatMotions = [];
    if (outgoingFeed) outgoingFeed.remove();
    outgoingFeed = null;
  }
  function animateNewChat(previousFeed, scrollTop) {
    // A non-interactive snapshot lets the real draft become writable at once.
    // Its own viewport clips the swipe and preserves a long chat's scroll position.
    if (previousFeed) {
      outgoingFeed = previousFeed;
      el.feed.parentNode.appendChild(previousFeed);
      previousFeed.scrollTop = scrollTop;
      var distance = el.feed.clientWidth;
      var bubbles = previousFeed.querySelectorAll(".msg");
      Array.prototype.forEach.call(bubbles, function (bubble, index) {
        var exit = bubble.animate(
          [
            { opacity: 1, transform: "translateX(0)" },
            { opacity: 0, transform: "translateX(" + distance + "px)" },
          ],
          { duration: 280, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" },
        );
        newChatMotions.push(exit);
        if (index === bubbles.length - 1) exit.onfinish = function () {
          previousFeed.remove();
          if (outgoingFeed === previousFeed) outgoingFeed = null;
        };
      });
    }
    var entrance = el.greeting.animate(
      [
        { opacity: 0, transform: "translateX(-28px) scale(.98)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 360, delay: previousFeed ? 200 : 0, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" },
    );
    newChatMotions.push(entrance);
    entrance.onfinish = clearNewChatMotion;
  }
  function newChat(skipAnimation) {
    clearPageSlide();
    if (newChatMotions.length || state.sending || state.uploading || state.sessionPromise) return;
    // Earlier chats stay in local history (and stay open server-side) so the
    // visitor can move back to them; deleting one is what closes it. A new
    // chat is purely local until its first message.
    var current = activeChat();
    if (
      current &&
      !current.closed &&
      !(current.messages || []).length &&
      state.view === "chat"
    ) {
      focusForTyping();
      return;
    }
    var animate = skipAnimation !== true && state.open && !document.hidden && el.feed.animate &&
      !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var previousFeed = null;
    var scrollTop = el.feed.scrollTop;
    if (animate && state.view === "chat") {
      previousFeed = el.feed.cloneNode(true);
      previousFeed.classList.add("feed-leaving");
      previousFeed.style.height = el.feed.offsetHeight + "px";
      // Retain the native scrollbar's space so wrapped text does not jump.
      previousFeed.style.paddingRight = (parseFloat(window.getComputedStyle(el.feed).paddingRight) +
        el.feed.offsetWidth - el.feed.clientWidth) + "px";
      previousFeed.setAttribute("aria-hidden", "true");
      previousFeed.inert = true;
    }
    state.activeToken = null;
    state.draftStartedAt = new Date().toISOString();
    state.attachments = [];
    state.typing = false;
    el.input.value = "";
    resizeComposer();
    showError("");
    renderPending();
    renderFeed();
    setView("chat");
    if (animate) animateNewChat(previousFeed, scrollTop);
    focusForTyping();
  }
  function selectFiles(event) {
    var files = Array.prototype.slice.call(event.target.files || []);
    event.target.value = "";
    files.reduce(function (chain, file) {
      return chain.then(function () {
        return uploadFile(file);
      });
    }, Promise.resolve());
  }
  function uploadFile(file) {
    var current = activeChat();
    if (current && current.closed) return Promise.resolve();
    if (file.size > 15 * 1024 * 1024) {
      appendBubble(
        "Attachments must be 15 MB or smaller.",
        false,
        null,
        false,
        [],
      );
      return Promise.resolve();
    }
    state.uploading = true;
    el.attach.disabled = true;
    var chat;
    return ensureSession()
      .then(function (session) {
        chat = session;
        var form = new FormData();
        form.append("visitorToken", chat.token);
        form.append("file", file, file.name);
        return fetch(API + "/attachment", { method: "POST", body: form });
      })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) throw new Error(data.error || "Upload failed");
          return data;
        });
      })
      .then(function (attachment) {
        attachment.downloadUrl =
          API +
          "/attachment/" +
          attachment.artifactId +
          "?visitorToken=" +
          encodeURIComponent(chat.token);
        state.attachments.push(attachment);
        renderPending();
      })
      .catch(function (error) {
        appendBubble(error.message || "Upload failed", false, null, false, []);
      })
      .then(function () {
        state.uploading = false;
        el.attach.disabled = false;
      });
  }
  function resizeComposer() {
    var input = el.input;
    if (!input || !input.clientWidth) return;
    var pinned = feedPinnedToBottom();
    var style = window.getComputedStyle(input);
    var padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    var borders = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    var maxHeight = Math.ceil(parseFloat(style.lineHeight) * 8 + padding + borders);
    // Reset before measuring so deleting text also shrinks the field.
    input.style.height = "44px";
    input.style.overflowY = "hidden";
    var contentHeight = input.scrollHeight + borders;
    input.style.height = Math.min(maxHeight, Math.max(44, contentHeight)) + "px";
    input.style.overflowY = contentHeight > maxHeight ? "auto" : "hidden";
    if (pinned) pinFeedToBottom();
  }

  function sendMessage() {
    var text = el.input.value.trim();
    var current = activeChat();
    if (
      (!text && !state.attachments.length) ||
      (current && current.closed) ||
      state.sending ||
      state.uploading
    )
      return;
    state.sending = true;
    updateExportButton();
    el.send.disabled = true;
    el.input.value = "";
    resizeComposer();
    showError("");
    var attachments = state.attachments.slice();
    state.attachments = [];
    renderPending();
    var sentAt = new Date().toISOString();
    var bubble = appendBubble(text, true, null, true, attachments, sentAt, true);
    var chat;
    ensureSession()
      .then(function (session) {
        chat = session;
        return postJSON(API + "/message", {
          visitorToken: chat.token,
          text: text,
          attachmentIds: attachments.map(function (a) {
            return a.artifactId;
          }),
        });
      })
      .then(function (data) {
        bubble.className = "msg out";
        bubble.setAttribute("data-id", String(data.messageId));
        state.seen[chat.token][data.messageId] = true;
        if (data.messageId > chat.lastId) chat.lastId = data.messageId;
        recordMessage(chat, {
          id: data.messageId,
          text: text,
          out: true,
          at: sentAt,
          attachments: attachments,
        });
      })
      .catch(function (e) {
        bubble.querySelector(".msg-text").textContent = (text || "Attachment") + " \u26a0";
        if (!chat) sessionError(e);
        else if (e.status === 401) markClosed(chat);
      })
      .then(function () {
        state.sending = false;
        el.send.disabled = false;
        updateExportButton();
        // The visitor just sent from the composer: keep (or restore) it
        // focused so the keyboard stays up for the follow-up.
        if (!(chat && chat.closed)) focusWithoutScrolling(el.input);
      });
  }
  function poll() {
    var chat = activeChat();
    if (!chat || chat.closed) return;
    getJSON(
      API +
        "/messages?visitorToken=" +
        encodeURIComponent(chat.token) +
        "&after=" +
        chat.lastId,
    )
      .then(function (data) {
        var seen = state.seen[chat.token] || (state.seen[chat.token] = {});
        // While a send is in flight its row can reach this poll before the
        // POST response names it. Leave it, and everything after it, for the
        // next poll so the optimistic bubble is never doubled.
        var held = false;
        (data.messages || []).forEach(function (message) {
          if (held || (state.sending && !message.sent && !seen[message.id])) {
            held = true;
            return;
          }
          if (message.id > chat.lastId) chat.lastId = message.id;
          if (seen[message.id]) return;
          seen[message.id] = true;
          var at = message.timestamp || new Date().toISOString();
          recordMessage(chat, {
            id: message.id,
            text: message.text,
            out: !message.sent,
            at: at,
            attachments: message.attachments || [],
          });
          if (chat.token === state.activeToken)
            appendBubble(
              message.text,
              !message.sent,
              message.id,
              false,
              message.attachments || [],
              at,
              true,
            );
          if (message.sent && !state.open) {
            state.unread += 1;
            renderBadge();
          }
        });
        if ((data.messages || []).length) saveStore();
        if (chat.token === state.activeToken) setTyping(!!data.typing);
      })
      .catch(function (e) {
        if (e.status === 401) markClosed(chat);
      });
  }
  function schedulePoll() {
    if (state.pollTimer) clearInterval(state.pollTimer);
    state.pollTimer = setInterval(
      poll,
      // 1.2s while someone is composing keeps the reply's arrival snappy and
      // stays under the poll rate limit (60/min); 2.5s otherwise, 10s closed.
      state.open ? (state.typing ? 1200 : 2500) : 10000,
    );
  }
  loadStore();
  getJSON(API + "/config?siteKey=" + encodeURIComponent(SITE_KEY))
    .then(function (config) {
      state.config = config;
      document.body.appendChild(host);
      build(config);
      var chat = activeChat();
      if (chat && !chat.closed) {
        poll();
        schedulePoll();
      }
    })
    .catch(function (e) {
      console.error("[johncrm-chat] widget disabled:", e && e.message);
    });
})();
