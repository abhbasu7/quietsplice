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
 vm.runInNewContext(source,{chrome:{runtime},performance:{now:()=>now},console:{info(){}},
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
test("backs off on runtime message errors instead of repeatedly requesting input",()=>{
 const app=run();app.reply(undefined,{message:"Extension context invalid"});
 app.tick(29000);assert.equal(app.requests.length,1);
 app.tick(1000);assert.equal(app.requests.length,2);
});
