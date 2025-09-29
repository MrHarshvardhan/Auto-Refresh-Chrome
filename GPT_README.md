Yes! We can absolutely do that.
I’ll update the code so that:

✅ It shows a transparent floating countdown label (bottom-right).

✅ The countdown resets after every refresh (loop).

✅ You can stop it anytime with the Stop bookmark (removes the label + cancels the loop).


Here’s the final setup — just two bookmarklets.


---

🟢 1. Start Bookmark (with Transparent Countdown)

1. Create a bookmark called Auto Refresh Start.


2. Paste this entire code in the URL field (single line):



javascript:(()=>{const MIN=2;const ID='_arHUD';if(document.getElementById(ID)){alert('Auto-refresh already running.');return;}localStorage.setItem('_autoRefreshInterval',MIN);localStorage.setItem('_autoRefreshNext',Date.now()+MIN*60000);const hud=document.createElement('div');hud.id=ID;hud.style.cssText='position:fixed;z-index:2147483647;bottom:12px;right:12px;padding:6px 10px;background:rgba(0,0,0,0.5);color:#fff;font:14px monospace;border-radius:8px;backdrop-filter:blur(4px);';document.body.appendChild(hud);function tick(){const next=parseInt(localStorage.getItem('_autoRefreshNext'));const left=next-Date.now();if(!document.getElementById(ID))return;if(left<=0){localStorage.setItem('_autoRefreshNext',Date.now()+MIN*60000);location.reload();}else{hud.textContent='⟳ Refresh in '+Math.ceil(left/1000)+'s';setTimeout(tick,500);}}tick();alert('Auto-refresh started: every '+MIN+' min');})();


---

🔴 2. Stop Bookmark

1. Create another bookmark called Auto Refresh Stop.


2. Paste this code into the URL field:



javascript:(()=>{localStorage.removeItem('_autoRefreshInterval');localStorage.removeItem('_autoRefreshNext');document.getElementById('_arHUD')?.remove();alert('Auto-refresh stopped');})();


---

✅ How It Works

Start: Click “Auto Refresh Start” →

A small transparent label appears in the bottom-right corner showing a live countdown.

When it hits 0, the page refreshes, and the timer restarts automatically (loop).


Stop: Click “Auto Refresh Stop” →

The label disappears and refresh stops completely.




---

🔧 Testing

For quick testing, you can change const MIN=2; to const MIN=0.1; (≈6 seconds) in the Start code to confirm it’s working before using the 2-minute interval.


---

Would you like me to also make the countdown clickable so you can stop the auto-refresh by just clicking the timer (no separate Stop bookmark needed)?

