import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import {selectTheme,openAppearance} from './ui-controls.mjs';
import { pathToFileURL } from 'node:url';

// Catches lost theme selection, missing OS updates, progress writes and storage-denial crashes.
export async function checkDesign(browser, base) {
  const context=await browser.newContext({colorScheme:'light'});
  try {
    const page=await context.newPage();
    await page.goto(base+'#/problem/insertion_index');
    await page.getByLabel('Шаг анимации').waitFor();
    await expect(page.locator('html')).toHaveAttribute('data-theme','light');
    const progress=await page.evaluate(()=>localStorage.getItem('patterns-study-v2'));
    const light=await page.evaluate(()=>getComputedStyle(document.body).backgroundColor);
    await selectTheme(page,'dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
    assert.notEqual(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),light);
    assert.equal(await page.evaluate(()=>localStorage.getItem('patterns-study-v2')),progress);
    await page.reload();
    await openAppearance(page);
    await expect(page.getByRole('group',{name:'Оформление',exact:true}).getByRole('radio',{name:'Тёмная',exact:true})).toBeChecked();
    await page.keyboard.press('Escape');
    await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
    await selectTheme(page,'system');
    await page.emulateMedia({colorScheme:'dark'});
    await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
    await page.emulateMedia({colorScheme:'light'});
    await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  } finally {await context.close();}
  await checkCatalog(browser,base);
  const denied=await browser.newContext({colorScheme:'dark'});
  try {
    await denied.addInitScript(()=>{Storage.prototype.getItem=function(){throw new DOMException('Denied','SecurityError');};Storage.prototype.setItem=function(){throw new DOMException('Denied','SecurityError');};});
    const page=await denied.newPage();
    await page.goto(base+'#/calendar');
    await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
    await selectTheme(page,'light');
    await expect(page.locator('html')).toHaveAttribute('data-theme','light');
    await expect(page.getByRole('alert')).toContainText('Хранилище браузера недоступно');
  } finally {await denied.close();}
  await checkResponsive(browser,base);
  await checkLessonFailure(browser,base);
  await checkSceneContrast(browser,base);
}

