Got it—here’s a step-by-step that works even when console paste is blocked.

A) Bookmarklet (persistent auto-refresh) — recommended

Step 1: Create the bookmarklet

1. Right-click the bookmarks bar → Add page…


2. Name: Auto Refresh (2 min)


3. URL (paste this exact code):



javascript:(()=>{const m=2;const TAB_NAME=window.name||'AUTO_REFRESH_TAB';window.name=TAB_NAME;const ctrlName=TAB_NAME+'_CTRL';const ctrl=window.open('about:blank',ctrlName,'width=360,height=140,noopener,noreferrer');if(!ctrl){alert('Enable pop-ups for this site, then click the bookmark again.');return;}ctrl.document.title='Auto Refresh Controller';ctrl.document.body.style.cssText='font:14px system-ui,sans-serif;padding:10px';ctrl.document.body.innerHTML=`<b>Auto-refresh:</b> <code>${TAB_NAME}</code> every ${m} min.<br>Close this window to stop.`;ctrl.refreshTimer=ctrl.setInterval(()=>{const t=ctrl.open('',TAB_NAME);if(!t||t.closed){ctrl.clearInterval(ctrl.refreshTimer);ctrl.close();return;}t.location.reload();},m*60000);})();

> To change the interval, edit const m=2; (minutes).



Step 2: Start it

Open the page you want to auto-refresh.

Click the Auto Refresh (2 min) bookmark.

If Chrome blocks a popup, allow pop-ups for the site and click the bookmark again.


Step 3: Stop it

Close the small “Auto Refresh Controller” window, or use this Stop bookmarklet:


Create another bookmark named Stop Auto Refresh with this URL:

javascript:(()=>{const n=(window.name||'AUTO_REFRESH_TAB')+'_CTRL';const w=window.open('',n);if(w){w.close();alert('Auto-refresh stopped.');}else{alert('No controller found.');}})();


---

B) DevTools Snippet method (if you prefer not to use bookmarks)

Step 1: Create the snippet

1. Press F12 → Sources tab → Snippets (left sidebar).


2. Right-click Snippets → New → name it auto-refresh-controller.


3. Paste this code:



(function startAutoRefresh(minutes = 2) {
  const TAB_NAME = window.name || 'AUTO_REFRESH_TAB';
  window.name = TAB_NAME;

  const ctrl = window.open('about:blank', TAB_NAME + '_CTRL', 'width=360,height=140,noopener,noreferrer');
  if (!ctrl) { console.warn('Enable pop-ups for this site and run again.'); return; }

  ctrl.document.title = 'Auto Refresh Controller';
  ctrl.document.body.style.cssText = 'font:14px system-ui,sans-serif;padding:10px';
  ctrl.document.body.innerHTML = `<b>Auto-refresh:</b> <code>${TAB_NAME}</code> every ${minutes} min.<br>Close this window to stop.`;

  ctrl.refreshTimer = ctrl.setInterval(() => {
    const target = ctrl.open('', TAB_NAME);
    if (!target || target.closed) { ctrl.clearInterval(ctrl.refreshTimer); ctrl.close(); return; }
    target.location.reload();
  }, minutes * 60000);
})(2); // change 2 to your desired minutes

Step 2: Run it

With the target page open, go to Sources → Snippets, right-click auto-refresh-controller → Run.


Step 3: Stop it

Close the controller window, or run this quick snippet in the console:


window.open('', (window.name||'AUTO_REFRESH_TAB') + '_CTRL')?.close();


---

Quick troubleshooting

Popup blocked → Allow pop-ups for the site (click the icon in the address bar) and try again.

Site changes your tab name → The script resets window.name to keep it targetable.

Interval change → Edit the value 2 (minutes) in either code.


  
