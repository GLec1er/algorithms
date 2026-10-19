import {useEffect,useId,useRef,useState} from 'react';
import {useLocale} from '../i18n';
import type {ThemePreference} from '../useTheme';
import SegmentedControl from './SegmentedControl';
import {usePyPreferences,useReducedMotion} from './py/PyPreferences';
function ThemeIcon({mode}:{mode:ThemePreference}){
 return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{mode==='system'?<><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></>:mode==='light'?<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>:<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/>}</svg>;
}
export default function ThemeToggle({value,onChange}:{value:ThemePreference;onChange:(value:ThemePreference)=>void}){
 const {locale}=useLocale(),en=locale==='en',py=usePyPreferences(),reduced=useReducedMotion();
 const [open,setOpen]=useState(false),root=useRef<HTMLDivElement>(null),opener=useRef<HTMLButtonElement>(null),panel=useRef<HTMLDivElement>(null),id=useId();
 const labels={system:en?'System':'Системная',light:en?'Light':'Светлая',dark:en?'Dark':'Тёмная'};
 useEffect(()=>{if(!open)return;const frame=requestAnimationFrame(()=>panel.current?.querySelector<HTMLInputElement>('input:checked')?.focus());const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};document.addEventListener('pointerdown',outside);return()=>{cancelAnimationFrame(frame);document.removeEventListener('pointerdown',outside);};},[open]);
 return <div className="appearance-control" ref={root} onBlur={event=>{if(event.relatedTarget&&!root.current?.contains(event.relatedTarget as Node))setOpen(false);}}>
  <button ref={opener} className="appearance-trigger" aria-label={en?'Appearance options':'Настройки оформления'} aria-expanded={open} aria-controls={id} aria-haspopup="dialog" onClick={()=>setOpen(v=>!v)}><ThemeIcon mode={value}/><span>{en?'Appearance':'Оформление'}</span><small aria-hidden="true">⌄</small></button>
  {open&&<div ref={panel} className="appearance-panel" role="dialog" id={id} aria-label={en?'Appearance options':'Настройки оформления'} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setOpen(false);opener.current?.focus();}}}>
   <span className="appearance-heading">{en?'APPEARANCE':'ОФОРМЛЕНИЕ'}</span>
   <SegmentedControl<ThemePreference> className="theme-options" label={en?'Appearance':'Оформление'} value={value} onChange={onChange} options={(['system','light','dark'] as const).map(mode=>({value:mode,label:labels[mode],content:<><ThemeIcon mode={mode}/><span>{labels[mode]}</span><i aria-hidden="true">{value===mode?'✓':''}</i></>}))}/>
   <fieldset className="py-preferences"><legend>PY</legend><label><input type="checkbox" checked={py.visible} onChange={event=>py.setVisible(event.target.checked)}/><span>{en?'Show Py':'Показывать Py'}</span></label><label><input type="checkbox" checked={py.motion} onChange={event=>py.setMotion(event.target.checked)}/><span>{en?'Animate Py':'Анимировать Py'}</span></label>{reduced&&<p>{en?'Your system requests reduced motion. Py stays still.':'В системе включено уменьшение движения. Py остаётся неподвижным.'}</p>}</fieldset>
  </div>}
 </div>;
}
