import SegmentedControl from './components/SegmentedControl';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type Locale, resolveLocale, languageUrl, setCurrentLocale } from './locale';
const Context=createContext<{locale:Locale;setLocale:(locale:Locale)=>void}>({locale:'en',setLocale:()=>{}});
const read=()=>{try{return localStorage.getItem('patterns-language');}catch{return null;}};
export function LocaleProvider({children}:{children:ReactNode}) {
 const [locale,update]=useState<Locale>(()=>resolveLocale(location.search,read()));
 setCurrentLocale(locale);
 const setLocale=(value:Locale)=>{update(value);try{localStorage.setItem('patterns-language',value);}catch{/* Works without persistent storage. */}history.replaceState(null,'',languageUrl(location.href,value));};
 useEffect(()=>{document.documentElement.lang=locale;const onPop=()=>update(resolveLocale(location.search,read()));window.addEventListener('popstate',onPop);return()=>window.removeEventListener('popstate',onPop);},[locale]);
 return <Context.Provider value={{locale,setLocale}}>{children}</Context.Provider>;
}
export const useLocale=()=>useContext(Context);
export function LanguageToggle(){
 const {locale,setLocale}=useLocale();
 return <SegmentedControl<Locale> className="language-segments" label={locale==='en'?'Language':'Язык'} value={locale} onChange={setLocale} options={[{value:'en',label:'English',content:'EN'},{value:'ru',label:'Русский',content:'RU'}]}/>;
}
