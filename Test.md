Absolutely—let’s give you a tiny Chrome extension with a proper Start / Pause / Resume / Stop and a Set time control. It shows a clear countdown badge on the page and persists across reloads (per tab).

You’ll create 4 small files in a folder, then load it once.


---

1) Files to create

Create a folder, e.g. AutoRefreshPro/, and add these files:

manifest.json

{
  "manifest_version": 3,
  "name": "Auto Refresh Pro (HUD)",
  "version": "1.1",
  "description": "Auto-refresh with on-page HUD: set time, start, pause/resume, stop. Persists per tab.",
  "permissions": ["activeTab", "storage"],
  "action": { "default_popup": "popup.html", "default_title": "Auto Refresh Pro" },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ]
}

popup.html

<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font: 14px system-ui, sans-serif; margin: 12px; min-width: 240px; }
      .row { display:flex; gap:8px; align-items:center; margin:8px 0; }
      input[type=number]{ width: 80px; padding:4px; }
      button { padding:6px 10px; border-radius:8px; border:1px solid #ccc; background:#f6f6f6; cursor:pointer; }
      button.primary { background:#0b57d0; color:#fff; border-color:#0b57d0; }
      .muted{opacity:.75}
    </style>
  </head>
  <body>
    <div class="row">
      <label for="minutes">Minutes:</label>
      <input id="minutes" type="number" min="0.05" step="0.05" value="2">
      <button id="set">Set</button>
    </div>
    <div class="row">
      <button id="start" class="primary">Start</button>
      <button id="pause">Pause</button>
      <button id="resume">Resume</button>
      <button id="stop">Stop</button>
    </div>
    <div id="status" class="muted">Status: —</div>
    <script src="popup.js"></script>
  </body>
</html>

popup.js

async function send(cmd, data={}) {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  if (!tab?.id) return;
  return chrome.tabs.sendMessage(tab.id, {cmd, ...data});
}

const minutesEl = document.getElementById('minutes');
const statusEl  = document.getElementById('status');

document.getElementById('set').onclick    = async ()=> { await send('setMinutes', {minutes: parseFloat(minutesEl.value)}); refresh(); };
document.getElementById('start').onclick  = async ()=> { await send('start',      {minutes: parseFloat(minutesEl.value)}); refresh(); };
document.getElementById('pause').onclick  = async ()=> { await send('pause');  refresh(); };
document.getElementById('resume').onclick = async ()=> { await send('resume'); refresh(); };
document.getElementById('stop').onclick   = async ()=> { await send('stop');   refresh(); };

async function refresh(){
  const s = await send('status');
  if (s) {
    minutesEl.value = s.minutes ?? minutesEl.value;
    statusEl.textContent = `Status: ${s.state}${s.countdown ? ` • ${s.countdown}s left` : ''}`;
  }
}
refresh();

content.js

(() => {
  const HUD_ID = "_arHUD";
  const STATE = {
    // Per-tab session (survives reloads)
    get enabled() { return sessionStorage.getItem("_ar_enabled")==="1"; },
    set enabled(v){ v ? sessionStorage.setItem("_ar_enabled","1")
                      : sessionStorage.removeItem("_ar_enabled"); },

    get paused()  { return sessionStorage.getItem("_ar_paused")==="1"; },
    set paused(v) { v ? sessionStorage.setItem("_ar_paused","1")
                      : sessionStorage.removeItem("_ar_paused"); },

    get minutes() { return parseFloat(sessionStorage.getItem("_ar_minutes") || "2"); },
    set minutes(m){ sessionStorage.setItem("_ar_minutes", String(m)); },

    get nextAt()  { return parseInt(sessionStorage.getItem("_ar_nextAt") || "0", 10); },
    set nextAt(t) { sessionStorage.setItem("_ar_nextAt", String(t)); }
  };

  let raf=0, reloadTO=0;
  let hud=null, label=null, btnPause=null, btnStop=null;

  function ensureHUD(){
    if (document.getElementById(HUD_ID)) return document.getElementById(HUD_ID);
    const box = document.createElement('div');
    box.id = HUD_ID;
    box.style.cssText = [
      "position:fixed","bottom:20px","right:20px","z-index:2147483647",
      "padding:10px 12px","background:rgba(0,0,0,.85)","color:#fff",
      "font:14px/1.2 system-ui","border-radius:12px","border:1px solid #fff",
      "box-shadow:0 6px 18px rgba(0,0,0,.6)","min-width:200px","user-select:none"
    ].join(";");

    const top = document.createElement('div');
    label = document.createElement('div');
    label.style.cssText = "font-weight:700;margin-bottom:6px;text-align:center";
    top.appendChild(label);

    const ctrls = document.createElement('div');
    ctrls.style.cssText = "display:flex;gap:6px;justify-content:center";
    btnPause = Object.assign(document.createElement('button'), {textContent:"Pause"});
    btnStop  = Object.assign(document.createElement('button'), {textContent:"Stop"});
    for (const b of [btnPause, btnStop]) {
      b.style.cssText = "padding:4px 8px;border-radius:8px;border:1px solid #ccc;background:#f5f5f5;cursor:pointer";
    }
    ctrls.append(btnPause, btnStop);

    const hint = document.createElement('div');
    hint.style.cssText = "margin-top:6px;opacity:.75;text-align:center";
    hint.textContent = "Drag to move";

    box.append(top, ctrls, hint);
    document.body.appendChild(box);

    // drag
    let dragging=false, ox=0, oy=0;
    box.addEventListener("pointerdown", e => { dragging=true; ox=e.clientX-box.offsetLeft; oy=e.clientY-box.offsetTop; box.setPointerCapture(e.pointerId); });
    box.addEventListener("pointermove", e => { if(!dragging) return; box.style.left=(e.clientX-ox)+"px"; box.style.top=(e.clientY-oy)+"px"; box.style.right="auto"; box.style.bottom="auto"; });
    box.addEventListener("pointerup", ()=> dragging=false);

    // buttons
    btnPause.onclick = () => STATE.paused ? resume() : pause();
    btnStop.onclick  = () => stop(true);

    return box;
  }

  function schedule() {
    cancel(); // clear previous timers
    if (!STATE.enabled || STATE.paused) return;
    const ms = Math.max(50, STATE.minutes * 60_000);
    const now = Date.now();
    if (!STATE.nextAt || STATE.nextAt < now) STATE.nextAt = now + ms;

    reloadTO = setTimeout(()=> location.reload(), STATE.nextAt - now);

    const tick = () => {
      if (!STATE.enabled) return cancel();
      const left = Math.max(0, STATE.nextAt - Date.now());
      if (hud) label.textContent = (STATE.paused ? "⏸ Paused"
        : `⟳ Refresh in ${Math.ceil(left/1000)}s — ${STATE.minutes}m`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  function cancel(){
    try{ cancelAnimationFrame(raf) }catch{}
    try{ clearTimeout(reloadTO) }catch{}
    raf=0; reloadTO=0;
  }

  function start(minutes){
    if (Number.isFinite(minutes) && minutes>0) STATE.minutes = minutes;
    STATE.enabled = true; STATE.paused = false;
    hud = ensureHUD();
    btnPause.textContent = "Pause";
    schedule();
    // visual nudge
    if (hud) hud.style.outline = "2px solid #4caf50", setTimeout(()=>hud.style.outline="",400);
  }

  function pause(){
    STATE.paused = true;
    btnPause.textContent = "Resume";
    cancel();
    schedule();
  }

  function resume(){
    STATE.paused = false;
    btnPause.textContent = "Pause";
    // push the nextAt forward from now
    STATE.nextAt = Date.now() + STATE.minutes*60_000;
    schedule();
  }

  function stop(user=false){
    STATE.enabled = false; STATE.paused = false;
    cancel();
    document.getElementById(HUD_ID)?.remove();
    if (user) alert("⏸ Auto-refresh stopped");
  }

  // Messages from popup
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse)=>{
    const reply = (extra={}) => sendResponse({state: STATE.enabled ? (STATE.paused?"paused":"running") : "stopped",
                                             minutes: STATE.minutes,
                                             countdown: STATE.enabled && !STATE.paused ? Math.ceil(Math.max(0, STATE.nextAt - Date.now())/1000) : 0,
                                             ...extra});
    switch(msg.cmd){
      case "start": start(msg.minutes ?? STATE.minutes); reply(); break;
      case "pause": pause(); reply(); break;
      case "resume": resume(); reply(); break;
      case "stop":  stop(true); reply(); break;
      case "setMinutes":
        if (Number.isFinite(msg.minutes) && msg.minutes>0) {
          STATE.minutes = msg.minutes;
          STATE.nextAt  = Date.now() + STATE.minutes*60_000;
          schedule();
        }
        reply();
        break;
      case "status": reply(); break;
    }
    return true; // async
  });

  // Auto-resume after reload if enabled
  if (STATE.enabled) {
    hud = ensureHUD();
    schedule();
  }
})();


---

2) Load it

1. Visit chrome://extensions


2. Enable Developer mode (top right)


3. Click Load unpacked → select the AutoRefreshPro/ folder




---

3) Use it

Click the extension icon to open the popup.

Set Minutes, then Start.

Use Pause / Resume / Stop any time.

A draggable HUD appears on the page showing the countdown and a Pause/Stop pair.

It persists across reloads in that tab.



---

Notes

Everything is per-tab (uses sessionStorage), so different tabs can have different timers.

For a quick test, set minutes to 0.05 (~3 seconds).

If your Chrome is policy-locked from loading unpacked extensions, tell me—I’ll give you a Tampermonkey userscript version with the same controls.


