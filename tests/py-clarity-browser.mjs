import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';
import {pathToFileURL} from 'node:url';
import {selectTheme} from './ui-controls.mjs';
import fs from 'node:fs/promises';

// Catches low-resolution Retina rendering, hidden heading companions and distorted completion marks.
export async function checkPyClarity(browser,base){
 const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:2,reducedMotion:'no-preference'});
 const failures=[];
 try{
  const page=await context.newPage();
  await page.goto(base+'?lang=en#/problem/insertion_index');
  await expect(page.locator('.py-art')).toHaveAttribute('data-renderer','mesh',{timeout:10000});
  await expect(page.locator('.py-art')).toHaveAttribute('data-motion-running','false');
  const rendered=await page.locator('.py-art').evaluate(el=>{
   const r=el.getBoundingClientRect(),canvas=el.querySelector('canvas'),workspace=document.querySelector('.workspace-grid').getBoundingClientRect();
   return {width:r.width,bottom:r.bottom,workspaceTop:workspace.top,pixels:canvas.width,required:r.width*devicePixelRatio};
  });
  if(rendered.pixels<rendered.required-1)failures.push('Canvas undersamples the Retina display');
  if(rendered.width<180||rendered.bottom>rendered.workspaceTop)failures.push('Lesson Py must be visible at a readable size above the workspace');
  if(process.env.CAPTURE_PY){
   await fs.mkdir('test-results',{recursive:true});
   await page.screenshot({path:'test-results/py-lesson.png'});
   await page.getByRole('button',{name:'Play',exact:true}).click();
   await page.locator('.py-art').scrollIntoViewIfNeeded();
   await expect(page.locator('.py-art')).toHaveAttribute('data-motion-running','true');
   await page.locator('.py-art').screenshot({path:'test-results/py-motion-detail.png'});
   await page.getByRole('button',{name:'Pause',exact:true}).click();
   await page.locator('.py-art').scrollIntoViewIfNeeded();
   await page.getByRole('button',{name:'Appearance options',exact:true}).click();
   await page.getByRole('checkbox',{name:'Animate Py',exact:true}).uncheck();await page.keyboard.press('Escape');await page.reload();
   await expect(page.locator('.py-art')).toHaveAttribute('data-renderer','static');
   await page.locator('.py-art img').evaluate(img=>img.decode());
   await page.locator('.py-art').screenshot({path:'test-results/py-static-detail.png'});
   await page.getByRole('button',{name:'Appearance options',exact:true}).click();
   await page.getByRole('checkbox',{name:'Animate Py',exact:true}).check();await page.keyboard.press('Escape');
   await expect(page.locator('.py-art')).toHaveAttribute('data-renderer','mesh');
  }
  await page.setViewportSize({width:390,height:844});
  await expect.poll(()=>page.locator('.py-art').evaluate(el=>{const w=el.getBoundingClientRect().width,p=el.querySelector('canvas').width;return p>=w*2-1&&p<=w*4+1;})).toBe(true);
  assert.equal(await page.locator('.py-art canvas').evaluate(el=>el.getContext('webgl').getError()),0,'Resizing keeps the transparent texture valid');
  await page.setViewportSize({width:1440,height:1000});
  await page.getByRole('button',{name:'Mark as understood',exact:true}).click();
  await page.goto(base+'?lang=en#/problem/insertion_index');
  await page.getByRole('button',{name:'Open catalog',exact:true}).click();
  await page.getByRole('textbox',{name:'Search problems',exact:true}).focus();
  const library=await page.evaluate(()=>{
   const mark=document.querySelector('.selected .problem-dot.checked'),input=document.querySelector('.search-box input'),box=input.parentElement;
   const r=mark.getBoundingClientRect(),style=getComputedStyle(input),parent=getComputedStyle(box);
   return {width:r.width,height:r.height,hasCheck:!!mark.querySelector('svg'),inputOutline:style.outlineStyle,boxOutline:parent.outlineStyle,boxShadow:parent.boxShadow};
  });
  if(Math.abs(library.width-library.height)>1||!library.hasCheck)failures.push('Completion mark must be a square, legible check');
  if(library.inputOutline!=='none'||library.boxOutline==='none'&&library.boxShadow==='none')failures.push('Search focus ring must surround the complete field');
  await page.keyboard.press('Escape');
  for(const theme of ['light','dark']){
   await selectTheme(page,theme);
   await page.getByRole('button',{name:'Open catalog',exact:true}).click();
   const colors=await page.locator('.selected .problem-dot.checked').evaluate(el=>({fg:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor}));
   if(process.env.CAPTURE_PY){await page.getByRole('textbox',{name:'Search problems',exact:true}).focus();await page.screenshot({path:`test-results/py-library-${theme}.png`});}
   const luminance=c=>c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
   const fg=luminance(colors.fg),bg=luminance(colors.bg);
   if((Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05)<4.5)failures.push(theme+' completion check lacks contrast');
   await page.keyboard.press('Escape');
  }
  await page.goto(base+'?lang=en#/calendar');
  if(await page.locator('.py-art').count()!==1)failures.push('Calendar must have a visible companion');
  else{
   await expect(page.locator('.py-art')).toHaveAttribute('data-mode','complete');
   const size=await page.locator('.py-art').boundingBox();
   if(size.width<180)failures.push('Calendar Py must be readable');
   if(process.env.CAPTURE_PY)await page.screenshot({path:'test-results/py-calendar.png'});
  }
  assert.deepEqual(failures,[]);
 }finally{await context.close();}
 const retina=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,reducedMotion:'no-preference'});
 try{
  const page=await retina.newPage();await page.goto(base+'?lang=en#/calendar');
  await expect(page.locator('.py-art')).toHaveAttribute('data-renderer','mesh',{timeout:10000});
  assert.ok(await page.locator('.py-art').evaluate(el=>el.querySelector('canvas').width>=el.getBoundingClientRect().width*3-1),'3x displays retain physical-pixel resolution');
 }finally{await retina.close();}
 const responsive=await browser.newContext({reducedMotion:'reduce'});
 try{
  const page=await responsive.newPage();
  for(const locale of ['en','ru'])for(const width of [320,390,635,768,1440])for(const route of ['problem/uniform_substring','calendar']){
   await page.setViewportSize({width,height:900});await page.goto(base+'?lang='+locale+'#/'+route);
   await expect(page.locator('.py-art img')).toBeVisible();
   const layout=await page.evaluate(()=>{
    const py=document.querySelector('.py-art').getBoundingClientRect(),title=document.querySelector('h1').getBoundingClientRect();
    return {overflow:document.documentElement.scrollWidth>innerWidth+1,width:py.width,overlap:py.left<title.right&&py.right>title.left&&py.top<title.bottom&&py.bottom>title.top};
   });
   assert.ok(!layout.overflow&&!layout.overlap&&layout.width>=100,`${locale}/${width}/${route}: readable companion without obscuring text or overflowing`);
   await page.getByRole('button',{name:locale==='en'?'Hide Py':'Скрыть Py',exact:true}).click();
   const intro=await page.locator('.companion-intro').evaluate(el=>({columns:getComputedStyle(el).gridTemplateColumns.split(' ').length,width:el.firstElementChild.getBoundingClientRect().width,available:el.getBoundingClientRect().width}));
   assert.equal(intro.columns,1,'Hiding Py removes its reserved column');
   await page.getByRole('button',{name:locale==='en'?'Appearance options':'Настройки оформления',exact:true}).click();
   await page.getByRole('checkbox',{name:locale==='en'?'Show Py':'Показывать Py',exact:true}).check();await page.keyboard.press('Escape');
  }
 }finally{await responsive.close();}
 console.log('Py clarity: Retina canvas, prominent lesson/calendar placement, square completion mark and contained search focus passed.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader'],...(process.env.CI?{}:{channel:'chrome'})});
 try{await checkPyClarity(browser,process.env.LAB_URL||'http://127.0.0.1:4187/algorithms/');}finally{await browser.close();}
}
