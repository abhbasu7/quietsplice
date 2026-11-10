const {test} = require("node:test");
const assert = require("node:assert/strict");
const {readFileSync, existsSync} = require("node:fs");
const path = require("node:path");
const manifest=JSON.parse(readFileSync(path.join(__dirname,"manifest.json"),"utf8"));
test("release only requests the confirmed site scope and required debugger API",()=>{
 assert.deepEqual(manifest.permissions,["debugger"]);
 assert.deepEqual(manifest.content_scripts.flatMap(s=>s.matches).sort(),
  ["https://www.youtube.com/*","https://*.max.com/*","https://*.hbomax.com/*"].sort());
 assert.equal(manifest.host_permissions,undefined);
 assert.equal(manifest.externally_connectable,undefined);
});
test("every runtime script and icon is present and package versions agree",()=>{
 const files=[manifest.background.service_worker,...Object.values(manifest.icons),
  ...manifest.content_scripts.flatMap(s=>s.js)];
 for(const file of files)assert.equal(existsSync(path.join(__dirname,file)),true,file);
 assert.equal(JSON.parse(readFileSync(path.join(__dirname,"package.json"))).version,manifest.version);
});
