import { useEffect, useMemo, useState } from 'react';
import data from './catalog.json';
import type { Chapter, Lesson, Payload, Value } from './types';
import { pretty, isRef } from './types';
import Scene from './components/Scene';
import Code from './components/Code';
import OwnSolution from './components/OwnSolution';
import { PatternGlyph } from './components/PatternGlyph';
import PatternGuide from './components/PatternGuide';
import PracticeCalendar from './components/PracticeCalendar';
import AppShell from './components/AppShell';
import Icon from './components/Icon';
import { localDay, parseProgress, practiceStats, toggleLesson, type StudyProgress } from './progress';

const chapters=data.chapters as Chapter[],lessons=data.lessons as Lesson[];
const byId=new Map(lessons.map(l=>[l.id,l]));
const levels:Record<string,string>={Easy:'Легко',Medium:'Средне',Hard:'Сложно'};
const safeRead=(key:string,fallback:string)=>{try{return localStorage.getItem(key)??fallback;}catch{return fallback;}};
const safeWrite=(key:string,value:string)=>{try{localStorage.setItem(key,value);return true;}catch{return false;}};
const route=()=>location.hash==='#/calendar'?'calendar':location.hash.startsWith('#/problem/')?decodeURIComponent(location.hash.slice(10)):location.hash&&location.hash!=='#/'?'unknown':safeRead('patterns-last','insertion_index');


function Completion({completed,toggle}:{completed:boolean;toggle:()=>void}) {
  return <section className="lesson-completion"><div><strong>Разобрался с задачей?</strong><p>Отметь её, чтобы сохранить свой прогресс.</p></div><button className={`complete-button ${completed?'is-complete':''}`} aria-label={completed?'Убрать отметку':'Отметить как разобранное'} onClick={toggle}><Icon name="check"/><span>{completed?'Разобрано':'Задача разобрана'}</span></button></section>;
}

