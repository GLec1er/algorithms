import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export async function checkRunner(browser,base,allReferences=false) {
  const production=process.env.RUNNER_PRODUCTION==='true';
  const asset=production?fs.readdirSync('dist/assets').find(name=>/^python\.worker-.*\.js$/.test(name)):null;
  if(production)assert.ok(asset,'Built Python worker must be present');
  const workerUrl=production?new URL('assets/'+asset,base).href:new URL('src/runtime/python.worker.ts?worker_file&type=module',base).href;
  const lessons=allReferences?JSON.parse(fs.readFileSync('src/catalog.json','utf8')).lessons.map(lesson=>lesson.id):[];
  const page=await browser.newPage();
  try {
    await page.goto(base);
    const report=await page.evaluate(async({workerUrl,lessons,base})=>{
      const worker=new Worker(workerUrl,{type:'module'});let nextId=0;
      function request(data){return new Promise((resolve,reject)=>{
        const id=++nextId;let timer=setTimeout(()=>reject(new Error('Runtime initialization timeout')),60000);
        const receive=event=>{
          if(event.data.id!==id)return;
          if(event.data.status){if(event.data.status==='running'){clearTimeout(timer);timer=setTimeout(()=>reject(new Error('Runtime execution timeout')),10000);}return;}
          clearTimeout(timer);worker.removeEventListener('message',receive);
          if(event.data.failure)reject(new Error(event.data.failure));else resolve(event.data.result);
        };
        worker.addEventListener('message',receive);worker.postMessage({id,...data});
      });}
      try {
        const own=await request({code:'def insertion_index(a, target):\n    position = 0\n    for number in a:\n        if number >= target:\n            return position\n        position += 1\n    return position\n',lessonId:'insertion_index',args:{a:[1,3,5,6],target:2},expected:1});
        const failures=[];let total=0;
        for(const id of lessons){
          const payload=await (await fetch(base+'lessons/'+id+'.json')).json();
          for(const example of payload.examples){
            const result=await request({code:payload.code,lessonId:id,args:example.args,expected:example.expected});total++;
            if(!result.passed||result.error)failures.push({id,example:example.label,error:result.error,result:result.result});
          }
        }
        const invalid=await request({code:'def solve(:',lessonId:'solve',args:{},expected:1});
        const failure=await request({code:'def solve():\n    seen = [1]\n    return 1 / 0\n',lessonId:'solve',args:{},expected:1});
        const infinite=await request({code:'def solve():\n    while True:\n        pass\n',lessonId:'solve',args:{},expected:1});
        return {own:{passed:own.passed,renamed:own.frames.some(frame=>frame.state.position===1)},total,failures,invalid:invalid.error,failure:{error:failure.error,partial:failure.frames.length,done:failure.frames.some(frame=>frame.done)},infinite:infinite.error};
      }finally{worker.terminate();}
    },{workerUrl,lessons,base});
    assert.equal(report.own.passed,true);assert.equal(report.own.renamed,true);
    assert.equal(report.invalid.type,'SyntaxError');assert.equal(report.failure.error.type,'ZeroDivisionError');assert.equal(report.failure.error.line,3);assert.ok(report.failure.partial>0);assert.equal(report.failure.done,false);
    assert.equal(report.infinite.type,'TraceLimitError');assert.deepEqual(report.failures,[]);
    if(allReferences)assert.equal(report.total,404);
    console.log(`Real Pyodide: custom code, syntax/runtime errors, partial traces, loop limit and ${report.total} reference examples passed.`);
  }finally{await page.close();}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const b=await chromium.launch({headless:true,...(process.env.CI?{}:{channel:'chrome'})});try{await checkRunner(b,process.env.LAB_URL||'http://127.0.0.1:4173/algorithms/',process.argv.includes('--all'));}finally{await b.close();}}
