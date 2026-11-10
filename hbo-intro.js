(() => {
  "use strict";
  // Match the supplied HBO control, not the generated CSS class names.
  const selector = 'button[data-testid="player-ux-skip-button"][aria-label="Skip Intro"]';
  const lastClick = new WeakMap();
  function checkIntro() {
    for (const button of document.querySelectorAll(selector)) {
      if (!button.isConnected || button.disabled || button.getAttribute("aria-disabled") === "true" ||
          button.hidden || !button.checkVisibility({checkOpacity: true, checkVisibilityCSS: true}) ||
          !button.getClientRects().length) continue;
      const r = button.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (r.width <= 0 || r.height <= 0 || x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
      const hit = document.elementFromPoint(x, y);
      if (!hit || !(hit === button || button.contains(hit))) continue;
      const now = performance.now();
      if (now - (lastClick.get(button) ?? -Infinity) < 2000) continue;
      lastClick.set(button, now);
      button.click();
      console.info("[Buildooor HBO] Skip Intro click attempted.");
      break;
    }
  }
  // Continues across HBO's in-page navigation and delayed control insertion.
  setInterval(checkIntro, 500);
  checkIntro();
})();
