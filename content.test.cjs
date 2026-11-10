const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");
const source = readFileSync(`${__dirname}/content.js`, "utf8");

function button(overrides = {}) {
  return {
    isConnected: true, disabled: false, clicks: 0, events: [],
    dispatchEvent(event) { this.events.push(event.type); },
    matches: () => true, textContent: "", getAttribute: () => null, checkVisibility: () => true,
    getClientRects: () => [{}], click() { this.clicks++; }, ...overrides
  };
}
function start(buttons, matches = () => true, ad = false) {
  let observer, interval, now = 0;
  const queued = [];
  vm.runInNewContext(source, {
    console: { info() {} }, window: {},
    chrome: { runtime: { sendMessage(message, callback) {
      assert.equal(message.type, "quietsplice-skip");
      const candidate = buttons.find(b => !b.disabled && b.isConnected && b.checkVisibility());
      if (candidate) candidate.clicks++;
      callback({ok: true, outcome: "click-unconfirmed"});
    } } },
    PointerEvent: class { constructor(type) { this.type = type; } },
    MouseEvent: class { constructor(type) { this.type = type; } },
    document: { querySelector: () => ad ? {} : null, documentElement: {}, querySelectorAll: selector => buttons.filter(b => matches(selector, b)) },
    performance: { now: () => now },
    MutationObserver: class { constructor(callback) { observer = callback; } observe() {} },
    setTimeout: callback => queued.push(callback),
    setInterval: callback => { interval = callback; }
  });
  return {
    tick(ms = 500) { now += ms; interval(); },
    mutate() { observer(); while (queued.length) queued.shift()(); }
  };
}

test("clicks an available Skip button immediately", () => {
  const b = button(); start([b]); assert.equal(b.clicks, 1);
});
test("waits until the button is enabled and visible", () => {
  for (const overrides of [
    { disabled: true }, { isConnected: false },
    { getAttribute: () => "true" }, { checkVisibility: () => false },
    { getClientRects: () => [] }
  ]) {
    const b = button(overrides); start([b]); assert.equal(b.clicks, 0);
  }
});
test("notices a Skip button becoming enabled", () => {
  const b = button({ disabled: true }); const app = start([b]);
  b.disabled = false; app.mutate(); assert.equal(b.clicks, 1);
});
test("avoids rapid repeat clicks but retries a reused button", () => {
  const b = button(); const app = start([b]);
  app.mutate(); app.tick(); assert.equal(b.clicks, 1);
  app.tick(); assert.equal(b.clicks, 2);
});
test("handles a new ad after navigation without reloading", () => {
  const buttons = []; const app = start(buttons);
  const first = button(); buttons.push(first); app.mutate();
  const next = button(); buttons.splice(0, 1, next); app.mutate();
  assert.equal(first.clicks, 1); assert.equal(next.clicks, 1);
});
test("falls through hidden candidates to the available button", () => {
  const hidden = button({ checkVisibility: () => false }); const visible = button();
  start([hidden, visible]); assert.equal(hidden.clicks, 0); assert.equal(visible.clicks, 1);
});
test("manifest only injects the existing script on YouTube", () => {
  const manifest = JSON.parse(readFileSync(`${__dirname}/manifest.json`, "utf8"));
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.content_scripts[0].matches, ["https://www.youtube.com/*"]);
  assert.deepEqual(manifest.content_scripts[0].js, ["ad-audio.js", "content.js"]);
  assert.deepEqual(manifest.permissions, ["debugger"]);
  assert.equal(manifest.background.service_worker, "background.js");
});

test("detects the observed skip-button:2 control without a legacy ad-showing class", () => {
  const b = button();
  start([b], selector => selector.split(",").some(s =>
    s.trim() === '#movie_player button[id^="skip-button:"]'));
  assert.equal(b.clicks, 1);
});

test("finds a Skip control inserted after a five-second countdown", () => {
  const buttons = []; const app = start(buttons);
  for (let n = 0; n < 10; n++) app.tick();
  const b = button(); buttons.push(b); app.tick(); assert.equal(b.clicks, 1);
});
test("rechecks a hidden control once it becomes visible later", () => {
  let visible = false; const b = button({ checkVisibility: () => visible });
  const app = start([b]); app.tick(5000); assert.equal(b.clicks, 0);
  visible = true; app.tick(); assert.equal(b.clicks, 1);
});
test("uses an exact Skip label in an active ad when classes change", () => {
  const b = button({ matches: () => false, textContent: "Skip" });
  start([b], () => true, true); assert.equal(b.clicks, 1);
});
test("never treats ordinary player controls as ad Skip controls", () => {
  const b = button({ matches: () => false, textContent: "Skip" });
  start([b]); assert.equal(b.clicks, 0);
  const unrelated = button({ matches: () => false, textContent: "Skip intro" });
  start([unrelated], () => true, true); assert.equal(unrelated.clicks, 0);
});
