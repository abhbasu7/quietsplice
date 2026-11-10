const {test} = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const {readFileSync} = require("node:fs");
const source = readFileSync(`${__dirname}/hbo-intro.js`, "utf8");
function start({visible = true, disabled = false, covered = false} = {}) {
 let interval, now = 0; const buttons = [];
 const b = {isConnected: true, disabled, clicks: 0, getAttribute: () => null,
  checkVisibility: () => visible, getClientRects: () => [{}], contains: () => false,
  getBoundingClientRect: () => ({left: 10, top: 10, width: 80, height: 30}), click() {this.clicks++;}};
 vm.runInNewContext(source, {innerWidth: 800, innerHeight: 600, performance: {now: () => now},
  console: {info() {}}, document: {
   querySelectorAll(selector) {
    assert.equal(selector, 'button[data-testid="player-ux-skip-button"][aria-label="Skip Intro"]');
    return buttons;
   }, elementFromPoint: () => covered ? {} : b
  }, setInterval: fn => {interval = fn;}});
 return {b, add() {buttons.push(b);}, tick(ms = 500) {now += ms; interval();}};
}
test("clicks a late-appearing intro control and throttles retries", () => {
 const app = start(); app.tick(5000); app.add(); app.tick(); assert.equal(app.b.clicks, 1);
 app.tick(); assert.equal(app.b.clicks, 1); app.tick(2000); assert.equal(app.b.clicks, 2);
});
test("ignores hidden, disabled, covered, disconnected, and offscreen controls", () => {
 for (const options of [{visible:false}, {disabled:true}, {covered:true}]) {
  const app = start(options); app.add(); app.tick(); assert.equal(app.b.clicks, 0);
 }
 const app = start(); app.add(); app.b.isConnected = false; app.tick(); assert.equal(app.b.clicks, 0);
 app.b.isConnected = true;
 app.b.getBoundingClientRect = () => ({left:-100, top:0, width:20, height:20});
 app.tick(); assert.equal(app.b.clicks, 0);
});
test("HBO gets intro script without enabling it on other services", () => {
 const m = JSON.parse(readFileSync(`${__dirname}/manifest.json`, "utf8"));
 const entries = m.content_scripts.filter(s => s.js.includes("hbo-intro.js"));
 assert.equal(entries.length, 1);
 assert.deepEqual(entries[0].matches, ["https://*.max.com/*", "https://*.hbomax.com/*"]);
 assert.deepEqual(entries[0].js, ["ad-audio.js", "hbo-intro.js"]);
 assert.deepEqual(m.permissions, ["debugger"]);
});
