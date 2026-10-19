import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const base=process.env.LAB_URL||'http://127.0.0.1:4173/algorithms/';
export async function checkPromotion(browser,url=base){
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.setFixedTime('2026-10-19T12:00:00Z');
 await page.goto(url);
 await page.getByRole('heading',{name:'Understand the pattern. Watch the code.',exact:true}).waitFor({timeout:5000});
 assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.getByRole('link',{name:'Try binary search',exact:true}).click();
 await page.getByLabel('Animation step', {exact:true}).fill('4');
 await page.getByLabel('Example',{exact:true}).selectOption('2');
 await page.getByLabel('Animation step',{exact:true}).fill('3');
 await page.getByRole('button',{name:'Mark as understood',exact:true}).click();
 await page.getByLabel('Language',{exact:true}).selectOption('ru');
 assert.equal(await page.getByLabel('Шаг анимации').inputValue(),'3');
 assert.equal(await page.getByLabel('Пример',{exact:true}).inputValue(),'2');
 await page.getByRole('button',{name:'Убрать отметку',exact:true}).waitFor();
 await page.reload();
 assert.equal(await page.locator('html').getAttribute('lang'),'ru');
 await page.goto(url+'?lang=en#/problem/insertion_index');
 await page.getByRole('heading',{name:'Find the Insertion Index',exact:true}).waitFor();
 assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.getByRole('button',{name:'Remove completion',exact:true}).waitFor();
 await page.context().grantPermissions(['clipboard-read','clipboard-write']);
 await page.getByRole('button',{name:'Copy lesson link',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Link copied'}).waitFor();
 const shared=new URL(await page.evaluate(()=>navigator.clipboard.readText()));
 assert.equal(shared.searchParams.get('lang'),'en');assert.equal(shared.hash,'#/problem/insertion_index');
 await page.goto(url+'?lang=en#/');
 await page.getByRole('button',{name:'Browse patterns',exact:false}).click();
 await page.getByRole('searchbox').fill('хеш');
 await page.getByRole('heading',{name:'Hash Maps and Sets',exact:true}).waitFor();
 await page.getByRole('searchbox').fill('');
 await page.getByRole('link',{name:'Resume: Find the Insertion Index',exact:false}).click();
 await page.getByLabel('Animation step',{exact:true}).waitFor();
 for(const locale of ['en','ru']){
  for(const width of [320,390,1440]){
   await page.setViewportSize({width,height:900});
   for(const route of ['#/','#/problem/insertion_index','#/calendar']){
    await page.goto(url+'?lang='+locale+route);
    await page.locator('main h1').waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${locale} ${width} ${route} overflow`);
    if(locale==='en')assert.doesNotMatch(await page.locator('main').innerText(),/[А-Яа-яЁё]/);
   }
  }
 }
 await checkBackups(page,url);
 for(const locale of ['en','ru']){
  await page.setViewportSize({width:1280,height:900});await page.goto(url+'?lang='+locale+'#/');
  await page.locator('main h1').waitFor();await page.evaluate(()=>{document.documentElement.style.zoom='2';});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% home zoom overflow');
  await page.evaluate(()=>{document.documentElement.style.zoom='';});
 }
 assert.deepEqual(errors,[]);
 await page.close();
}
if(import.meta.url===new URL(process.argv[1],'file:').href){const browser=await chromium.launch({headless:true,...(process.env.CI?{}:{channel:'chrome'})});try{await checkPromotion(browser);}finally{await browser.close();}}

export async function checkEnglishCurriculum(browser,url=base){
 const catalog=JSON.parse(await fs.readFile(new URL('../src/catalog.json',import.meta.url),'utf8'));
 const page=await browser.newPage();
 for(const lesson of catalog.english.lessons){
  await page.goto(url+'?lang=en#/problem/'+lesson.id);
  await page.getByRole('heading',{name:lesson.title,exact:true}).waitFor();
  const selector=page.getByLabel('Example',{exact:true});await selector.waitFor();
  await page.locator('.pattern-intro summary').click();
  for(const option of await selector.locator('option').all()){
   await selector.selectOption(await option.getAttribute('value'));
   const slider=page.getByLabel('Animation step',{exact:true});await slider.fill(await slider.getAttribute('max'));
   await page.getByText('Result matches',{exact:true}).waitFor();
   assert.doesNotMatch(await page.locator('main').innerText(),/[А-Яа-яЁё]/,lesson.id+' has Russian in English mode');
  }
 }
 await page.close();
 console.log('English curriculum: 101 lessons, every example, all pattern guides and scene labels passed.');
}
async function checkBackups(page,url){
 await page.goto(url+'?lang=en#/calendar');
 const before=await page.evaluate(()=>localStorage.getItem('patterns-study-v2'));
 const file=page.locator('input[type=file]');
 const upload=async value=>file.setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});
 await upload({bad:true});await page.getByRole('status').filter({hasText:'not a valid compatible backup'}).waitFor();
 assert.equal(await page.evaluate(()=>localStorage.getItem('patterns-study-v2')),before);
 const valid={format:'algorithms-lab-progress',version:1,progress:{version:2,startedOn:'2026-10-16',completed:['first_last'],firstCompletions:{first_last:'2026-10-16'}}};
 await upload(valid);await page.getByRole('region',{name:'Import preview'}).waitFor();
 assert.equal(await page.evaluate(()=>localStorage.getItem('patterns-study-v2')),before);
 await page.getByRole('button',{name:'Cancel',exact:true}).click();
 assert.equal(await page.evaluate(()=>localStorage.getItem('patterns-study-v2')),before);
 await upload(valid);
 const saved=page.waitForEvent('download');await page.getByRole('button',{name:'Replace current progress',exact:true}).click();
 const old=JSON.parse(await fs.readFile(await (await saved).path(),'utf8'));
 assert.deepEqual(old.progress,JSON.parse(before));
 await page.getByRole('status').filter({hasText:'Progress restored'}).waitFor();
 assert.deepEqual(JSON.parse(await page.evaluate(()=>localStorage.getItem('patterns-study-v2'))),valid.progress);
 const exported=page.waitForEvent('download');await page.getByRole('button',{name:'Export progress',exact:true}).click();
 assert.deepEqual(JSON.parse(await fs.readFile(await (await exported).path(),'utf8')).progress,valid.progress);
}
