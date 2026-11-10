(() => {
  "use strict";
  const selector = [
    ".html5-video-player .ytp-ad-skip-button",
    ".html5-video-player .ytp-ad-skip-button-modern",
    ".html5-video-player .ytp-skip-ad-button",
    '#movie_player button[id^="skip-button:"]'
  ].join(",");
  const lastClick = new WeakMap();
  let requesting = false;
  let retryAfter = 0;

  let lastStatus = "";
  function status(message) {
    if (message === lastStatus) return;
    lastStatus = message;
    console.info("[QuietSplice auto-skip] " + message);
  }

  function skipAvailableAd() {
    if (performance.now() < retryAfter) return;
    const adActive = !!document.querySelector(
      '.html5-video-player.ad-showing, #movie_player [id^="ad-badge:"]'
    );
    const candidates = document.querySelectorAll(
      selector + ', #movie_player button, #movie_player [role="button"]'
    );
    let available = false;
    for (const button of candidates) {
      const label = (button.getAttribute("aria-label") || button.textContent || "").trim();
      if (!button.matches(selector) && !(adActive && /^skip(?: ads?)?$/i.test(label))) continue;
      if (!button.isConnected || button.disabled ||
          button.getAttribute("aria-disabled") === "true" ||
          !button.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) ||
          button.getClientRects().length === 0) continue;
      available = true;
      const now = performance.now();
      if (now - (lastClick.get(button) ?? -Infinity) < 1000) continue;
      lastClick.set(button, now);
      if (requesting) break;
      requesting = true;
      chrome.runtime.sendMessage({type: "quietsplice-skip"}, response => {
        requesting = false;
        const error = chrome.runtime.lastError;
        if (error) { retryAfter = performance.now() + 30000; status("Skip failed: " + error.message); return; }
        if (!response) { retryAfter = performance.now() + 30000; status("Skip failed: no background response."); return; }
        if (response.outcome === "error") retryAfter = performance.now() + 30000;
        status(response.outcome === "transition-observed"
          ? "Skip input sent; control disappeared or ad changed (transition observed)."
          : "Skip result: " + response.outcome + (response.error ? " - " + response.error : ""));
      });
      break;
    }
    if (!available) status(adActive ? "Ad detected; waiting for an enabled Skip control."
      : "Watching for ads and Skip controls.");
  }

  let pending = false;
  function scheduleCheck() {
    if (pending) return;
    pending = true;
    setTimeout(() => {
      pending = false;
      skipAvailableAd();
    }, 0);
  }

  new MutationObserver(scheduleCheck).observe(document.documentElement, {
    subtree: true, childList: true, attributes: true,
    attributeFilter: ["class", "style", "disabled", "aria-disabled", "hidden"]
  });
  // Covers CSS-only visibility changes and a reused button on consecutive ads.
  setInterval(skipAvailableAd, 500);
  skipAvailableAd();
})();
