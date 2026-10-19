/** User-facing native radio choices; Russian UI is used by the legacy design checks. */
export async function selectTheme(page,value){
 const labels={system:'Системная',light:'Светлая',dark:'Тёмная'};
 await page.getByRole('group',{name:'Оформление',exact:true}).getByRole('radio',{name:labels[value],exact:true}).check();
}
