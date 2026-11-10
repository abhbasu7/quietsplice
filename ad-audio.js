(() => {
  "use strict";
  const youtube = location.hostname === "www.youtube.com";
  const hbo = /(^|\.)(hbomax|max)\.com$/.test(location.hostname);
  if (!youtube && !hbo) return;
  const owned = new Map();
  let active = false;
  let missingSince = null;
  let notice;
  let noticeUntil = 0;

  function visible(element) {
    return element.isConnected && element.checkVisibility({
      checkOpacity: true, checkVisibilityCSS: true
    }) && element.getClientRects().length > 0;
  }

  function announce(text) {
    if (!notice) {
      notice = document.createElement("div");
      notice.setAttribute("role", "status");
      notice.style.cssText = "position:fixed;bottom:85px;left:24px;z-index:2147483647;" +
        "background:#151515;color:white;padding:6px 10px;border-radius:999px;" +
        "font:600 12px system-ui;pointer-events:none;";
    }
    notice.textContent = text;
    noticeUntil = performance.now() + 2200;
    if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
      const message = new SpeechSynthesisUtterance(text);
      message.lang = "en-US";
      // Use a local voice when available. Never cancel the page's speech queue.
      const voice = speechSynthesis.getVoices().find(v => v.localService && v.lang.startsWith("en"));
      if (voice) {
        message.voice = voice;
        try { speechSynthesis.speak(message); }
        catch (error) { console.warn("[QuietSplice] Speech unavailable:", String(error.message || error)); }
      }
    }
  }

  function restore(announceChange = true) {
    let unmuted = false;
    for (const [video, wasMuted] of owned) {
      video.muted = wasMuted;
      if (!wasMuted) unmuted = true;
    }
    owned.clear();
    if (unmuted && announceChange) announce("Unmuting");
  }

  function check() {
    for (const [video, wasMuted] of owned) {
      if (!video.isConnected) { video.muted = wasMuted; owned.delete(video); }
    }
    const players = youtube
      ? [...document.querySelectorAll('.html5-video-player.ad-showing, #movie_player:has([id^="ad-badge:"])')].filter(visible)
      : [];
    const hasAd = youtube ? players.length > 0
      : [...document.querySelectorAll('[data-testid="player-ux-ad-label"]')].some(visible);
    const now = performance.now();
    if (hasAd) {
      active = true;
      missingSince = null;
      const videos = youtube ? players.flatMap(player => [...player.querySelectorAll("video")])
        : [...document.querySelectorAll("video")].filter(visible);
      let newlyMuted = false;
      for (const video of videos) {
        if (!video.isConnected) continue;
        if (!owned.has(video)) {
          owned.set(video, video.muted);
          if (!video.muted) newlyMuted = true;
        }
        video.muted = true;
      }
      if (newlyMuted) announce("Muted");
      else if (!notice && owned.size > 0) {
        // Create the same visual notice without speaking over pre-muted playback.
        const placeholder = document.createElement("div");
        placeholder.setAttribute("role", "status");
        placeholder.style.cssText = "position:fixed;bottom:85px;left:24px;z-index:2147483647;" +
          "background:#151515;color:white;padding:6px 10px;border-radius:999px;" +
          "font:600 12px system-ui;pointer-events:none;";
        notice = placeholder;
      }
    } else if (active) {
      // Avoid unmuting between ads when the countdown briefly disappears.
      missingSince ??= now;
      if (now - missingSince >= 1200) {
        active = false;
        missingSince = null;
        restore();
      }
    }
    if (notice) {
      const adMuted = active && owned.size > 0;
      if (adMuted && notice.textContent !== "Ad muted") notice.textContent = "Ad muted";
      if (adMuted || now < noticeUntil) {
        const host = document.fullscreenElement || document.body;
        if (notice.parentNode !== host) host.appendChild(notice);
      } else {
        notice.remove();
      }
    }
  }

  window.addEventListener("pagehide", () => {
    restore(false);
    active = false;
    missingSince = null;
    noticeUntil = 0;
    notice?.remove();
  });
  window.addEventListener("pageshow", check);
  // Polling avoids observing the extension's own notification mutations.
  setInterval(check, 250);
  check();
})();
