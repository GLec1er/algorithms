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
export function LanguageToggle(){const {locale,setLocale}=useLocale();return <label className="language-toggle"><span aria-hidden="true">文</span><select aria-label={locale==='en'?'Language':'Язык'} value={locale} onChange={e=>setLocale(e.target.value as Locale)}><option value="en">English</option><option value="ru">Русский</option></select></label>;}