function Player({lesson,completed,toggle}:{lesson:Lesson;completed:boolean;toggle:()=>void}) {
  const chapter=chapters[lesson.chapter-1];
  const [payload,setPayload]=useState<Payload|null>(null),[error,setError]=useState('');
  const [exampleIndex,setExampleIndex]=useState(0),[step,setStep]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1);
  const [variablesOpen,setVariablesOpen]=useState(true);
  const [mode,setMode]=useState<'reference'|'own'>('reference');
  useEffect(()=>{
    const controller=new AbortController();
    fetch(`${import.meta.env.BASE_URL}lessons/${lesson.id}.json`,{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('Не удалось загрузить занятие');return r.json();}).then(p=>setPayload(p)).catch(e=>{if(e.name!=='AbortError')setError('Не удалось загрузить занятие. Проверьте соединение и попробуйте снова.');});
    return ()=>controller.abort();
  },[lesson.id]);
  const example=payload?.examples[exampleIndex],frames=example?.frames??[],frame=frames[step];
  useEffect(()=>{
    if(!playing)return;
    if(step>=frames.length-1){setPlaying(false);return;}
    const timer=setTimeout(()=>setStep(s=>Math.min(s+1,frames.length-1)),800/speed);
    return ()=>clearTimeout(timer);
  },[playing,step,frames.length,speed]);
  const move=(next:number)=>{setPlaying(false);setStep(Math.max(0,Math.min(frames.length-1,next)));};
  useEffect(()=>{
    if(mode==='own')return;
    const handle=(e:KeyboardEvent)=>{
      if((e.target as HTMLElement).closest('input,select,textarea,a,dialog'))return;
      if(e.key==='ArrowRight'){e.preventDefault();move(step+1);}
      if(e.key==='ArrowLeft'){e.preventDefault();move(step-1);}
      if(e.key===' '&&!(e.target as HTMLElement).closest('button')){e.preventDefault();setPlaying(p=>!p);}
    };window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle);
  },[step,frames.length,mode]);
  const index=lessons.findIndex(l=>l.id===lesson.id);
  const scalarEntries=frame?Object.entries(frame.state).filter(([,v])=>isRef(v)||(!Array.isArray(v)&&!(v&&typeof v==='object'))):[];
  return <article className="lesson-content">
    <div className="breadcrumb"><a href="#/problem/pair_sum_sorted">Библиотека паттернов</a><span>/</span><span>{chapter.ru}</span></div>
    <div className="lesson-heading"><span className="chapter-badge" aria-hidden="true">{lesson.chapter}</span><div><div className="eyebrow">Глава {lesson.chapter} · {chapter.title}</div><h1>{lesson.ru}</h1><p className="original-title">{lesson.title}</p></div></div>
    <div className="lesson-meta"><span className={`difficulty ${lesson.difficulty.toLowerCase()}`}><span className="difficulty-bars" aria-hidden="true"><i/><i/><i/></span>{levels[lesson.difficulty]}</span><span className="complexity-chip">{mode==='own'?'Эталон: ':<span>Время </span>}{lesson.time}</span><span className="language-chip"><b>Py</b> Python 3</span><span className="lesson-position">{lessons.filter(l=>l.chapter===lesson.chapter).findIndex(l=>l.id===lesson.id)+1} / {lessons.filter(l=>l.chapter===lesson.chapter).length} в главе</span></div>
    <div className="problem-brief"><span className="brief-label">УСЛОВИЕ<span>↳</span></span><p className="statement">{lesson.statement}</p></div>
    <div className="solution-modes" role="group" aria-label="Режим решения"><button aria-pressed={mode==='reference'} onClick={()=>{setPlaying(false);setMode('reference');}}>Эталон</button><button aria-pressed={mode==='own'} onClick={()=>{setPlaying(false);setMode('own');}}>Моё решение</button><span>{mode==='reference'?'Готовое решение с объяснениями':'Напиши свой код и посмотри его выполнение'}</span></div>
    {error?<div className="error-card" role="alert"><p>{error}</p><button onClick={()=>location.reload()}>Повторить загрузку</button></div>:!payload||!frame||!example?<div className="loading-card"><span className="loading-spinner"/>Готовим визуализацию…</div>:mode==='own'?<><OwnSolution key={lesson.id} lesson={lesson} payload={payload}/><PatternGuide chapter={chapter} lessons={lessons} current={lesson.id}/><Completion completed={completed} toggle={toggle}/></>:<>
      <div className="workspace-grid">
        <section className="visual-panel" aria-label="Визуализация алгоритма"><header className="panel-heading"><div><span className="panel-number">01</span><strong>Визуализация</strong></div><span className={`play-status ${playing?'playing':''}`}><i/>{frame.done?'Завершено':playing?'В движении':'На паузе'}</span></header>
          <div className="example-toolbar"><label>Пример<select aria-label="Пример" value={exampleIndex} onChange={e=>{setPlaying(false);setStep(0);setExampleIndex(Number(e.target.value));}}>{payload.examples.map((ex,i)=><option key={i} value={i}>{ex.label}</option>)}</select></label><div className="input-chips">{Object.entries(example.args).filter(([,v])=>!Array.isArray(v)&&typeof v!=='object').slice(0,3).map(([k,v])=><span key={k}><code>{k}</code> = <strong>{pretty(v)}</strong></span>)}</div></div>
          <div className="canvas"><Scene frame={frame} lesson={lesson} input={example.args}/></div>
          <div className="legend"><span><i className="legend-active"/>Текущий элемент</span><span><i className="legend-range"/>Рабочая область</span><span><i className="legend-muted"/>Вне поиска</span></div>
          <div className="step-explanation" aria-live="polite"><span className="step-badge">{String(step+1).padStart(2,'0')}</span><div><small>{frame.done?'РЕЗУЛЬТАТ':'СЛЕДУЮЩЕЕ ДЕЙСТВИЕ'}</small><p>{frame.message}</p></div></div>
          <div className="transport"><div className="transport-buttons"><button title="В начало" aria-label="В начало" disabled={step===0&&!playing} onClick={()=>move(0)}><Icon name="reset"/></button><button title="Предыдущий шаг (←)" aria-label="Предыдущий шаг" disabled={step===0} onClick={()=>move(step-1)}><Icon name="prev"/></button><button className="play-button" aria-label={playing?'Пауза':'Воспроизвести'} onClick={()=>{if(step===frames.length-1)setStep(0);setPlaying(p=>!p);}}><Icon name={playing?'pause':'play'}/><span>{playing?'Пауза':'Смотреть'}</span></button><button title="Следующий шаг (→)" aria-label="Следующий шаг" disabled={frame.done} onClick={()=>move(step+1)}><Icon name="next"/></button></div><label className="speed"><select aria-label="Скорость воспроизведения" value={speed} onChange={e=>setSpeed(Number(e.target.value))}>{[0.5,1,2,4].map(s=><option key={s} value={s}>{s}×</option>)}</select></label><div className="step-counter"><strong data-testid="step">{step+1}</strong><span> / {frames.length}</span></div></div>
          <div className="timeline"><input type="range" aria-label="Шаг анимации" min="0" max={frames.length-1} value={step} onChange={e=>move(Number(e.target.value))}/><div><span>Начало</span><span>Результат</span></div></div>
        </section>
        <aside className="execution-panel"><Code code={payload.code} line={frame.line} support={payload.support} filename={lesson.id}/><section className="variables-panel"><button className="variables-toggle" aria-expanded={variablesOpen} onClick={()=>setVariablesOpen(o=>!o)}><span><span className="panel-number">02</span>Переменные</span><span>{variablesOpen?'−':'+'}</span></button>{variablesOpen&&<div className="variables">{scalarEntries.length?scalarEntries.map(([k,v])=><div key={k}><code>{k}</code><strong>{pretty(v)}</strong></div>):<p>Переменные появятся по ходу выполнения.</p>}</div>}</section></aside>
      </div>
      <section className={`result-strip ${frame.done?'done':''}`}><div><span className="result-icon">{frame.done?'✓':'→'}</span><div><small>{frame.done?'РЕЗУЛЬТАТ ВЫПОЛНЕНИЯ':'ОЖИДАЕМЫЙ ОТВЕТ'}</small><code>{pretty(frame.done?frame.result:example.expected)}</code></div></div>{frame.done&&<span className="result-match">{JSON.stringify(frame.result)===JSON.stringify(example.expected)?'Результат совпадает':'Проверьте результат'}</span>}<details><summary>Входные данные</summary><pre>{JSON.stringify(example.args,null,2)}</pre></details></section>
    <PatternGuide chapter={chapter} lessons={lessons} current={lesson.id}/>
      <div className="learning-notes"><section><div className="note-icon">{'{ }'}</div><div><h2>Почему это работает</h2><p>{lesson.idea}</p><p className="invariant"><strong>Инвариант.</strong> {chapter.invariant}</p></div></section><section><div className="note-icon">!</div><div><h2>На что обратить внимание</h2><p>{chapter.pitfall}</p><div className="complexity"><span>Время<strong>{lesson.time}</strong></span><span>Память<strong>{lesson.space}</strong></span></div></div></section></div>
      <Completion completed={completed} toggle={toggle}/>
      <div className="lesson-footer"><a href={lesson.source} target="_blank" rel="noreferrer">Задачи и книга · ByteByteGo ↗</a><span>← → по шагам · пробел — пауза</span></div>
      <nav className="lesson-pagination" aria-label="Следующая задача">{index>0?<a href={`#/problem/${lessons[index-1].id}`}><small>← ПРЕДЫДУЩАЯ</small><strong>{lessons[index-1].ru}</strong></a>:<div/>}{index<lessons.length-1&&<a href={`#/problem/${lessons[index+1].id}`}><small>СЛЕДУЮЩАЯ →</small><strong>{lessons[index+1].ru}</strong></a>}</nav>
    </>}
    {(!payload||!frame||!example)&&<PatternGuide chapter={chapter} lessons={lessons} current={lesson.id}/>}
  </article>;
}

