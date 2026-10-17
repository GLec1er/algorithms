import { expect } from '@playwright/test';
import assert from 'node:assert/strict';

export async function checkPractice(browser, base) {
  const context=await browser.newContext({timezoneId:'Europe/Moscow'});
  try {
    const p=await context.newPage();
    await p.clock.setFixedTime('2026-10-19T09:00:00Z');
    await p.goto(base+'#/problem/insertion_index');
    await p.getByLabel('Шаг анимации').waitFor();
    assert.equal(await p.getByRole('link',{name:'Календарь практики',exact:true}).count(),1,'Calendar navigation is available');
    await p.getByRole('button',{name:'Отметить как разобранное'}).click();
    await p.getByRole('status').filter({hasText:'+100 XP'}).waitFor();
    await p.getByRole('link',{name:'Календарь практики',exact:true}).click();
    await p.getByRole('heading',{name:'Календарь практики',exact:true}).waitFor();
    await expect(p.getByTestId('today-count')).toHaveText('1');
    await expect(p.getByTestId('xp-total')).toHaveText('100');
    await expect(p.locator('[data-date="2026-10-19"]')).toHaveAttribute('data-status','done');
    await p.reload();
    await expect(p.getByTestId('xp-total')).toHaveText('100');
    await p.clock.setFixedTime('2026-10-20T09:00:00Z');
    await p.goto(base+'#/problem/insertion_index');
    await p.getByRole('button',{name:'Убрать отметку'}).click();
    await p.getByRole('button',{name:'Отметить как разобранное'}).click();
    await p.getByRole('link',{name:'Календарь практики',exact:true}).click();
    await expect(p.getByTestId('today-count')).toHaveText('0');
    await expect(p.getByTestId('xp-total')).toHaveText('100');
    await p.goto(base+'#/problem/first_last');
    await p.getByLabel('Шаг анимации').waitFor();
    await p.getByRole('button',{name:'Отметить как разобранное'}).click();
    await p.getByRole('link',{name:'Календарь практики',exact:true}).click();
    await expect(p.getByTestId('today-count')).toHaveText('1');
    await expect(p.getByTestId('xp-total')).toHaveText('200');
    await expect(p.getByTestId('streak-current')).toHaveText('2');
    await p.getByRole('button',{name:'Следующий месяц',exact:true}).click();
    await expect(p.locator('[data-date="2026-11-16"]')).toHaveCount(1);
    await p.getByRole('button',{name:'Текущий месяц',exact:true}).click();
    await expect(p.locator('[data-date="2026-10-19"]')).toHaveCount(1);
    for(const width of [320,390]){
      await p.setViewportSize({width,height:844});
      assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth)<=width+2,'Calendar fits on mobile');
    }
    await p.setViewportSize({width:1440,height:1050});
    await p.screenshot({path:'test-results/calendar.png',fullPage:true,animations:'disabled'});
    const mobile=await context.newPage();
    await mobile.setViewportSize({width:390,height:844});
    await mobile.clock.setFixedTime('2026-10-20T09:00:00Z');
    await mobile.goto(base+'#/calendar');
    await expect(mobile.getByTestId('xp-total')).toHaveText('200');
    await mobile.screenshot({path:'test-results/calendar-mobile.png',fullPage:true,animations:'disabled'});
    await mobile.goto(base+'#/problem/cutting_wood');
    await mobile.getByLabel('Шаг анимации').waitFor();
    await mobile.getByRole('button',{name:'Отметить как разобранное'}).click();
    await expect(p.getByTestId('xp-total')).toHaveText('300');
    await mobile.close();
  } finally {await context.close();}
  await checkReadOnlyStorage(browser,base);
  const legacy=await browser.newContext();
  try {
    await legacy.addInitScript(()=>localStorage.setItem('patterns-progress','["pair_sum_sorted"]'));
    const p=await legacy.newPage();
    await p.goto(base+'#/calendar');
    await p.getByRole('heading',{name:'Календарь практики',exact:true}).waitFor();
    await expect(p.getByTestId('xp-total')).toHaveText('100');
    await expect(p.getByTestId('today-count')).toHaveText('0');
    await expect(p.getByTestId('undated-count')).toHaveText('1');
  } finally {await legacy.close();}
}

async function checkReadOnlyStorage(browser,base) {
  const c=await browser.newContext({timezoneId:'Europe/Moscow'});
  try {
    await c.addInitScript(()=>{
      localStorage.setItem('patterns-study-v2',JSON.stringify({version:2,startedOn:'2026-10-19',completed:['insertion_index'],firstCompletions:{insertion_index:'2026-10-19'}}));
      Storage.prototype.setItem=function(){throw new DOMException('Storage is full','QuotaExceededError');};
    });
    const p=await c.newPage();
    await p.clock.setFixedTime('2026-10-20T09:00:00Z');
    for(const id of ['first_last','cutting_wood']){
      await p.goto(base+'#/problem/'+id);
      await p.getByLabel('Шаг анимации').waitFor();
      await p.getByRole('button',{name:'Отметить как разобранное'}).click();
      await p.getByRole('button',{name:'Убрать отметку'}).waitFor();
    }
    await p.getByRole('link',{name:'Календарь практики',exact:true}).click();
    await expect(p.getByTestId('xp-total')).toHaveText('300');
    await expect(p.getByRole('alert')).toContainText('Хранилище браузера недоступно');
  } finally {await c.close();}
}