export async function checkSceneContrast(browser,base) {
  const luminance=color=>color.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>{const c=n/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
  const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  const failures=[];
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  try {
    const page=await context.newPage();
    for(const theme of ['light','dark']){
      await page.goto(base+'#/problem/merge_intervals');
      await selectTheme(page,theme);
      await page.getByLabel('Шаг анимации').waitFor();
      await page.getByLabel('Шаг анимации').fill('9');
      await expect(page.getByTestId('step')).toHaveText('10');
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const samples=await page.locator('.interval').evaluateAll(groups=>groups.flatMap(group=>{
        const texts=group.querySelectorAll('text');
        return [{text:texts[0].textContent,fg:getComputedStyle(texts[0]).fill,bg:getComputedStyle(group.closest('.canvas')).backgroundColor},{text:texts[1].textContent,fg:getComputedStyle(texts[1]).fill,bg:getComputedStyle(group.querySelector('rect')).fill}];
      }));
      assert.ok(samples.length>0);
      await page.goto(base+'#/problem/bipartite');
      await page.getByLabel('Шаг анимации').waitFor();
      await page.getByLabel('Шаг анимации').fill('8');
      await expect(page.getByTestId('step')).toHaveText('9');
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const nodes=await page.locator('.node-group.focused.seen-node').evaluateAll(groups=>groups.map(group=>({text:'graph '+group.querySelector('.node-value').textContent,fg:getComputedStyle(group.querySelector('.node-value')).fill,bg:getComputedStyle(group.querySelector('circle')).fill})));
      assert.ok(nodes.length>0);
      samples.push(...nodes);
      await page.goto(base+'#/problem/n_queens');
      await page.getByLabel('Шаг анимации').waitFor();
      await page.getByLabel('Шаг анимации').fill('8');
      await expect(page.getByTestId('step')).toHaveText('9');
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const queens=await page.locator('.queen-board>.considering').evaluateAll(cells=>cells.map(cell=>({text:'queen '+cell.textContent,fg:getComputedStyle(cell.querySelector('small')||cell).color,bg:getComputedStyle(cell).backgroundColor})));
      assert.ok(queens.some(cell=>cell.text.includes('♛')));
      samples.push(...queens);
      for(const entry of samples){
        const ratio=contrast(entry.fg,entry.bg);
        if(ratio<4.5)failures.push(`${theme}: ${entry.text} contrast ${ratio.toFixed(2)}`);
      }
    }
    assert.deepEqual(failures,[],'Scene labels must remain readable when active and result states overlap');
  } finally {await context.close();}
}

async function checkLessonFailure(browser,base) {
  const context=await browser.newContext();
  try {
    const page=await context.newPage();
    await page.route('**/lessons/insertion_index.json',route=>route.fulfill({status:503,body:'Unavailable'}));
    await page.goto(base+'#/problem/insertion_index');
    await expect(page.getByRole('alert')).toContainText('Не удалось загрузить занятие');
    await page.locator('.pattern-intro summary').click({timeout:4000});
    await expect(page.getByRole('heading',{name:'Мини-разбор',exact:true})).toBeVisible();
    await page.unroute('**/lessons/insertion_index.json');
    await page.getByRole('button',{name:'Повторить загрузку',exact:true}).click();
    await page.getByLabel('Шаг анимации').waitFor();
    await expect(page.getByRole('alert')).not.toBeVisible();
  } finally {await context.close();}
}

async function checkResponsive(browser,base) {
  const context=await browser.newContext({reducedMotion:'reduce'});
  try {
    const page=await context.newPage();
    for(const theme of ['light','dark']){
      await page.goto(base+'#/problem/insertion_index');
      await selectTheme(page,theme);
      for(const width of [320,390,768,1024,1440]){
        await page.setViewportSize({width,height:1000});
        for(const route of ['#/problem/insertion_index','#/calendar']){
          await page.goto(base+route);
          if(route.includes('problem'))await page.getByLabel('Шаг анимации').waitFor();
          else await page.getByTestId('xp-total').waitFor();
          const layout=await page.evaluate(()=>{
            const topbar=document.querySelector('.topbar'),player=document.querySelector('.transport');
            return {body:document.documentElement.scrollWidth,topbar:topbar.scrollWidth,topbarWidth:topbar.clientWidth,player:player?.scrollWidth,playerWidth:player?.clientWidth};
          });
          assert.ok(layout.body<=width+2,`${theme}/${width}/${route}: page overflow`);
          assert.ok(layout.topbar<=layout.topbarWidth+2,`${theme}/${width}: header overflow`);
          if(layout.player)assert.ok(layout.player<=layout.playerWidth+2,`${theme}/${width}: player overflow`);
          await page.getByRole('button',{name:'Открыть каталог',exact:true}).click();
          const dialog=page.getByRole('dialog',{name:'Каталог задач',exact:true});
          await expect(dialog).toBeVisible();
          assert.ok(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+2),`${theme}/${width}: catalogue overflow`);
          await page.keyboard.press('Escape');
          await expect(page.getByRole('button',{name:'Открыть каталог',exact:true})).toBeFocused();
        }
      }
    }
  } finally {await context.close();}
}

async function checkCatalog(browser,base) {
  const context=await browser.newContext();
  try {
    const page=await context.newPage();
    await page.goto(base+'#/problem/insertion_index');
    await page.getByLabel('Шаг анимации').waitFor();
    const open=page.getByRole('button',{name:'Открыть каталог',exact:true});
    const dialog=page.getByRole('dialog',{name:'Каталог задач',exact:true});
    await expect(dialog).not.toBeVisible();
    await open.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('step')).toHaveText('1');
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(open).toBeFocused();
    await open.click();
    await page.getByLabel('Поиск задач',{exact:true}).fill('интервал');
    await page.getByLabel('Сложность',{exact:true}).selectOption('Medium');
    assert.ok(await dialog.getByTestId('lesson-link').count()>0);
    const target=dialog.getByTestId('lesson-link').first();
    const href=await target.getAttribute('href');
    await target.click();
    await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$'));
    await expect(dialog).not.toBeVisible();
    await open.click();
    await expect(page.getByLabel('Поиск задач',{exact:true})).toHaveValue('интервал');
    await page.getByLabel('Поиск задач',{exact:true}).fill('неттакойзадачи');
    await page.getByRole('button',{name:'Сбросить фильтры',exact:true}).click();
    await expect(page.getByLabel('Поиск задач',{exact:true})).toHaveValue('');
    await expect(page.getByLabel('Сложность',{exact:true})).toHaveValue('all');
    await page.getByRole('button',{name:'Закрыть каталог',exact:true}).click();
    await expect(open).toBeFocused();
  } finally {await context.close();}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const browser=await chromium.launch({headless:true,...(process.env.CI?{}:{channel:'chrome'})});
  try {await checkDesign(browser,process.env.LAB_URL||'http://127.0.0.1:4173/algorithms/');console.log('Design browser checks passed.');}
  finally {await browser.close();}
}