export default function App(){
  const [id,setId]=useState(()=>{try{return route();}catch{return 'unknown';}}),[search,setSearch]=useState(''),[difficulty,setDifficulty]=useState('all');
  const [expanded,setExpanded]=useState(()=>new Set([byId.get(id)?.chapter??6]));
  const [today,setToday]=useState(localDay);
  const [progress,setProgress]=useState<StudyProgress>(()=>parseProgress(safeRead('patterns-study-v2',''),safeRead('patterns-progress','[]'),localDay(),lessons.map(l=>l.id)));
  const [storageAvailable,setStorageAvailable]=useState(true),[notice,setNotice]=useState('');
  const completed=useMemo(()=>new Set(progress.completed),[progress.completed]);
  const practice=useMemo(()=>practiceStats(progress,today,chapters.map(ch=>({id:ch.id,lessonIds:lessons.filter(l=>l.chapter===ch.id).map(l=>l.id)}))),[progress,today]);
  useEffect(()=>{const ok=safeWrite('patterns-study-v2',JSON.stringify(progress));safeWrite('patterns-progress',JSON.stringify(progress.completed));setStorageAvailable(ok);},[progress]);
  useEffect(()=>{const refresh=()=>setToday(localDay());const timer=setInterval(refresh,60000);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);return()=>{clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};},[]);
  useEffect(()=>{const receive=(e:StorageEvent)=>{if(e.key==='patterns-study-v2'&&e.newValue)setProgress(parseProgress(e.newValue,null,localDay(),lessons.map(l=>l.id)));};window.addEventListener('storage',receive);return()=>window.removeEventListener('storage',receive);},[]);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),4000);return()=>clearTimeout(timer);},[notice]);
  const lesson=byId.get(id);
  useEffect(()=>{const onHash=()=>{try{setId(route());}catch{setId('unknown');}setToday(localDay());};window.addEventListener('hashchange',onHash);return()=>window.removeEventListener('hashchange',onHash);},[]);
  useEffect(()=>{if(lesson){safeWrite('patterns-last',id);setExpanded(new Set([lesson.chapter]));document.title=`${lesson.ru} · Coding Patterns Lab`;}else if(id==='calendar'){document.title='Календарь практики · Algorithms Lab';}window.scrollTo(0,0);},[id]);
  const filtered=useMemo(()=>{const q=search.toLocaleLowerCase('ru').replaceAll('ё','е').trim();return lessons.filter(l=>(difficulty==='all'||l.difficulty===difficulty)&&`${l.ru} ${l.title} ${chapters[l.chapter-1].ru} ${chapters[l.chapter-1].title}`.toLocaleLowerCase('ru').replaceAll('ё','е').includes(q));},[search,difficulty]);
  const toggle=()=>{
    if(!lesson)return;
    const day=localDay(),raw=safeRead('patterns-study-v2','');
    const base=storageAvailable&&raw?parseProgress(raw,null,day,lessons.map(l=>l.id)):progress;
    const isNew=!base.completed.includes(id)&&!Object.hasOwn(base.firstCompletions,id);
    setProgress(toggleLesson(base,id,day));setToday(day);
    setNotice(isNew?'Новая задача: +100 XP. Отличный шаг!':base.completed.includes(id)?'Отметка снята для повторения. История первого закрытия сохранена.':'Отметка восстановлена. Повторение не приносит XP повторно.');
  };
  const catalog=(
    <aside className="sidebar" aria-label="Оглавление книги">
      <div className="sidebar-caption"><span>CODING INTERVIEW PATTERNS</span><p>Главы и задачи</p></div>
      <div className="search-box"><Icon name="search"/><input placeholder="Найти задачу или паттерн" aria-label="Поиск задач" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button aria-label="Очистить поиск" onClick={()=>setSearch('')}>×</button>}</div>
      <div className="catalog-controls"><span>{search||difficulty!=='all'?`${filtered.length} найдено`:'ПАТТЕРНЫ / 19'}</span><select aria-label="Сложность" value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option value="all">Все уровни</option><option value="Easy">Легко</option><option value="Medium">Средне</option><option value="Hard">Сложно</option></select></div>
      <nav className="chapter-nav">{!filtered.length&&<div className="nothing-found">Ничего не найдено<button onClick={()=>{setSearch('');setDifficulty('all');}}>Сбросить фильтры</button></div>}{chapters.map(ch=>{const matches=filtered.filter(l=>l.chapter===ch.id);if(!matches.length)return null;const open=expanded.has(ch.id)||!!search||difficulty!=='all';return <div className={`chapter-group ${lesson?.chapter===ch.id?'current-chapter':''}`} key={ch.id}><button className="chapter-button" aria-expanded={open} onClick={()=>{setExpanded(old=>{const next=new Set(old);next.has(ch.id)?next.delete(ch.id):next.add(ch.id);return next;});}}><span className="chapter-icon"><PatternGlyph chapter={ch.id}/></span><span><small>{String(ch.id).padStart(2,'0')}</small>{ch.ru}</span><span className="chapter-count">{matches.length}</span><span className="chapter-chevron">{open?'−':'+'}</span></button>{open&&<div className="problem-links">{matches.map(l=><a key={l.id} data-testid="lesson-link" href={`#/problem/${l.id}`} className={id===l.id?'selected':''} aria-current={id===l.id?'page':undefined}><span className={`problem-dot ${completed.has(l.id)?'checked':''}`}>{completed.has(l.id)?'✓':''}</span><span>{l.ru}</span></a>)}</div>}</div>;})}</nav>
      <div className="sidebar-progress"><div><span>ВАШ ПРОГРЕСС</span><strong>{Math.round(completed.size/101*100)}<small>%</small></strong></div><div className="progress-track"><i style={{width:`${completed.size/101*100}%`}}/></div><p><strong>{completed.size}</strong> из 101 задач разобрано</p><a className="sidebar-habit" href="#/calendar"><span>{practice.finished?'Курс пройден ✓':practice.todayCount?'Цель сегодня закрыта ✓':'Цель: 1 новая задача в будни'}</span><b>{practice.currentStreak} ↗</b></a></div><div className="sidebar-bottom"><div className="book-icon">≡</div><div><strong>19 глав · 101 задача</strong><span>Alex Xu & Shaun Gunawardane</span></div><a href="https://github.com/GLec1er/algorithms" target="_blank" rel="noreferrer" aria-label="Репозиторий GitHub"><Icon name="github"/></a></div>
    </aside>
  );
  return <AppShell activeRoute={id} catalog={catalog} completedCount={completed.size} lessonCount={lessons.length}>
    <main className="main">
      {id==='calendar'?<PracticeCalendar progress={progress} today={today} lessons={lessons} chapters={chapters} storageAvailable={storageAvailable}/>:lesson?<Player key={lesson.id} lesson={lesson} completed={completed.has(id)} toggle={toggle}/>:<div className="not-found"><span>404</span><h1>Задача не найдена</h1><p>Откройте задачу из оглавления или начните с первой главы.</p><a href="#/problem/pair_sum_sorted">К первой задаче</a></div>}
      <footer className="site-footer"><span>Algorithms <span className="footer-lab">Lab</span> · Coding Interview Patterns</span><span>Учебный спутник книги Coding Interview Patterns · 2026</span></footer>
    </main>
    {notice&&<div className="practice-toast" role="status">{notice}</div>}
  </AppShell>;
}
