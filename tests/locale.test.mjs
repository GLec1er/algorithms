import test from 'node:test';
import assert from 'node:assert/strict';
const {resolveLocale,languageUrl}=await import('../src/locale.ts');
test('English is default and explicit supported URL language takes precedence',()=>{
 assert.equal(resolveLocale('',null),'en');
 assert.equal(resolveLocale('?lang=ru','en'),'ru');
 assert.equal(resolveLocale('?lang=en','ru'),'en');
 assert.equal(resolveLocale('?lang=xx','ru'),'ru');
 assert.equal(resolveLocale('','ru'),'ru');
 assert.equal(resolveLocale('','bogus'),'en');
});
test('language links preserve deep links and unrelated query arguments',()=>{
 assert.equal(languageUrl('https://example.com/algorithms/?x=1#/problem/lcs','ru'),'https://example.com/algorithms/?x=1&lang=ru#/problem/lcs');
});

test('missing English copy fails explicitly instead of leaking Russian into the interface',async()=>{
 const {t,setCurrentLocale}=await import('../src/locale.ts');
 setCurrentLocale('en');
 assert.throws(()=>t('Непереведённая строка'),/Missing English translation/);
 assert.equal(t('Состояние до строки {0}',[8]),'State before line 8');
 setCurrentLocale('ru');assert.equal(t('Состояние до строки {0}',[8]),'Состояние до строки 8');
 setCurrentLocale('en');
});
