"use strict";
const busy = new Set();

// Runs inside the target tab immediately before input; accepts no page-provided code.
function inspectSkip() {
  if (location.origin !== "https://www.youtube.com") return null;
  const player = document.querySelector("#movie_player");
  if (!player || !player.matches(".ad-showing, .ad-interrupting") &&
      !player.querySelector('[id^="ad-badge:"]')) return null;
  const known = '.ytp-skip-ad-button, .ytp-ad-skip-button, .ytp-ad-skip-button-modern, [id^="skip-button:"]';
  for (const button of player.querySelectorAll('button, [role="button"]')) {
    const label = (button.getAttribute("aria-label") || button.textContent || "").trim();
    if (!button.matches(known) && !/^skip(?: ads?)?$/i.test(label)) continue;
    if (!button.isConnected || button.disabled || button.getAttribute("aria-disabled") === "true" ||
        button.hidden || !button.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})) continue;
    const r = button.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (r.width <= 0 || r.height <= 0 || x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
    const hit = document.elementFromPoint(x, y);
    if (!hit || !(hit === button || button.contains(hit))) continue;
    const video = player.querySelector("video");
    return {x, y, src: video?.currentSrc || ""};
  }
  return null;
}

async function clickSkip(tabId) {
  const target = {tabId};
  let attached = false;
  let outcome;
  try {
    await chrome.debugger.attach(target, "1.3");
    attached = true;
    const inspect = async () => {
      const result = await chrome.debugger.sendCommand(target, "Runtime.evaluate", {
        expression: `(${inspectSkip.toString()})()`, returnByValue: true
      });
      if (result.exceptionDetails) throw new Error("Skip validation failed in the page");
      const value = result.result?.value;
      if (value == null) return null;
      if (!Number.isFinite(value.x) || !Number.isFinite(value.y) || value.x < 0 || value.y < 0 ||
          typeof value.src !== "string") throw new Error("Invalid Skip coordinates");
      return value;
    };
    const first = await inspect();
    if (!first) return {ok: false, outcome: "no-usable-button"};
    await chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", {
      type: "mouseMoved", x: first.x, y: first.y, button: "none"
    });
    // Revalidate after hover because controls and overlays may move.
    const point = await inspect();
    if (!point || point.src !== first.src || point.x !== first.x || point.y !== first.y)
      return {ok: false, outcome: "button-changed"};
    await chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", {
      type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1
    });
    await chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", {
      type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1
    });
    await new Promise(resolve => setTimeout(resolve, 400));
    const after = await inspect();
    outcome = {ok: true, outcome: !after || after.src !== point.src
      ? "transition-observed" : "click-unconfirmed"};
  } catch (error) {
    outcome = {ok: false, outcome: "error", error: String(error.message || error)};
  } finally {
    if (attached) {
      try { await chrome.debugger.detach(target); }
      catch (error) { console.warn("[Buildooor] Debugger cleanup:", String(error.message || error)); }
    }
  }
  return outcome;
}

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.type !== "buildooor-skip") return;
  // No arbitrary coordinates or CDP commands are accepted from content scripts.
  if (sender.id !== chrome.runtime.id || sender.frameId !== 0 || !sender.tab || !Number.isInteger(sender.tab.id) || sender.tab.id < 0 ||
      !/^https:\/\/www\.youtube\.com\//.test(sender.url || "")) {
    respond({ok: false, outcome: "unauthorized"}); return;
  }
  const tabId = sender.tab.id;
  if (busy.has(tabId)) { respond({ok: false, outcome: "busy"}); return; }
  busy.add(tabId);
  clickSkip(tabId).then(respond, error => respond({ok: false, outcome: "error", error: String(error)}))
    .finally(() => busy.delete(tabId));
  return true;
});
