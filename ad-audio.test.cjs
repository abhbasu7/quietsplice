const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { readFileSync } = require("node:fs");
const source = readFileSync(`${__dirname}/ad-audio.js`, "utf8");
function start({ hostname = "www.youtube.com", muted = false, markerSelector = null, markerVisible = true, localVoice = true, speechFails = false } = {}) {
  let tick, now = 0, ad = false, pagehide;
  const spoken = [];
  const events = {};
  const notices = [];
  const video = { muted, volume: 0.37, isConnected: true,
    checkVisibility: () => true, getClientRects: () => [{}] };
  const player = { ...video, checkVisibility: () => markerVisible, querySelectorAll: () => [video] };
  const host = { appendChild(n) { n.parentNode = this; } };
  const doc = { body: host, fullscreenElement: null,
      createElement: () => { const n = { style: {}, setAttribute() {}, remove() { this.parentNode = null; } }; notices.push(n); return n; },
      querySelectorAll: s => s === "video" ? [video] : ad && (!markerSelector || s === markerSelector) ? [player] : [] };
  vm.runInNewContext(source, {
    console: {warn() {}},
    location: { hostname }, performance: { now: () => now },
    document: doc,
    window: { speechSynthesis: {}, SpeechSynthesisUtterance: function() {},
      addEventListener: (event, callback) => { events[event] = callback; } },
    SpeechSynthesisUtterance: function(text) { this.text = text; },
    speechSynthesis: { getVoices: () => localVoice ? [{localService: true, lang: "en-US"}] : [], speak: m => { if (speechFails) throw Error("Speech unavailable"); spoken.push(m.text); } },
    setInterval: callback => { tick = callback; }
  });
  return { video, spoken, notices, doc, ad(value) { ad = value; tick?.(); },
    tick(ms = 250) { now += ms; tick?.(); }, leave() { events.pagehide(); } };
}
test("mutes an ad and restores audio after the break", () => {
  const app = start(); app.ad(true);
  assert.equal(app.video.muted, true); assert.deepEqual(app.spoken, ["Muted"]);
  app.ad(false); app.tick(1200);
  assert.equal(app.video.muted, false); assert.equal(app.video.volume, 0.37);
  assert.deepEqual(app.spoken, ["Muted", "Unmuting"]);
});
test("preserves a video that the viewer already muted", () => {
  const app = start({ muted: true }); app.ad(true); app.ad(false); app.tick(1200);
  assert.equal(app.video.muted, true); assert.deepEqual(app.spoken, []);
});
test("does not repeatedly announce a continuous break", () => {
  const app = start(); app.ad(true); app.tick(); app.tick();
  assert.deepEqual(app.spoken, ["Muted"]);
});
test("keeps audio muted during gaps between consecutive ads", () => {
  const app = start(); app.ad(true); app.ad(false); app.tick(500); app.ad(true);
  assert.equal(app.video.muted, true); assert.deepEqual(app.spoken, ["Muted"]);
});
test("restores extension-owned mute on page exit", () => {
  const app = start(); app.ad(true); app.leave(); assert.equal(app.video.muted, false);
});
test("does not run on unverified streaming sites", () => {
  const app = start({ hostname: "www.hulu.com" }); app.ad(true);
  assert.equal(app.video.muted, false); app.ad(false); app.tick(1200);
  assert.equal(app.video.muted, false);
});
test("leaves ordinary playback alone", () => {
  const app = start(); app.tick(5000);
  assert.equal(app.video.muted, false); assert.deepEqual(app.spoken, []);
});

