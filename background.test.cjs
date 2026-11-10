const {test} = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const {readFileSync} = require("node:fs");
const code = readFileSync(`${__dirname}/background.js`, "utf8");
const point = {x: 40, y: 50, src: "ad-1"};
function worker({points = [point, point, null], fail} = {}) {
  let listener; const calls = [];
  const context = vm.createContext({
    location: {origin:"https://www.youtube.com"},
    console: {warn() {}}, setTimeout: fn => fn(),
    chrome: {runtime: {id: "ours", onMessage: {addListener(fn) {listener = fn;}}},
      debugger: {
        async attach() {calls.push("attach"); if (fail === "attach") throw Error("Permission denied");},
        async detach() {calls.push("detach");},
        async sendCommand(target, name, args) {
          calls.push(name === "Input.dispatchMouseEvent" ? args.type : name);
          if (fail === name) throw Error("Command failed");
          if (name === "Runtime.evaluate") return {result: {value: points.shift()}};
          return {};
        }
      }}
  });
  vm.runInContext(code, context);
  const sender = {id: "ours", frameId: 0, url: "https://www.youtube.com/watch?v=test", tab: {id: 12}};
  return {calls, context,
    request(overrides = {}) {return new Promise(resolve => listener({type: "buildooor-skip"}, {...sender, ...overrides}, resolve));}
  };
}
test("sends browser input and observes a transition, then detaches", async () => {
 const w = worker(); const r = await w.request();
 assert.equal(r.outcome, "transition-observed");
 assert.deepEqual(w.calls, ["attach", "Runtime.evaluate", "mouseMoved", "Runtime.evaluate", "mousePressed", "mouseReleased", "Runtime.evaluate", "detach"]);
});
test("an unchanged control is unconfirmed rather than counted as a skip", async () => {
 const w = worker({points: [point, point, point]});
 assert.equal((await w.request()).outcome, "click-unconfirmed");
});
test("a missing or covered control receives no input", async () => {
 const w = worker({points: [null]});
 assert.equal((await w.request()).outcome, "no-usable-button");
 assert.deepEqual(w.calls, ["attach", "Runtime.evaluate", "detach"]);
});
test("a moving control aborts before mouse press", async () => {
 const w = worker({points: [point, {...point, x: 99}]});
 assert.equal((await w.request()).outcome, "button-changed");
 assert.equal(w.calls.includes("mousePressed"), false);
 assert.equal(w.calls.at(-1), "detach");
});
test("permission errors are returned explicitly without detaching someone else's session", async () => {
 const w = worker({fail: "attach"}); const r = await w.request();
 assert.equal(r.ok, false); assert.match(r.error, /Permission denied/);
 assert.deepEqual(w.calls, ["attach"]);
});
test("command failure still detaches the debugger", async () => {
 const w = worker({fail: "Input.dispatchMouseEvent"});
 assert.equal((await w.request()).outcome, "error");
 assert.equal(w.calls.at(-1), "detach");
});
test("rejects messages from other extensions, frames, and sites", async () => {
 for (const sender of [{id: "other"}, {frameId: 3}, {url: "https://www.youtube.com.evil.test/"}, {url: "https://www.hulu.com/"}]) {
   const w = worker(); assert.equal((await w.request(sender)).outcome, "unauthorized");
   assert.deepEqual(w.calls, []);
 }
});
test("actual validation excludes occluded, offscreen, disabled, and ordinary controls", () => {
 const w = worker(); let covered = false; let ad = true;
 const button = {isConnected: true, disabled: false, hidden: false,
   textContent: "Skip", getAttribute: () => null, matches: () => true,
   checkVisibility: () => true,
   getBoundingClientRect: () => ({left: 10, top: 10, width: 80, height: 30}),
   contains: () => false};
 const player = {matches: () => ad, querySelectorAll: () => [button], querySelector: () => null};
 Object.assign(w.context, {innerWidth: 800, innerHeight: 600,
   document: {querySelector: () => player, elementFromPoint: () => covered ? {} : button}});
 assert.equal(vm.runInContext("inspectSkip().x", w.context), 50);
 covered = true; assert.equal(vm.runInContext("inspectSkip()", w.context), null);
 covered = false; button.disabled = true; assert.equal(vm.runInContext("inspectSkip()", w.context), null);
 button.disabled = false; button.getBoundingClientRect = () => ({left: -100, top: 10, width: 20, height: 20});
 assert.equal(vm.runInContext("inspectSkip()", w.context), null);
 ad = false; assert.equal(vm.runInContext("inspectSkip()", w.context), null);
});

test("rejects malformed coordinates returned by the target page", async () => {
 for (const value of [{x:Infinity,y:20,src:"ad"}, {x:-1,y:20,src:"ad"}, {x:20,y:20}]) {
  const w = worker({points:[value]}); const r = await w.request();
  assert.equal(r.outcome, "error"); assert.equal(w.calls.includes("mousePressed"), false);
  assert.equal(w.calls.at(-1), "detach");
 }
});
test("validation aborts if a tab navigates away from YouTube", () => {
 const w = worker(); w.context.location.origin = "https://example.com";
 assert.equal(vm.runInContext("inspectSkip()",w.context), null);
});

test("rejects invalid tab identifiers before attaching", async () => {
 for (const id of [-1, "12", null]) {
  const w = worker(); assert.equal((await w.request({tab:{id}})).outcome, "unauthorized");
  assert.deepEqual(w.calls, []);
 }
});
test("serializes simultaneous requests for the same tab", async () => {
 const w = worker(); const first = w.request(); const second = await w.request();
 assert.equal(second.outcome, "busy"); await first;
 assert.equal(w.calls.filter(c=>c==="attach").length,1);
});
