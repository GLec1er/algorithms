import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

export async function checkSolutions(browser,base){
  const c=await browser.newContext();
  try{
    const p=await c.newPage();
    await p.goto(base+'#/problem/insertion_index');
    await p.getByRole('button',{name:'Моё решение',exact:true}).click({timeout:5000});
    const editor=p.getByRole('textbox',{name:'Python-решение',exact:true});
    assert.match(await editor.inputValue(),/NotImplementedError/);
    await editor.fill('def insertion_index(a, target):');
    await editor.press('End');await editor.press('Enter');await editor.press('Tab');
    await expect(editor).toHaveValue('def insertion_index(a, target):\n        ');
    await editor.press('Shift+Tab');await expect(editor).not.toBeFocused();
    const code='def insertion_index(a, target):\n    position = 0\n    for number in a:\n        if number >= target:\n            return position\n        position += 1\n    return position\n';
    await editor.fill(code);
    const linePositions=await p.locator('.editor-source-line').evaluateAll(lines=>lines.slice(0,3).map(line=>line.getBoundingClientRect().top));
    assert.ok(linePositions[1]>linePositions[0]+20&&linePositions[2]>linePositions[1]+20,'Python lines must be painted vertically over editable text');
    const progress=await p.evaluate(()=>localStorage.getItem('patterns-study-v2'));
    await p.getByRole('button',{name:'Проверить все примеры',exact:true}).click();
    await expect(p.getByTestId('own-summary')).toContainText('4 / 4',{timeout:65000});
    assert.equal(await p.evaluate(()=>localStorage.getItem('patterns-study-v2')),progress);
    await p.getByLabel('Шаг моего решения',{exact:true}).fill('4');
    await expect(p.locator('.user-scene')).toContainText('number');
    await expect(p.locator('.user-scene')).toContainText('position');
    await editor.fill('def insertion_index(a, target):\n    return 99\n');
    await expect(p.getByTestId('own-stale')).toBeVisible();
    await expect(p.getByLabel('Шаг моего решения',{exact:true})).toBeDisabled();
    await p.getByRole('button',{name:'Запустить пример',exact:true}).click();
    await expect(p.getByTestId('own-summary')).toContainText('Не совпало',{timeout:30000});
    await p.reload();await p.getByRole('button',{name:'Моё решение',exact:true}).click();
    await expect(editor).toHaveValue('def insertion_index(a, target):\n    return 99\n');
    p.once('dialog',d=>d.dismiss());
    await p.getByRole('button',{name:'Скопировать эталон',exact:true}).click();
    await expect(editor).toHaveValue('def insertion_index(a, target):\n    return 99\n');
    await editor.fill('import decimal\ndef insertion_index(a, target):\n    decimal.getcontext().prec += 1\n    return decimal.getcontext().prec - 28\n');
    for(let attempt=0;attempt<2;attempt++){
      await p.getByRole('button',{name:'Запустить пример',exact:true}).click();
      await expect(p.getByTestId('own-summary')).toContainText('Совпало на примере',{timeout:65000});
    }
    await editor.fill('def insertion_index(a, target):\n    return 99\n');
    p.once('dialog',d=>d.accept());await p.getByRole('button',{name:'Скопировать эталон',exact:true}).click();
    assert.match(await editor.inputValue(),/while left < right/);
    await p.goto(base+'#/problem/first_last');await p.getByRole('button',{name:'Моё решение',exact:true}).click();
    await expect(editor).toHaveValue(/def first_last/);
    for(const width of [320,390]){await p.setViewportSize({width,height:844});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth)<=width+2);}
    await p.goto(base+'#/problem/insertion_index');await p.getByRole('button',{name:'Моё решение',exact:true}).click();
    await editor.fill('while True:\n    pass\n\ndef insertion_index(a, target):\n    return 1\n');
    await p.getByRole('button',{name:'Запустить пример',exact:true}).click();
    await expect(p.getByTestId('own-summary')).toContainText('Выполняем ваш код',{timeout:65000});
    await p.getByRole('button',{name:'Остановить',exact:true}).click();
    await expect(p.getByRole('alert')).toContainText('Запуск остановлен');
    await editor.fill('def insertion_index(a, target):\n    return 1\n');
    await p.getByRole('button',{name:'Запустить пример',exact:true}).click();
    await expect(p.getByTestId('own-summary')).toContainText('Совпало на примере',{timeout:65000});
    await editor.fill('def insertion_index(a, target):\n    marker = 1\n    return marker / 0\n');
    await p.getByRole('button',{name:'Запустить пример',exact:true}).click();
    await expect(p.getByRole('alert')).toContainText('ZeroDivisionError',{timeout:30000});
    await expect(p.getByRole('alert')).toContainText('строка 3');
    await expect(p.getByLabel('Шаг моего решения',{exact:true})).toBeEnabled();
    await editor.fill('def insertion_index(a, target):\n    from curriculum.structures import Node\n    node = Node(1, "graph")\n    node.neighbors = 42\n    return 1\n');
    await p.getByRole('button',{name:'Запустить пример',exact:true}).click();
    await expect(p.getByTestId('own-summary')).toContainText('Совпало на примере',{timeout:30000});
    const slider=p.getByLabel('Шаг моего решения',{exact:true});
    await slider.fill(await slider.getAttribute('max'));
    await expect(editor).toBeVisible();
    await expect(p.locator('.user-scene')).toContainText('Узлы показаны как данные');
    await editor.fill('def insertion_index(a, target):\n    from curriculum.structures import Node\n    node = Node(1, "trie")\n    node.end = set()\n    return 1\n');
    await p.getByRole('button',{name:'Запустить пример',exact:true}).click();
    await expect(p.getByTestId('own-summary')).toContainText('Совпало на примере',{timeout:65000});
    await slider.fill(await slider.getAttribute('max'));
    await expect(p.locator('.user-scene')).toContainText('Узлы показаны как данные');
    await editor.fill('def insertion_index(a, target):\n    from curriculum.structures import Node\n    root = Node(1, "tree")\n    child = Node(2, "tree")\n    root.left = child\n    child.left = child\n    return 1\n');
    await p.getByRole('button',{name:'Запустить пример',exact:true}).click();
    await expect(p.getByTestId('own-summary')).toContainText('Совпало на примере',{timeout:30000});
    await slider.fill(await slider.getAttribute('max'));
    await expect(p.locator('.user-scene')).toContainText('Узлы показаны как данные');
    await editor.fill('while True:\n    pass\n\ndef insertion_index(a, target):\n    return 1\n');
    await p.getByRole('button',{name:'Запустить пример',exact:true}).click();
    await expect(p.getByTestId('own-summary')).toContainText('Выполняем ваш код',{timeout:30000});
    await editor.fill('def insertion_index(a, target):\n    return 99\n');
    await expect(p.getByRole('alert')).toContainText('Код изменён');
    await p.getByRole('button',{name:'Запустить пример',exact:true}).click();
    await expect(p.getByTestId('own-summary')).toContainText('Не совпало',{timeout:65000});
    await expect(editor).toHaveValue('def insertion_index(a, target):\n    return 99\n');
  }finally{await c.close();}
  await checkUnavailableStorage(browser,base);
  await checkRuntimeRetry(browser,base);
}

