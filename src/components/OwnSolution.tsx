import {useLocale} from '../i18n';
import {t} from '../locale';
import { useEffect, useRef, useState } from 'react';
import type { Lesson, Payload } from '../types';
import { pretty } from '../types';
import { PythonRunner } from '../runtime/client';
import type { RunResult, RuntimeStatus } from '../runtime/types';
import { useSolutionDraft } from '../useSolutionDraft';
import PythonEditor from './PythonEditor';
import UserScene from './UserScene';
import Icon from './Icon';

export default function OwnSolution({lesson,payload}:{lesson:Lesson;payload:Payload}) {
  const {locale}=useLocale();
  const starter=payload.starter??`${payload.code.split('\n')[0]}\n    raise NotImplementedError("Add your solution")\n`;
  const {code,setCode,stored}=useSolutionDraft(lesson.id,starter);
  const runner=useRef(new PythonRunner()),generation=useRef(0);
  const [status,setStatus]=useState<RuntimeStatus|'idle'>('idle');
  const [failure,setFailure]=useState(''),[runs,setRuns]=useState<Record<number,RunResult>>({}),[runSource,setRunSource]=useState('');
  const [selected,setSelected]=useState(0),[step,setStep]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1),[all,setAll]=useState(false);
  const busy=status!=='idle',stale=Object.keys(runs).length>0&&runSource!==code;
  const result=runs[selected],frames=result?.frames??[],frame=frames[step];
  const count=Object.values(runs).filter(run=>run.passed).length;
  useEffect(()=>()=>{generation.current++;runner.current.dispose();},[]);
  useEffect(()=>{
    if(!playing||busy||stale)return;
    if(step>=frames.length-1){setPlaying(false);return;}
    const timer=setTimeout(()=>setStep(i=>i+1),800/speed);return()=>clearTimeout(timer);
  },[playing,step,frames.length,speed,busy,stale]);
  const move=(next:number)=>{setPlaying(false);setStep(Math.max(0,Math.min(Math.max(0,frames.length-1),next)));};
  useEffect(()=>{
    const handle=(event:KeyboardEvent)=>{
      if((event.target as HTMLElement).closest('input,select,textarea,a,button,dialog')||busy||stale||!frames.length)return;
      if(event.key==='ArrowRight'){event.preventDefault();move(step+1);}
      if(event.key==='ArrowLeft'){event.preventDefault();move(step-1);}
      if(event.key===' '){event.preventDefault();setPlaying(value=>!value);}
    };
    window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle);
  },[step,frames.length,busy,stale]);
  function stop(message=t("Запуск остановлен.")) {
    generation.current++;runner.current.cancel();setStatus('idle');setPlaying(false);setFailure(message);
  }
  function edit(value:string) {
    if(busy)stop(t("Код изменён. Запустите новую версию."));
    setCode(value);setPlaying(false);
  }
  function replace(value:string) {
    if(code!==starter&&code!==value&&!window.confirm(t("Заменить текущий черновик? Его код будет перезаписан.")))return;
    edit(value);
  }
  async function run(checkAll:boolean) {
    const ticket=++generation.current;
    setPlaying(false);setStep(0);setFailure('');setRuns({});setRunSource(code);setAll(checkAll);setStatus('loading');
    const indices=checkAll?payload.examples.map((_,i)=>i):[selected];
    if(checkAll)setSelected(0);
    try {
      for(const index of indices){
        if(generation.current!==ticket)return;
        const example=payload.examples[index];
        const value=await runner.current.run({code,lessonId:lesson.id,args:example.args,expected:example.expected},next=>{if(generation.current===ticket)setStatus(next);});
        if(generation.current!==ticket)return;
        setRuns(old=>({...old,[index]:value}));
      }
    }catch(error){
      if(generation.current===ticket)setFailure(error instanceof Error?error.message:t("Не удалось выполнить код."));
    }finally{if(generation.current===ticket)setStatus('idle');}
  }
  const summary=stale?t("Результаты устарели"):busy?status==='loading'?t("Загружаем Python…"):t("Выполняем ваш код…"):all&&Object.keys(runs).length?t('{0} / {1} примеров совпало',[count,payload.examples.length]):result?result.error?t("Ошибка выполнения"):result.passed?t("Совпало на примере"):t("Не совпало"):t("Ваше решение ещё не запускалось");
  const playable=!busy&&!stale&&frames.length>0;
  return <section className="own-solution" aria-label={t("Рабочая область моего решения")}>
    <div className="own-intro"><div><strong>{t("Твой код. Твой ход решения.")}</strong><p>{t("Сохрани имя функции и порядок входных параметров из шаблона. Имена параметров и внутренних переменных можно менять.")}</p></div><span className="draft-state">{stored?t("Черновик сохранён в браузере"):t("Черновик только в этой вкладке")}</span></div>
    {!stored&&<p className="storage-notice" role="alert">{t("Не удалось сохранить черновик в браузере. Скопируйте код перед закрытием вкладки.")}</p>}
    <div className="own-grid">
      <section className="visual-panel own-visual" aria-label={t("Визуализация моего решения")}>
        <header className="panel-heading"><strong>{t("Ваш запуск")}</strong><span className="play-status">{playable?`${step+1} / ${frames.length}`:'Python'}</span></header>
        <div className="example-toolbar"><label>{t("Пример")}<select aria-label={t("Пример моего решения")} value={selected} onChange={event=>{setSelected(Number(event.target.value));setStep(0);setPlaying(false);}}>{payload.examples.map((example,index)=><option value={index} key={index}>{index+1}. {locale==='en'?example.labelEn:example.label}</option>)}</select></label></div>
        <div className="own-summary" data-testid="own-summary">{summary}</div>
        {!stale&&!!result?.bindings?.length&&<p className="runtime-footnote" data-testid="argument-binding">{t("Входные данные переданы по порядку шаблона: {0}",[result.bindings.map(binding=>`${binding.input} → ${binding.parameter}`).join(', ')])}</p>}
        {stale&&<p className="own-stale" data-testid="own-stale">{t("Код изменён после запуска. Перезапустите его: старая анимация и подсветка отключены.")}</p>}
        <div className="canvas own-canvas">{frame&&!stale?<UserScene frame={frame}/>:<div className="own-empty"><Icon name="play"/><strong>{stale?t("Нужен новый запуск"):t("Здесь появится выполнение твоего кода")}</strong><p>{t("Массивы, переменные, структуры и вызовы — из реального состояния Python.")}</p></div>}</div>
        {frame&&!stale&&<div className="step-explanation"><span className="step-badge">{step+1}</span><p aria-live="polite">{locale==='en'?frame.messageEn:frame.message}</p></div>}
        <div className="transport"><div className="transport-buttons"><button aria-label={t("Моё решение: в начало")} disabled={!playable||step===0} onClick={()=>move(0)}><Icon name="reset"/></button><button aria-label={t("Моё решение: предыдущий шаг")} disabled={!playable||step===0} onClick={()=>move(step-1)}><Icon name="prev"/></button><button className="play-button" aria-label={playing?t("Пауза моего решения"):t("Воспроизвести моё решение")} disabled={!playable} onClick={()=>{if(step===frames.length-1)setStep(0);setPlaying(value=>!value);}}><Icon name={playing?'pause':'play'}/><span>{playing?t("Пауза"):t("Смотреть")}</span></button><button aria-label={t("Моё решение: следующий шаг")} disabled={!playable||step===frames.length-1} onClick={()=>move(step+1)}><Icon name="next"/></button></div><label className="speed"><select aria-label={t("Скорость моего решения")} value={speed} onChange={event=>setSpeed(Number(event.target.value))}>{[.5,1,2,4].map(value=><option key={value} value={value}>{value}×</option>)}</select></label></div>
        <div className="timeline"><input key={`${selected}:${frames.length}`} type="range" aria-label={t("Шаг моего решения")} disabled={!playable} min={0} max={Math.max(0,frames.length-1)} value={Math.min(step,Math.max(0,frames.length-1))} onChange={event=>move(Number(event.target.value))}/><div><span>{t("Начало")}</span><span>{t("Последний кадр")}</span></div></div>
      </section>
      <section className="own-editor-panel" aria-label={t("Редактор своего Python-кода")}>
        <header className="own-editor-heading"><div><span className="python-file-icon">Py</span><strong>{lesson.id}.py</strong></div><span>Python 3</span></header>
        <div className="own-editor-tools"><button onClick={()=>replace(payload.code)}>{t("Скопировать эталон")}</button><button onClick={()=>replace(starter)}>{t("Вернуть шаблон")}</button></div>
        <PythonEditor value={code} onChange={edit} line={!stale&&runSource===code?(result?.error?.line??frame?.line??undefined):undefined}/>
        <p className="editor-help" id="editor-help">{t("Tab — отступ · Shift+Tab — выйти из редактора. До 64 КБ кода.")}</p>
        <div className="own-run-actions"><button className="own-run" disabled={busy} onClick={()=>run(false)}><Icon name="play"/>{t("Запустить пример")}</button><button disabled={busy} onClick={()=>run(true)}>{t("Проверить все примеры")}</button>{busy&&<button className="own-stop" onClick={()=>stop()}>{t("Остановить")}</button>}</div>
        <div className="editor-run-status" role="status">{summary}</div>
    {failure&&<div className="own-error" role="alert">{failure}</div>}
    {!stale&&result?.error&&<div className="own-error" role="alert"><strong>{result.error.type}{result.error.line?t(' · строка {0}',[result.error.line]):''}</strong><pre>{result.error.message}</pre>{frames.length>0&&<p>{t("До ошибки записано кадров:")}{' '}{frames.length}{t(". Их можно посмотреть в плеере.")}</p>}</div>}
        <p className="runtime-footnote">{t("При первом запуске загрузится Python. Вычисления идут в браузере; зависший запуск можно остановить.")}</p>
        {payload.support&&<details className="own-support"><summary>{t("Адаптеры структур данных")}</summary><p>{t("Доступны через")}{' '}<code>from curriculum.structures import …</code></p><pre>{payload.support}</pre></details>}
      </section>
    </div>
    {Object.keys(runs).length>0&&<section className="own-results"><header><h2>{t("Результаты на примерах")}</h2><span>{t("Совпадение на примерах не доказывает корректность на всех входах.")}</span></header><div className="own-result-list">{payload.examples.map((example,index)=>{
      const run=runs[index];return <button key={index} aria-pressed={selected===index} onClick={()=>{setSelected(index);setStep(0);setPlaying(false);}} className={selected===index?'is-selected':''}><strong>{index+1}. {locale==='en'?example.labelEn:example.label}</strong><span className={stale?'':run?.passed?'result-ok':run?'result-bad':''}>{stale&&run?t("Устарело"):run?run.error?run.error.type:run.passed?t("Совпало"):t("Не совпало"):t("Не запускался")}</span></button>;
    })}</div></section>}
    {!stale&&result&&<section className="own-output"><div><small>{t("ФАКТИЧЕСКИЙ ОТВЕТ")}</small><pre>{result.error?t("Запуск не завершён"):pretty(result.result)}</pre></div><div><small>{t("ОЖИДАЕМЫЙ ОТВЕТ")}</small><pre>{pretty(payload.examples[selected].expected)}</pre></div>{result.stdout&&<div className="own-stdout"><small>{t("ВЫВОД PYTHON")}</small><pre>{result.stdout}</pre></div>}{result.notices.length>0&&<ul>{result.notices.map(notice=><li key={notice}>{t(notice)}</li>)}</ul>}</section>}
    <p className="own-progress-note">{t("Запуски не меняют XP и календарь. Отметить задачу разобранной можно вручную ниже.")}</p>
  </section>;
}
