/** Open the same Appearance panel used by keyboard and pointer users. */
export async function openAppearance(page){
 const en=await page.locator('html').getAttribute('lang')==='en';
 const opener=page.getByRole('button',{name:en?'Appearance options':'Настройки оформления',exact:true});
 if(await opener.getAttribute('aria-expanded')!=='true')await opener.click();
}
export async function selectTheme(page,value){
 const en=await page.locator('html').getAttribute('lang')==='en';
 const labels=en?{system:'System',light:'Light',dark:'Dark'}:{system:'Системная',light:'Светлая',dark:'Тёмная'};
 await openAppearance(page);
 await page.getByRole('group',{name:en?'Appearance':'Оформление',exact:true}).getByRole('radio',{name:labels[value],exact:true}).check();
 await page.keyboard.press('Escape');
}
