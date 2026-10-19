import {t} from '../locale';
import type {ThemePreference} from '../useTheme';
import SegmentedControl from './SegmentedControl';
function ThemeIcon({mode}:{mode:ThemePreference}){
 return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{mode==='system'?<><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></>:mode==='light'?<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>:<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/>}</svg>;
}
export default function ThemeToggle({value,onChange}:{value:ThemePreference;onChange:(value:ThemePreference)=>void}){
 return <SegmentedControl<ThemePreference> className="theme-segments" label={t('Оформление')} value={value} onChange={onChange} options={(['system','light','dark'] as const).map(mode=>({value:mode,label:t({system:'Системная',light:'Светлая',dark:'Тёмная'}[mode]),content:<ThemeIcon mode={mode}/>}))}/>;
}
