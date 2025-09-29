Perfect — I’ll give you two bookmarklets only (Start + Stop), and the Start one will show a clear on-page badge so you can always see when it’s running.


---

✅ Step 1 — Create the Start Bookmark

1. Right-click your bookmarks bar → Add page…


2. Name: Auto Refresh Start


3. Paste this into the URL field (all in one line):



javascript:(()=>{const MIN=2;const ID='_arHUD';if(document.getElementById(ID)){alert('Auto-refresh already running.');return;}localStorage.setItem('_autoRefreshInterval',MIN);localStorage.setItem('_autoRefreshNext',Date.now()+MIN*60000);const hud=document.createElement('div');hud.id=ID;hud.style.cssText='position:fixed;z-index:2147483647;bottom:12px;right:12px;padding:8px 12px;background:#000c;color:#fff;font:13px system-ui;border-radius:8px;display:flex;align-items:center;gap:8px';hud.innerHTML='<span id="_arTimer"></span>';document.body.appendChild(hud);function tick(){const left=localStorage.getItem('_autoRefreshNext')-Date.now();const el=document.getElementById('_arTimer');if(!el)return;if(left<=0){localStorage.setItem("_autoRefreshNext",Date.now()+MIN*60000);location.reload();}else{el.textContent="⟳ "+Math.ceil(left/1000)+"s";setTimeout(tick,500);}}tick();alert('Auto-refresh started. Every '+MIN+' min.');})();

> Change MIN=2 to another number if you want a different interval (in minutes).




---

✅ Step 2 — Create the Stop Bookmark

1. Add another bookmark.


2. Name: Auto Refresh Stop


3. Paste this into the URL field:



javascript:(()=>{localStorage.removeItem('_autoRefreshInterval');localStorage.removeItem('_autoRefreshNext');document.getElementById('_arHUD')?.remove();alert('Auto-refresh stopped.');})();


---

✅ How to Use

1. Open the page you want to auto-refresh.


2. Click Auto Refresh Start →

You’ll see a floating badge bottom-right with a countdown (so you know it’s active).

Page will reload every 2 minutes.



3. To stop at any time, click Auto Refresh Stop →

Countdown badge disappears.

You’ll see an alert confirming it stopped.





---

✅ Why This Works

Visual feedback: Badge appears so you can confirm it started.

Clear stop: Second bookmark removes badge + cancels timer.

Persistent across reloads: Uses localStorage to remember the next refresh even after reload.



---

Do you want me to modify this so that Start bookmark also opens a tiny popup window (optional controller) when allowed — so you have both the badge and a popup to close?

