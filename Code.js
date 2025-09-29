(function startAutoRefresh(minutes = 2) {
  const TAB_NAME = window.name || 'AUTO_REFRESH_TAB';
  window.name = TAB_NAME; // ensure this tab has a name

  // open a small controller window
  const ctrlName = TAB_NAME + '_CTRL';
  const ctrl = window.open('about:blank', ctrlName, 'width=360,height=140,noopener,noreferrer');

  // build a tiny UI so you remember what's running
  ctrl.document.title = 'Auto Refresh Controller';
  ctrl.document.body.style.cssText = 'font:14px/1.4 system-ui, sans-serif;padding:10px;';
  ctrl.document.body.innerHTML =
    `<b>Auto-refresh:</b> Reloading tab <code>${TAB_NAME}</code> every ${minutes} min.
     <br>Close this window to stop.`;

  // set up the persistent refresher
  ctrl.refreshTimer = ctrl.setInterval(() => {
    // get a handle to the named tab and reload it (works across reloads)
    const target = ctrl.open('', TAB_NAME);
    if (!target || target.closed) {
      ctrl.clearInterval(ctrl.refreshTimer);
      ctrl.close();
      return;
    }
    target.location.reload();
  }, minutes * 60 * 1000);
})();



window.open('', 'AUTO_REFRESH_TAB_CTRL')?.close();
