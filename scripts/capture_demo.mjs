/** Capture actual UI states for documentation; requires a running production preview. */
import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const base=process.env.LAB_URL||'http://127.0.0.1:4173/algorithms/';
const browser=await chromium.launch({headless:true,...(process.env.CI?{}:{channel:'chrome'})});
async function waitForPy(page){const image=page.locator('.py-art img');if(await image.count())await image.evaluate(img=>img.decode());}
try{
 await fs.mkdir('docs/media',{recursive:true});await fs.mkdir('test-results/demo-frames',{recursive:true});
 const page=await browser.newPage({viewport:{width:1200,height:800},colorScheme:'dark',reducedMotion:'reduce'});
 await page.goto(base+'?lang=en#/');await page.locator('main h1').waitFor();await page.getByTestId('demo-step').waitFor();
 for(let i=0;i<3;i++)await page.getByRole('button',{name:'Next demo step',exact:true}).click();
 await waitForPy(page);
 await page.screenshot({path:'docs/media/home.png'});
 await page.emulateMedia({colorScheme:'light'});await page.screenshot({path:'test-results/home-light.png'});await page.emulateMedia({colorScheme:'dark'});
 await page.goto(base+'?lang=en#/problem/insertion_index');await page.getByLabel('Animation step',{exact:true}).waitFor();
 await waitForPy(page);
 const top=await page.locator('.workspace-grid').evaluate(el=>el.getBoundingClientRect().top+window.scrollY);
 await page.evaluate(y=>window.scrollTo(0,y-90),top);
 const max=Number(await page.getByLabel('Animation step',{exact:true}).getAttribute('max'));
 for(let step=0;step<=max;step++){
  await page.getByLabel('Animation step',{exact:true}).fill(String(step));
  await page.screenshot({path:`test-results/demo-frames/${String(step).padStart(2,'0')}.png`});
 }
 await page.getByLabel('Animation step',{exact:true}).fill('8');
 await page.screenshot({path:'docs/media/player.png'});
 await page.setViewportSize({width:1200,height:630});
 await page.screenshot({path:'public/social-preview.png'});
 for(const locale of ['en','ru']){
  await page.setViewportSize({width:390,height:844});await page.goto(base+'?lang='+locale+'#/');await page.locator('main h1').waitFor();await page.getByTestId('demo-step').waitFor();await page.screenshot({path:`test-results/home-mobile-${locale}.png`,fullPage:true});
  await page.goto(base+'?lang='+locale+'#/calendar');await page.locator('main h1').waitFor();await page.screenshot({path:`test-results/calendar-mobile-${locale}.png`,fullPage:true});
 }
 console.log('Captured real home/player/social previews, every binary-search frame, and EN/RU mobile screens.');
}finally{await browser.close();}
