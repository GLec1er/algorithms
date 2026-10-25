import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

export async function checkStudyUI(browser,base){
  const context=await browser.newContext({viewport:{width:1280,height:720},colorScheme:'light'});
  try{
    const page=await context.newPage();
    await page.goto(base+'?lang=en#/problem/insertion_index');
    const slider=page.getByLabel('Animation step',{exact:true});
    await slider.waitFor();
    for(const [example,index]of [['0',1],['1',4],['2',0],['3',1]]){
      await page.getByLabel('Example',{exact:true}).selectOption(example);
      await slider.fill(await slider.getAttribute('max'));
      await expect(page.getByTestId('insertion-answer')).toContainText('Answer: index '+index);
      await expect(page.locator('.insertion-marker')).toHaveAttribute('data-index',String(index));
      assert.equal(await page.locator('.reference-workspace .array-cell.active').count(),0,'Completed answer must not highlight the previous mid');
      await slider.fill('0');
      await expect(page.getByTestId('insertion-answer')).toHaveCount(0);
    }
    await page.getByLabel('Example',{exact:true}).selectOption('0');
    await page.getByRole('button',{name:'Focus on walkthrough',exact:true}).click();
    const layout=await page.locator('.reference-workspace').evaluate(el=>{
      const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,viewport:innerHeight};
    });
    assert.ok(layout.top>=65&&layout.bottom<=layout.viewport+1,JSON.stringify(layout));
    await expect(page.locator('.code-line').nth(8)).toBeInViewport();
    await page.getByRole('button',{name:'Next step',exact:true}).click();
    await expect(page.locator('.array-track').first()).toBeInViewport();
    await page.getByRole('button',{name:'Show problem description',exact:true}).click();
    await expect(page.locator('.lesson-intro')).toBeVisible();
    for(const width of [320,390]){
      await page.setViewportSize({width,height:844});
      await slider.fill(await slider.getAttribute('max'));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      await expect(page.getByTestId('insertion-answer')).toContainText('Insert 2 before 3');
    }
    await page.getByRole('button',{name:'My solution',exact:true}).click();
    await page.getByRole('textbox',{name:'Python solution',exact:true}).fill('def insertion_index(a, target):\n    return 1 / 0\n');
    // Real initialization failure tests feedback placement without depending
    // on a third-party CDN. Execution itself is covered by test:solutions.
    await context.route('https://cdn.jsdelivr.net/pyodide/**',route=>route.abort());
    await page.getByRole('button',{name:'Run example',exact:true}).click();
    await expect(page.locator('.own-editor-panel').getByRole('status')).toBeVisible();
    await expect(page.locator('.own-editor-panel').getByRole('alert')).toContainText('Could not',{timeout:65000});
    const distance=await page.locator('.own-editor-panel').evaluate(panel=>{
      const actions=panel.querySelector('.own-run-actions').getBoundingClientRect();
      const error=panel.querySelector('.own-error').getBoundingClientRect();return error.top-actions.bottom;
    });
    assert.ok(distance>=0&&distance<180,'Error stays close to Run: '+distance);
  }finally{await context.close();}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const browser=await chromium.launch({headless:true,...(process.env.CI?{}:{channel:'chrome'})});try{await checkStudyUI(browser,process.env.LAB_URL||'http://127.0.0.1:4174/algorithms/');console.log('Study UI checks passed.');}finally{await browser.close();}}