test("keeps Ad muted visible beyond the brief announcement timeout", () => {
 const app = start(); app.ad(true); app.tick(6000);
 assert.equal(app.notices[0].textContent, "Ad muted");
 assert.equal(app.notices[0].parentNode, app.doc.body);
 assert.deepEqual(app.spoken, ["Muted"]);
 app.ad(false); app.tick(500);
 assert.equal(app.notices[0].textContent, "Ad muted");
 app.tick(700); assert.equal(app.notices[0].textContent, "Unmuting");
 app.tick(2300); assert.equal(app.notices[0].parentNode, null);
});
test("moves the badge into fullscreen and back without repeated speech", () => {
 const app = start(); app.ad(true);
 const full = {appendChild(n) {n.parentNode = this;}};
 app.doc.fullscreenElement = full; app.tick();
 assert.equal(app.notices[0].parentNode, full);
 app.doc.fullscreenElement = null; app.tick();
 assert.equal(app.notices[0].parentNode, app.doc.body);
 assert.deepEqual(app.spoken, ["Muted"]);
});
test("shows the badge for already-muted ads without speaking or unmuting", () => {
 const app = start({muted: true}); app.ad(true); app.tick(6000);
 assert.equal(app.notices[0].textContent, "Ad muted");
 assert.equal(app.notices[0].parentNode, app.doc.body);
 app.ad(false); app.tick(1200);
 assert.equal(app.notices[0].parentNode, null);
 assert.equal(app.video.muted, true); assert.deepEqual(app.spoken, []);
});

for (const hostname of ["play.hbomax.com", "play.max.com", "hbomax.com"]) {
 test(`HBO's exact visible Ad label mutes then restores on ${hostname}`, () => {
  const app = start({hostname, markerSelector: '[data-testid="player-ux-ad-label"]'});
  app.ad(true); app.tick(5000);
  assert.equal(app.video.muted, true);
  assert.equal(app.notices[0].textContent, "Ad muted");
  app.ad(false); app.tick(1200);
  assert.equal(app.video.muted, false);
  assert.equal(app.notices[0].textContent, "Unmuting");
  assert.deepEqual(app.spoken, ["Muted", "Unmuting"]);
 });
}
test("a hidden HBO Ad label does not mute the show", () => {
 const app = start({hostname: "play.hbomax.com", markerSelector: '[data-testid="player-ux-ad-label"]', markerVisible: false});
 app.ad(true); assert.equal(app.video.muted, false); assert.deepEqual(app.spoken, []);
});
test("unrelated streaming markers cannot mute HBO content", () => {
 const app = start({hostname: "play.hbomax.com", markerSelector: ".AdCountdown"});
 app.ad(true); assert.equal(app.video.muted, false);
});
test("HBO consecutive ads keep one announcement and preserve pre-muted playback", () => {
 for (const muted of [true, false]) {
  const app = start({hostname: "play.hbomax.com", muted, markerSelector: '[data-testid="player-ux-ad-label"]'});
  app.ad(true); app.ad(false); app.tick(500); app.ad(true);
  assert.equal(app.video.muted, true);
  assert.deepEqual(app.spoken, muted ? [] : ["Muted"]);
  app.ad(false); app.tick(1200); assert.equal(app.video.muted, muted);
 }
});

test("page exit restores audio silently and removes the badge", () => {
 const app = start(); app.ad(true); app.leave();
 assert.equal(app.video.muted, false); assert.equal(app.notices[0].parentNode, null);
 assert.deepEqual(app.spoken, ["Muted"]);
});
test("uses no network voice when local English speech is unavailable", () => {
 const app = start({localVoice:false}); app.ad(true);
 assert.equal(app.video.muted, true); assert.equal(app.notices[0].textContent, "Ad muted");
 assert.deepEqual(app.spoken, []);
});
test("speech failure cannot interrupt muting, badge, or restoration", () => {
 const app = start({speechFails:true}); app.ad(true);
 assert.equal(app.video.muted, true); assert.equal(app.notices[0].textContent, "Ad muted");
 app.ad(false); app.tick(1200); assert.equal(app.video.muted, false);
});
test("detached ad videos are restored and released", () => {
 const app = start(); app.ad(true); app.video.isConnected = false; app.tick();
 assert.equal(app.video.muted, false);
});
