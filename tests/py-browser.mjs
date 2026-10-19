import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';
import {pathToFileURL} from 'node:url';

const art=page=>page.locator('.py-art');
async function appearance(page){await page.getByRole('button',{name:'Appearance options',exact:true}).click();}

export async function checkPy(browser,base){
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 await context.addInitScript(()=>{
  window.__pyDraws=0;
  const original=WebGLRenderingContext.prototype.drawArrays;
  WebGLRenderingContext.prototype.drawArrays=function(...args){window.__pyDraws++;return original.apply(this,args);};
 });
 try{
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'?lang=en#/');
  await expect(page.getByRole('img',{name:'Py, robot python',exact:true})).toBeVisible();
  await expect(art(page)).toHaveAttribute('data-renderer','mesh',{timeout:10000});
  await expect.poll(()=>page.evaluate(()=>window.__pyDraws)).toBeGreaterThan(3);
  await page.locator('.home-note').scrollIntoViewIfNeeded();
  await expect(art(page)).toHaveAttribute('data-motion-running','false');
  const offscreen=await page.evaluate(()=>window.__pyDraws);await page.waitForTimeout(180);
  assert.equal(await page.evaluate(()=>window.__pyDraws),offscreen,'Offscreen characters stop drawing');
  await art(page).scrollIntoViewIfNeeded();
  await expect.poll(()=>page.evaluate(()=>window.__pyDraws)).toBeGreaterThan(offscreen);
  const saved=await page.evaluate(()=>localStorage.getItem('patterns-study-v2'));
  const demo=page.getByRole('region',{name:'Binary search demo',exact:true});
  await demo.getByRole('button',{name:'Play demo',exact:true}).click();
  await demo.getByRole('button',{name:'Pause demo',exact:true}).click();
  await expect(art(page)).toHaveAttribute('data-motion-running','false',{timeout:5000});
  const stopped=await page.evaluate(()=>window.__pyDraws);
  await page.waitForTimeout(180);
  assert.equal(await page.evaluate(()=>window.__pyDraws),stopped,'A settled pause stops WebGL draws');
  await demo.getByRole('button',{name:'Next demo step',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>window.__pyDraws)).toBeGreaterThan(stopped);
  await expect(art(page)).toHaveAttribute('data-motion-running','false',{timeout:5000});
  assert.equal(await page.evaluate(()=>localStorage.getItem('patterns-study-v2')),saved);

  await appearance(page);
  await page.getByRole('checkbox',{name:'Animate Py',exact:true}).uncheck();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Appearance options',exact:true})).toBeFocused();
  await page.reload();
  await expect(art(page)).toHaveAttribute('data-renderer','static');
  await appearance(page);
  await expect(page.getByRole('checkbox',{name:'Animate Py',exact:true})).not.toBeChecked();
  await page.getByRole('checkbox',{name:'Show Py',exact:true}).uncheck();
  await page.keyboard.press('Escape');
  await expect(art(page)).toHaveCount(0);
  await page.reload();await expect(art(page)).toHaveCount(0);
  await appearance(page);await page.getByRole('checkbox',{name:'Show Py',exact:true}).check();
  await page.getByRole('checkbox',{name:'Animate Py',exact:true}).check();await page.keyboard.press('Escape');
  await expect(art(page)).toHaveAttribute('data-renderer','mesh',{timeout:10000});
  await page.getByRole('button',{name:'Hide Py',exact:true}).click();await expect(art(page)).toHaveCount(0);
  await appearance(page);await page.getByRole('checkbox',{name:'Show Py',exact:true}).check();await page.keyboard.press('Escape');
  await page.goto(base+'?lang=en#/problem/insertion_index');
  await page.getByLabel('Animation step',{exact:true}).waitFor();
  await expect(art(page)).toHaveAttribute('data-motion-running','false');
  await page.getByLabel('Animation step',{exact:true}).fill('4');
  await expect(art(page)).toHaveAttribute('data-renderer','mesh',{timeout:10000});
  await expect(art(page)).toHaveAttribute('data-motion-running','false',{timeout:5000});
  await page.getByLabel('Animation step',{exact:true}).fill(await page.getByLabel('Animation step',{exact:true}).getAttribute('max'));
  await expect(art(page)).toHaveAttribute('data-mode','complete');
  await expect(page.getByRole('button',{name:'Mark as understood',exact:true})).toBeVisible();
  await page.goto(base+'?lang=en#/calendar');await expect(art(page)).toHaveCount(0);
  await page.goto(base+'?lang=en#/');await expect(art(page)).toHaveAttribute('data-renderer','mesh',{timeout:10000});
  const glLost=await page.locator('.py-art canvas').evaluate(canvas=>{const gl=canvas.getContext('webgl');const extension=gl?.getExtension('WEBGL_lose_context');if(extension){extension.loseContext();return true;}return false;});
  assert.ok(glLost,'The browser must expose context loss for this recovery check');
  await expect(art(page)).toHaveAttribute('data-renderer','static');
  await expect(page.locator('.py-art img')).toBeVisible();
  await demo.getByRole('button',{name:'Next demo step',exact:true}).click();
  await expect(demo.getByTestId('demo-step')).toHaveText('2');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}

 const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 try{
  const page=await reduced.newPage();await page.goto(base+'?lang=ru#/');
  await expect(art(page)).toHaveAttribute('data-renderer','static');
  await expect(page.locator('.py-art img')).toBeVisible();
  assert.equal(await page.locator('.py-art canvas').count(),0,'Reduced motion does not allocate a WebGL canvas');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }finally{await reduced.close();}

 const unavailable=await browser.newContext({reducedMotion:'no-preference'});
 await unavailable.addInitScript(()=>{
  const get=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'||type==='webgl2'?null:get.call(this,type,...args);};
  Storage.prototype.getItem=function(){throw new DOMException('Denied','SecurityError');};
  Storage.prototype.setItem=function(){throw new DOMException('Denied','SecurityError');};
 });
 try{
  const page=await unavailable.newPage();await page.goto(base+'?lang=en#/');
  await expect(page.locator('.py-art img')).toBeVisible();
  await expect(art(page)).toHaveAttribute('data-renderer','static');
  await page.getByRole('button',{name:'Hide Py',exact:true}).click();
  await expect(art(page)).toHaveCount(0);await appearance(page);
  await page.getByRole('checkbox',{name:'Show Py',exact:true}).check();await page.keyboard.press('Escape');
  await expect(page.locator('.py-art img')).toBeVisible();
 }finally{await unavailable.close();}

 const delayed=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 try{
  const page=await delayed.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  let held;
  await page.route('**/assets/renderer-*.js',route=>{held=route;});
  await page.goto(base+'?lang=en#/',{waitUntil:'domcontentloaded'});
  await expect.poll(()=>Boolean(held),{timeout:10000}).toBe(true);
  await page.getByRole('link',{name:'Practice calendar',exact:true}).click();
  await expect(art(page)).toHaveCount(0);
  await held.continue();await page.waitForLoadState('networkidle');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByTestId('xp-total')).toBeVisible();assert.deepEqual(errors,[],'A late graphics import cannot revive an unmounted character');
 }finally{await delayed.close();}
 console.log('Py: motion/settling, manual steps, hide/restore, preferences, reduced motion, context loss, unavailable graphics, storage denial, and routing passed.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader'],...(process.env.CI?{}:{channel:'chrome'})});
 try{await checkPy(browser,process.env.LAB_URL||'http://127.0.0.1:4187/algorithms/');}finally{await browser.close();}
}