async function checkRuntimeRetry(browser,base){
  const c=await browser.newContext();
  try{
    await c.route('https://cdn.jsdelivr.net/pyodide/**',route=>route.abort());
    const p=await c.newPage();await p.goto(base+'#/problem/insertion_index');
    await p.getByRole('button',{name:'Моё решение',exact:true}).click();
    const editor=p.getByRole('textbox',{name:'Python-решение',exact:true});
    await editor.fill('def insertion_index(a, target):\n    return 1\n');
    await p.getByRole('button',{name:'Запустить пример',exact:true}).click();
    await expect(p.getByRole('alert')).toContainText('Не удалось',{timeout:65000});
    await expect(editor).toBeVisible();
    await c.unroute('https://cdn.jsdelivr.net/pyodide/**');
    await p.getByRole('button',{name:'Запустить пример',exact:true}).click();
    await expect(p.getByTestId('own-summary')).toContainText('Совпало на примере',{timeout:65000});
  }finally{await c.close();}
}

async function checkUnavailableStorage(browser,base){
  const c=await browser.newContext({colorScheme:'light'});
  try{
    await c.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Denied','QuotaExceededError');};});
    const p=await c.newPage();await p.goto(base+'#/problem/insertion_index');await p.getByRole('button',{name:'Моё решение',exact:true}).click();
    await p.getByRole('textbox',{name:'Python-решение',exact:true}).fill('def insertion_index(a, target):\n    return target\n');
    await expect(p.getByRole('alert')).toContainText('Не удалось сохранить черновик');
    await p.getByRole('button',{name:'Эталон',exact:true}).click();await p.getByLabel('Шаг анимации',{exact:true}).waitFor();
  }finally{await c.close();}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const b=await chromium.launch({headless:true,...(process.env.CI?{}:{channel:'chrome'})});try{await checkSolutions(b,process.env.LAB_URL||'http://127.0.0.1:4173/algorithms/');console.log('Own solution browser checks passed.');}finally{await b.close();}}
