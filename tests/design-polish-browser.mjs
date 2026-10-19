import assert from 'node:assert/strict';
import {expect,chromium} from '@playwright/test';
export async function checkDesignPolish(browser,base){
 const page=await browser.newPage({viewport:{width:1440,height:1000},colorScheme:'light',reducedMotion:'reduce'});
 try{
  await page.goto(base+'?lang=en#/');
  const language=page.getByRole('group',{name:'Language',exact:true});
  await expect(language.getByRole('radio',{name:'English',exact:true})).toBeChecked({timeout:5000});
  const demo=page.getByRole('region',{name:'Binary search demo',exact:true});
  await expect(demo).toBeVisible();
  await expect(demo.getByTestId('demo-step')).toHaveText('1');
  const saved=await page.evaluate(()=>localStorage.getItem('patterns-study-v2'));
  await demo.getByRole('button',{name:'Next demo step',exact:true}).click();
  await expect(demo.getByTestId('demo-step')).toHaveText('2');
  await demo.getByRole('button',{name:'Play demo',exact:true}).click();
  await expect.poll(async()=>Number(await demo.getByTestId('demo-step').textContent())).toBeGreaterThan(2);
  await demo.getByRole('button',{name:'Pause demo',exact:true}).click();
  await demo.getByRole('button',{name:'Reset demo',exact:true}).click();
  await demo.getByRole('button',{name:'Next demo step',exact:true}).click();
  await language.getByRole('radio',{name:'Русский',exact:true}).check();
  await expect(page.getByTestId('demo-step')).toHaveText('2');
  assert.equal(await page.evaluate(()=>localStorage.getItem('patterns-study-v2')),saved,'Demo never awards progress');
  const themes=page.getByRole('group',{name:'Оформление',exact:true});
  await themes.getByRole('radio',{name:'Светлая',exact:true}).focus();
  await page.keyboard.press('ArrowRight');
  await expect(themes.getByRole('radio',{name:'Тёмная',exact:true})).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.reload();
  await expect(page.getByRole('group',{name:'Оформление',exact:true}).getByRole('radio',{name:'Тёмная',exact:true})).toBeChecked();
  for(const locale of ['en','ru'])for(const width of [320,390,635,768,1024,1440]){
   await page.setViewportSize({width,height:900});await page.goto(base+'?lang='+locale+'#/');
   const region=page.getByRole('region',{name:locale==='en'?'Binary search demo':'Демо бинарного поиска',exact:true});
   await expect(region.getByTestId('demo-step')).toHaveText('1');
   const layout=await page.evaluate(()=>({body:document.documentElement.scrollWidth,header:document.querySelector('.topbar').getBoundingClientRect().height,arrayTop:document.querySelector('.demo-array .array-track').getBoundingClientRect().top,playTop:document.querySelector('.demo-play').getBoundingClientRect().top}));
   assert.ok(layout.body<=width+1,`${locale}/${width}: overflow`);
   assert.ok(layout.header<=120,`${locale}/${width}: header should fit two compact rows`);
   assert.ok(layout.playTop<780,`${locale}/${width}: demo playback should be available in the first screen`);
   assert.ok(layout.arrayTop<780,`${locale}/${width}: actual algorithm visible in the first screen`);
   const next=region.getByRole('button',{name:locale==='en'?'Next demo step':'Следующий шаг демо',exact:true});
   for(let i=1;i<17;i++)await next.click();
   await expect(region.getByTestId('demo-result')).toHaveText(locale==='en'?'Insertion index: 1':'Позиция вставки: 1');
   await region.getByRole('button',{name:locale==='en'?'Reset demo':'Сбросить демо',exact:true}).click();
   await expect(region.getByTestId('demo-step')).toHaveText('1');
  }
  await page.route('**/lessons/insertion_index.json',route=>route.fulfill({status:503,body:'Unavailable'}));
  await page.goto(base+'?lang=en#/');
  await expect(page.getByRole('region',{name:'Binary search demo',exact:true}).getByRole('alert')).toBeVisible();
  await page.getByRole('button',{name:'Browse patterns',exact:false}).click();
  await page.getByRole('searchbox').fill('heap');
  await expect(page.getByRole('heading',{name:'Heaps',exact:true})).toBeVisible();
  await page.unroute('**/lessons/insertion_index.json');
 }finally{await page.close();}
}
if(import.meta.url===new URL(process.argv[1],'file:').href){const browser=await chromium.launch({headless:true,...(process.env.CI?{}:{channel:'chrome'})});try{await checkDesignPolish(browser,process.env.LAB_URL||'http://127.0.0.1:4173/algorithms/');}finally{await browser.close();}}
