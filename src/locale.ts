export type Locale = 'en' | 'ru';
export function resolveLocale(search: string, saved: string | null): Locale {
  const explicit = new URLSearchParams(search).get('lang');
  return explicit === 'en' || explicit === 'ru' ? explicit : saved === 'ru' ? 'ru' : 'en';
}
export function languageUrl(href: string, locale: Locale): string {
  const url = new URL(href); url.searchParams.set('lang', locale); return url.href;
}

import messages from './messages.json' with {type:'json'};
let currentLocale: Locale = 'en';
export function setCurrentLocale(locale: Locale) { currentLocale = locale; }
export function getCurrentLocale() { return currentLocale; }
/** Russian keys keep the original copy reviewable; interpolations never become HTML. */
export function t(key: string, values: (string | number)[] = []): string {
  if(currentLocale==='en'&&/[А-Яа-яЁё]/.test(key)&&!Object.hasOwn(messages,key))throw new Error(`Missing English translation: ${key}`);
  const text = currentLocale === 'ru' ? key : (messages as Record<string,string>)[key] ?? key;
  return text.replace(/\{(\d+)\}/g, (_,index) => String(values[Number(index)] ?? ''));
}
