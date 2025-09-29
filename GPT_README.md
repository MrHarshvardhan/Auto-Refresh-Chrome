Sounds like it didn’t actually start. Let’s use a verified bookmarklet that shows a countdown overlay on your page and (optionally) uses a tiny controller popup so it keeps working after each reload.

Step 1 — Quick 10-second test (no popup)

Make a bookmark with this as the URL. Click it on any page—if you see a floating countdown and the page reloads in 10s, it’s working.

javascript:(()=>{const ms=10000;let o=document.getElementById('_arHUD');if(o){o.remove()}o=document.createElement('div');o.id='_arHUD';o.style.cssText='position:fixed;z-index:2147483647;bottom:12px;right:12px;padding:8px 10px;background:#0008;color:#fff;font:12px/1.2 system-ui;border-radius:8px';document.body.appendChild(o);const end=Date.now()+ms;const tick=()=>{const left=Math.max(0,end-Date.now());o.textContent='Auto-refresh test: '+Math.ceil(left/1000)+'s';if(left<=0){o.textContent='Reloading...';location.reload();}else{setTimeout(tick,200)}};tick();})();

If that works, move to Step 2 for the 2-minute persistent version.


---

Step 2 — 2-minute persistent auto-refresh (uses a small popup)

Create another bookmark with this URL. This one shows a popup controller, so the refresh continues after each reload. If a popup is blocked, you’ll get an alert—allow popups for the site and click the bookmark again.

javascript:(()=>{const MIN=2;const TAB=window.name||'AUTO_REFRESH_TAB';window.name=TAB;const CTRL=TAB+'_CTRL';const w=window.open('about:blank',CTRL,'width=360,height=160,noopener,noreferrer');if(!w){alert('Popup blocked. Click the 🔒 icon in the address bar, allow pop-ups for this site, then click the bookmark again.');return;}w.document.title='Auto Refresh Controller';w.document.body.style.cssText='font:14px/1.4 system-ui;padding:12px';w.document.body.innerHTML=`<b>Auto-refresh</b><br>Target tab: <code>${TAB}</code><br>Interval: <b>${MIN}</b> min<br><button id="stop" style="margin-top:8px;padding:6px 10px;border-radius:8px;border:1px solid #ccc;background:#f5f5f5;cursor:pointer">Stop</button><div id="status" style="margin-top:8px;opacity:.8"></div>`;const status=w.document.getElementById('status');const stopBtn=w.document.getElementById('stop');const schedule=()=>{const t=w.open('',TAB);if(!t||t.closed){status.textContent='Target tab not found. Controller will close.';w.setTimeout(()=>w.close(),800);return;}let next=Date.now()+MIN*60000;function updateHUD(){try{t.document.getElementById('_arHUD')?.remove();const hud=t.document.createElement('div');hud.id='_arHUD';hud.style.cssText='position:fixed;z-index:2147483647;bottom:12px;right:12px;padding:8px 10px;background:#0008;color:#fff;font:12px/1.2 system-ui;border-radius:8px';const left=Math.max(0,next-Date.now());hud.textContent='Auto-refresh: '+Math.ceil(left/1000)+'s';t.document.body.appendChild(hud);}catch(e){}w.requestAnimationFrame(updateHUD)}updateHUD();return w.setInterval(()=>{const tab=w.open('',TAB);if(!tab||tab.closed){w.clearInterval(w._timer);w.close();return;}next=Date.now()+MIN*60000;status.textContent='Reload @ '+new Date().toLocaleTimeString();tab.location.reload();},MIN*60000)};w._timer=schedule();stopBtn.onclick=()=>{w.clearInterval(w._timer);w.close();};status.textContent='Running… first reload in '+MIN+' min.';})();

How it behaves

Small controller popup appears → that means it’s running.

A tiny countdown badge appears on the bottom-right of your page.

Closing the popup stops the auto-refresh.



---

Step 3 — Stop bookmark (just in case)

If you lose the popup, click this bookmark to stop the refresher:

javascript:(()=>{const n=(window.name||'AUTO_REFRESH_TAB')+'_CTRL';const w=window.open('',n);if(w){w.close();alert('Auto-refresh stopped.');}else{alert('No controller found.');}})();


---

If it still doesn’t refresh

Popup blocked: allow popups for the site and click the bookmark again (you should see the controller).

Site in a hardened sandbox/CSP: try another page to confirm it works; some sites restrict window.open targeting or script execution.

Verify quickly: change the interval in the code from 2 to 0.1 to see it reload every ~6 seconds, then switch back.


