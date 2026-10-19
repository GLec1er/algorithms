import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { checkPractice } from './practice-browser.mjs';
import {checkPromotion,checkEnglishCurriculum} from './promotion-browser.mjs';
import { checkDesign } from './design-browser.mjs';

const base = process.env.LAB_URL || 'http://127.0.0.1:4173/algorithms/';
const russianBase=base+'?lang=ru';
const browser = await chromium.launch({ headless:true, ...(process.env.CI ? {} : {channel:'chrome'}) });
const page = await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];
page.on('pageerror', error=>errors.push(error.message));
try {
  fs.mkdirSync('test-results',{recursive:true});
  await checkPromotion(browser,base);
  await checkEnglishCurriculum(browser,base);
  await checkDesign(browser,russianBase);
  await checkPractice(browser,russianBase);
  await page.goto(russianBase+'#/problem/lcs');
  await page.getByLabel('Шаг анимации').waitFor();
  await page.getByLabel('Шаг анимации').fill(await page.getByLabel('Шаг анимации').getAttribute('max'));
  assert.equal(await page.locator('.matrix-cell.infected').count(),0,'DP value 2 must not be marked as an infected cell');
  await page.goto(russianBase+'#/problem/insertion_index');
  await page.getByRole('heading',{name:'Позиция вставки',exact:true}).waitFor();
  await page.getByRole('button',{name:'Следующий шаг',exact:true}).click();
  assert.equal(await page.locator('[data-testid="step"]').textContent(),'2');
  await page.getByRole('button',{name:'Предыдущий шаг',exact:true}).click();
  assert.equal(await page.locator('[data-testid="step"]').textContent(),'1');
  await page.getByRole('button',{name:'Следующий шаг',exact:true}).click();
  await page.getByRole('button',{name:'В начало',exact:true}).click();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('[data-testid="step"]').textContent(),'2', 'Keyboard stepping remains available after transport clicks');
  await page.getByRole('button',{name:'Воспроизвести',exact:true}).click();
  await page.getByLabel('Пример').selectOption('1');
  assert.equal(await page.locator('[data-testid="step"]').textContent(),'1');
  await page.getByRole('button',{name:'Воспроизвести',exact:true}).waitFor();
  const slider = page.getByLabel('Шаг анимации');
  await slider.fill(await slider.getAttribute('max'));
  await page.getByText('Результат совпадает', {exact:true}).waitFor();
  await page.getByRole('button',{name:'Отметить как разобранное'}).click();
  await page.reload();
  await page.getByRole('button',{name:'Убрать отметку'}).waitFor();
  await page.getByRole('button',{name:'Открыть каталог',exact:true}).click();
  await page.getByPlaceholder('Найти задачу или паттерн').fill('интервал');
  assert.ok(await page.locator('[data-testid="lesson-link"]').count() > 0);
  await page.getByPlaceholder('Найти задачу или паттерн').fill('неттакойзадачи');
  await page.getByText('Ничего не найдено').waitFor();
  await page.getByRole('button',{name:'Закрыть каталог',exact:true}).click();
  await page.goto(russianBase+'#/problem/unknown');
  await page.getByText('Задача не найдена').waitFor();
  await page.getByRole('link',{name:'К первой задаче'}).click();
  await page.getByRole('heading',{name:'Сумма пары: отсортированный массив',exact:true}).waitFor();
  const catalog=JSON.parse(fs.readFileSync(new URL('../src/catalog.json',import.meta.url)));
  for(const lesson of catalog.lessons){
    await page.goto(russianBase+'#/problem/'+lesson.id);
    await page.getByRole('heading',{name:lesson.ru,exact:true}).waitFor();
    await page.getByLabel('Шаг анимации').waitFor();
    const options=await page.getByLabel('Пример').locator('option').count();
    assert.ok(options>=4,lesson.id+' has varied examples');
    if(catalog.lessons.find(l=>l.chapter===lesson.chapter).id===lesson.id){
      await page.locator('.pattern-intro summary').click();
      await page.getByRole('heading',{name:'Мини-разбор',exact:true}).waitFor();
      assert.ok((await page.locator('.guide-example li').count())>=3);
    }
    for(const example of Array.from({length:options},(_,i)=>String(i))){
      await page.getByLabel('Пример').selectOption(example);
      await page.getByLabel('Шаг анимации').fill(await page.getByLabel('Шаг анимации').getAttribute('max'));
      await page.getByText('Результат совпадает',{exact:true}).waitFor();
    }
  }
  await page.goto(russianBase+'#/problem/insertion_index');
  await page.getByLabel('Шаг анимации').waitFor();
  await page.getByRole('button',{name:'Открыть каталог',exact:true}).click();
  await page.getByPlaceholder('Найти задачу или паттерн').fill('');
  await page.getByRole('button',{name:'Закрыть каталог',exact:true}).click();
  await page.getByLabel('Шаг анимации').fill('3');
  await page.getByRole('heading',{name:'Позиция вставки',exact:true}).click();
  await page.evaluate(()=>window.scrollTo(0,0));
  fs.mkdirSync('test-results',{recursive:true});
  await page.screenshot({path:'test-results/desktop.png',fullPage:true});
  const scenes=['pair_sum_sorted','pair_sum_unsorted','linked_reversal','happy_number','unique_substring','insertion_index','valid_parentheses','stream_median','merge_intervals','product_except','invert_tree','design_trie','shortest_path','permutations','lcs','gas_stations','sort_array','swap_bits','collinear_points','triangle_numbers','josephus','matrix_infection','n_queens'];
  for(const id of scenes){
    await page.goto(russianBase+'#/problem/'+id);
    await page.getByLabel('Шаг анимации').waitFor();
    const max=Number(await page.getByLabel('Шаг анимации').getAttribute('max'));
    await page.getByLabel('Шаг анимации').fill(String(Math.floor(max*.65)));
    await page.locator('.visual-panel').screenshot({path:`test-results/scene-${id}.png`,animations:'disabled'});
  }
  for(const width of [320,390]){
    await page.setViewportSize({width,height:844});
    for(const id of scenes){
      await page.goto(russianBase+'#/problem/'+id);
      await page.getByLabel('Шаг анимации').waitFor();
      const layout=await page.evaluate(()=>{
        const transport=document.querySelector('.transport');
        return {body:document.documentElement.scrollWidth,transport:transport.scrollWidth,controls:transport.clientWidth};
      });
      assert.ok(layout.body<=width+2,`Horizontal page overflow: ${id} at ${width}: ${layout.body}`);
      assert.ok(layout.transport<=layout.controls+2,`Transport overflow: ${id} at ${width}`);
      await page.locator('.pattern-intro summary').click();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth)<=width+2,`Expanded guide overflow: ${id} at ${width}`);
    }
  }
  await page.screenshot({path:'test-results/mobile.png',fullPage:true});
  const isolated=await browser.newContext();
  await isolated.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage disabled','SecurityError');}}));
  const noStorage=await isolated.newPage();
  await noStorage.goto(russianBase+'#/problem/insertion_index');
  await noStorage.getByLabel('Шаг анимации').waitFor();
  await noStorage.getByRole('button',{name:'Отметить как разобранное'}).click();
  await noStorage.getByRole('button',{name:'Убрать отметку'}).waitFor();
  await noStorage.goto(russianBase+'#/problem/%E0%A4%A');
  await noStorage.getByText('Задача не найдена').waitFor();
  await isolated.close();
  assert.deepEqual(errors,[]);
  console.log('Browser checks passed: player and keyboard, storage and storage denial, search, invalid routes, 101 lessons × all examples, calendar and rewards, 23 scenes at desktop, 320 px and 390 px.');
} finally { await browser.close(); }
