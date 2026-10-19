import {useEffect,useState} from 'react';
import {useLocale} from '../i18n';
import type {Payload} from '../types';
import {ArrayRow} from './primitives';
import Code from './Code';
import Icon from './Icon';
import PyMascot from './py/PyMascot';

/** A real prepared lesson trace; demo interactions never change study history. */
export default function HomeDemo(){
 const {locale}=useLocale(),en=locale==='en';
 const [payload,setPayload]=useState<Payload|null>(null),[failed,setFailed]=useState(false);
 const [step,setStep]=useState(0),[playing,setPlaying]=useState(false);
 const [interacted,setInteracted]=useState(false);
 useEffect(()=>{const controller=new AbortController();fetch(`${import.meta.env.BASE_URL}lessons/insertion_index.json`,{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(setPayload).catch(e=>{if(e.name!=='AbortError')setFailed(true);});return()=>controller.abort();},[]);
 const example=payload?.examples[0],frames=example?.frames??[],frame=frames[step];
 useEffect(()=>{if(!playing)return;if(step>=frames.length-1){setPlaying(false);return;}const timer=setTimeout(()=>setStep(i=>i+1),900);return()=>clearTimeout(timer);},[playing,step,frames.length]);
 const move=(next:number)=>{setInteracted(true);setPlaying(false);setStep(Math.max(0,Math.min(frames.length-1,next)));};
 return <section className="home-demo" aria-label={en?'Binary search demo':'Демо бинарного поиска'}>
  <header><div><span className="demo-kicker">{en?'BINARY SEARCH':'БИНАРНЫЙ ПОИСК'}</span><h2>{en?'Find the insertion index':'Найди позицию вставки'}</h2></div><span className="demo-language">Python</span></header>
  {failed?<p className="demo-fallback" role="alert">{en?'The example could not load. Open the full lesson to retry.':'Не удалось загрузить пример. Открой полный урок для повторной попытки.'}</p>:!frame||!example||!payload?<p className="demo-fallback" role="status">{en?'Loading the Python trace…':'Загружаем трассу Python…'}</p>:<>
   <footer><div className="demo-controls"><button aria-label={en?'Reset demo':'Сбросить демо'} onClick={()=>move(0)} disabled={step===0&&!playing}><Icon name="reset"/></button><button aria-label={en?'Previous demo step':'Предыдущий шаг демо'} onClick={()=>move(step-1)} disabled={step===0}><Icon name="prev"/></button><button className="demo-play" aria-label={playing?(en?'Pause demo':'Остановить демо'):(en?'Play demo':'Запустить демо')} onClick={()=>{setInteracted(true);if(frame.done)setStep(0);setPlaying(p=>!p);}}><Icon name={playing?'pause':'play'}/><span>{playing?(en?'Pause':'Пауза'):(en?'Play':'Смотреть')}</span></button><button aria-label={en?'Next demo step':'Следующий шаг демо'} onClick={()=>move(step+1)} disabled={frame.done}><Icon name="next"/></button></div><div className="demo-step"><span data-testid="demo-step">{step+1}</span> / {frames.length}</div></footer>
   <div className="demo-workspace"><div className="demo-array"><div className="demo-scene-row"><div className="demo-data"><div className="demo-target"><span>target</span><code>{String(example.args.target)}</code></div><ArrayRow name="a" values={example.args.a as number[]} frame={frame} pointers halfOpen/></div><PyMascot mode={frame.done?'complete':playing?'playing':interacted?'paused':'idle'} stepToken={step} variant="hero"/></div>
    <div className="demo-bounds">{['left','mid','right'].map(key=><span key={key}><code>{key}</code><b>{String(frame.state[key]??'—')}</b></span>)}</div>
    <p className="demo-message" aria-live="polite">{en?frame.messageEn:frame.message}</p>
    {frame.done&&<p className="demo-result" data-testid="demo-result">{en?'Insertion index: ':'Позиция вставки: '}{String(frame.result)}</p>}
   </div><Code code={payload.code} line={frame.line} filename="insertion_index"/></div>

  </>}
  <div className="demo-footnote"><span>{en?'Prepared example · actual Python execution':'Подготовленный пример · реальное выполнение Python'}</span><a href="#/problem/insertion_index">{en?'Full lesson':'Полный урок'} <span aria-hidden="true">↗</span></a></div>
 </section>;
}
