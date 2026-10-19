import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {useLocale} from '../../i18n';
import {usePyPreferences,useReducedMotion} from './PyPreferences';
import type {PyMode,PyRenderer} from './renderer';

export default function PyMascot({mode,stepToken,variant='lesson'}:{mode:PyMode;stepToken:string|number;variant?:'hero'|'lesson'}){
 const {locale}=useLocale(),en=locale==='en',preferences=usePyPreferences(),reduced=useReducedMotion();
 const art=useRef<HTMLDivElement>(null),image=useRef<HTMLImageElement>(null),canvas=useRef<HTMLCanvasElement>(null),engine=useRef<PyRenderer|null>(null);
 const [inView,setInView]=useState(false),[loaded,setLoaded]=useState(false),[failed,setFailed]=useState(false),[renderer,setRenderer]=useState<'static'|'mesh'>('static');
 const enabled=preferences.motion&&!reduced;
 const latest=useRef({mode,enabled,inView});latest.current={mode,enabled,inView};
 const previousStep=useRef(stepToken);
 useEffect(()=>{
  if(!preferences.visible||!art.current)return;
  const observer=new IntersectionObserver(entries=>setInView(entries[0].isIntersecting),{threshold:.01});observer.observe(art.current);
  return()=>observer.disconnect();
 },[preferences.visible]);
 useEffect(()=>{
  if(!preferences.visible){engine.current?.dispose();engine.current=null;setRenderer('static');setLoaded(false);setInView(false);}
 },[preferences.visible]);
 useEffect(()=>{
  if(!enabled||!inView||!loaded||failed||!preferences.visible||engine.current)return;
  let cancelled=false;
  import('./renderer').then(({createPyRenderer})=>{
   if(cancelled||!art.current||!image.current||!canvas.current)return;
   try{
    const controller=createPyRenderer(canvas.current,image.current,art.current,()=>{engine.current=null;setFailed(true);setRenderer('static');});
    engine.current=controller;controller.setEnabled(latest.current.enabled);controller.setMode(latest.current.mode);controller.setVisible(latest.current.inView);setRenderer('mesh');
   }catch{setFailed(true);setRenderer('static');}
  }).catch(()=>{if(!cancelled)setFailed(true);});
  return()=>{cancelled=true;};
 },[enabled,inView,loaded,failed,preferences.visible]);
 useEffect(()=>{engine.current?.setEnabled(enabled);engine.current?.setVisible(inView);engine.current?.setMode(mode);},[enabled,inView,mode]);
 useEffect(()=>{if(previousStep.current!==stepToken&&mode!=='complete')engine.current?.pulse();previousStep.current=stepToken;},[stepToken,mode]);
 useEffect(()=>()=>{engine.current?.dispose();engine.current=null;},[]);
 const point=(event:PointerEvent)=>{if(event.pointerType!=='mouse'||!art.current)return;const r=art.current.getBoundingClientRect();engine.current?.setPointer((event.clientX-r.left)/r.width*2-1,(event.clientY-r.top)/r.height*2-1);};
 if(!preferences.visible)return null;
 return <aside className={`py-dock py-${variant}`} aria-label={en?'Py companion':'Спутник Py'}>
  <div className="py-art" role="img" aria-label={en?'Py, robot python':'Py, робот-питон'} ref={art} data-renderer={renderer} data-mode={mode} data-motion-running="false" onPointerMove={point} onPointerLeave={()=>engine.current?.setPointer(0,0)}>
   <img ref={image} src={`${import.meta.env.BASE_URL}mascot/py.png`} alt="" width="1312" height="1200" loading="lazy" decoding="async" onLoad={()=>setLoaded(true)}/>
   {(enabled&&!failed||renderer==='mesh')&&<canvas ref={canvas} aria-hidden="true"/>}
  </div>
  <div className="py-caption"><span>PY{variant==='hero'&&<> <span aria-hidden="true">/</span> {en?({idle:'READY',playing:'TRACING',paused:'PAUSED',complete:'RESULT'}[mode]):({idle:'ГОТОВ',playing:'РАЗБОР',paused:'ПАУЗА',complete:'ИТОГ'}[mode])}</>}</span><button onClick={()=>preferences.setVisible(false)} aria-label={en?'Hide Py':'Скрыть Py'} title={en?'Hide Py · restore in Appearance':'Скрыть Py · вернуть в оформлении'}>×</button></div>
 </aside>;
}
