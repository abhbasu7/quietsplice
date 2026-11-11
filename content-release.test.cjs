const {test}=require("node:test");
const assert=require("node:assert/strict");
const vm=require("node:vm");
const {readFileSync}=require("node:fs");
const source=readFileSync(`${__dirname}/content.js`,"utf8");
function run(){
 let now=0, interval, callback; const requests=[]; const runtime={};
 const button={isConnected:true, disabled:false, matches:()=>true, getAttribute:()=>null,
  checkVisibility:()=>true,getClientRects:()=>[{}],textContent:"Skip"};
 runtime.sendMessage=(message,reply)=>{requests.push(message);callback=reply;};
 vm.runInNewContext(source,{chrome:{runtime},performance:{now:()=>now},console:{warn(){}},
  document:{querySelector:()=>({}),querySelectorAll:()=>[button],documentElement:{}},
  MutationObserver:class{observe(){}},setTimeout(){},setInterval:fn=>{interval=fn;}});
 return {requests,tick(ms){now+=ms;interval();},reply(response,error){runtime.lastError=error;callback(response);runtime.lastError=undefined;}};
}
test("does not queue overlapping debugger requests",()=>{
 const app=run();app.tick(2000);app.tick(2000);assert.equal(app.requests.length,1);
 app.reply({outcome:"click-unconfirmed"});app.tick(2000);assert.equal(app.requests.length,2);
});
test("backs off for 30 seconds after a debugger failure",()=>{
 const app=run();app.reply({outcome:"error",error:"Debugger unavailable"});
 app.tick(29000);assert.equal(app.requests.length,1);
 app.tick(1000);assert.equal(app.requests.length,2);
});
test("retries with the older message name when a worker closes the port without replying", () => {
 const app = run();
 app.reply(undefined, {message: "The message port closed before a response was received."});
 assert.deepEqual(app.requests.map(request => request.type), ["quietsplice-skip", "buildooor-skip"]);
 app.tick(2000);
 assert.equal(app.requests.length, 2);
 app.reply({outcome: "transition-observed"});
});

test("backs off after both message names go unanswered", () => {
 const app = run();
 const error = {message: "The message port closed before a response was received."};
 app.reply(undefined, error);
 app.reply(undefined, error);
 app.tick(29000);
 assert.equal(app.requests.length, 2);
 app.tick(1000);
 assert.equal(app.requests.at(-1).type, "quietsplice-skip");
});

test("backs off on runtime message errors instead of repeatedly requesting input",()=>{
 const app=run();app.reply(undefined,{message:"Extension context invalid"});
 app.tick(29000);assert.equal(app.requests.length,1);
 app.tick(1000);assert.equal(app.requests.length,2);
});
