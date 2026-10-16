import { useEffect, useMemo, useState } from 'react';
import data from './catalog.json';
import type { Chapter, Lesson, Payload, Value } from './types';
import { pretty, isRef } from './types';
import Scene from './components/Scene';
import Code from './components/Code';

const chapters=data.chapters as Chapter[],lessons=data.lessons as Lesson[];
const byId=new Map(lessons.map(l=>[l.id,l]));
const levels:Record<string,string>={Easy:'Легко',Medium:'Средне',Hard:'Сложно'};
const icons=['↔','#','⛓','⇉','▣','⌕','▤','△','⋂','Σ','⑂','⌘','⬡','↶','▦','↗','⇅','01','∠'];
const safeRead=(key:string,fallback:string)=>{try{return localStorage.getItem(key)??fallback;}catch{return fallback;}};
const safeWrite=(key:string,value:string)=>{try{localStorage.setItem(key,value);}catch{/* Browser-local progress is optional. */}};
const go=(id:string)=>{location.hash=`/problem/${id}`;};
const route=()=>location.hash.startsWith('#/problem/')?decodeURIComponent(location.hash.slice(10)):location.hash&&location.hash!=='#/'?'unknown':safeRead('patterns-last','insertion_index');

function Icon({name}:{name:string}) {
  const paths:Record<string,React.ReactNode>={
    play:<path d="m8 5 10 7-10 7Z"/>,pause:<><path d="M8 5v14M16 5v14"/></>,prev:<><path d="M5 5v14m13-14-9 7 9 7"/></>,next:<><path d="M19 5v14M6 5l9 7-9 7"/></>,reset:<><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/></>,arrow:<path d="M5 12h14m-6-6 6 6-6 6"/>,menu:<path d="M4 6h16M4 12h16M4 18h16"/>,search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,check:<path d="m5 12 4 4L19 6"/>,github:<><path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1 .1-1.7-.5-2.3 3.3-.4 6.5-1.6 6.5-7A5.5 5.5 0 0 0 19.5 5c.2-1 .1-2-.3-3-1.3 0-2.7.6-3.7 1.4a13 13 0 0 0-7 0A7 7 0 0 0 4.8 2a6 6 0 0 0-.3 3A5.5 5.5 0 0 0 3 8.7c0 5.4 3.2 6.6 6.5 7C9 16.3 9 17 9 18v4"/></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Player({lesson,completed,toggle}:{lesson:Lesson;completed:boolean;toggle:()=>void}) {
  const chapter=chapters[lesson.chapter-1];
  const [payload,setPayload]=useState<Payload|null>(null),[error,setError]=useState('');
  const [exampleIndex,setExampleIndex]=useState(0),[step,setStep]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1);
  const [variablesOpen,setVariablesOpen]=useState(true);
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
    const handle=(e:KeyboardEvent)=>{
      if((e.target as HTMLElement).closest('input,select,textarea,a'))return;
      if(e.key==='ArrowRight'){e.preventDefault();move(step+1);}
      if(e.key==='ArrowLeft'){e.preventDefault();move(step-1);}
      if(e.key===' '&&!(e.target as HTMLElement).closest('button')){e.preventDefault();setPlaying(p=>!p);}
    };window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle);
  },[step,frames.length]);
  const index=lessons.findIndex(l=>l.id===lesson.id);
  const scalarEntries=frame?Object.entries(frame.state).filter(([,v])=>isRef(v)||(!Array.isArray(v)&&!(v&&typeof v==='object'))):[];
  return <article className="lesson-content">
    <div className="breadcrumb"><a href="#/problem/pair_sum_sorted">Библиотека паттернов</a><span>/</span><span>{chapter.ru}</span></div>
    <div className="lesson-heading"><div><div className="eyebrow">ГЛАВА {String(lesson.chapter).padStart(2,'0')} <span>—</span> {chapter.title.toUpperCase()}</div><h1>{lesson.ru}</h1><p className="original-title">{lesson.title}</p></div><button className={`complete-button ${completed?'is-complete':''}`} aria-label={completed?'Убрать отметку':'Отметить как разобранное'} onClick={toggle}><Icon name="check"/><span>{completed?'Разобрано':'Отметить'}</span></button></div>
    <div className="lesson-meta"><span className={`difficulty ${lesson.difficulty.toLowerCase()}`}>{levels[lesson.difficulty]}</span><span><i/> {lesson.time}</span><span><i/> Python 3</span><span className="lesson-position">{lessons.filter(l=>l.chapter===lesson.chapter).findIndex(l=>l.id===lesson.id)+1} / {lessons.filter(l=>l.chapter===lesson.chapter).length} в главе</span></div>
    <p className="statement">{lesson.statement}</p>
    <details className="pattern-intro"><summary><span className="pattern-icon">{icons[lesson.chapter-1]}</span><div><small>РАСПОЗНАТЬ ПАТТЕРН</small><strong>{chapter.ru}</strong></div><span className="summary-label">Когда применять <span>↗</span></span></summary><div className="pattern-body"><p>{chapter.use}</p><p><strong>Что сохраняется на каждом шаге:</strong> {chapter.invariant}</p><div className="chapter-links">{lessons.filter(l=>l.chapter===lesson.chapter).map(l=><a key={l.id} href={`#/problem/${l.id}`} aria-current={l.id===lesson.id?'page':undefined}>{l.ru}</a>)}</div></div></details>
    {error?<div className="error-card" role="alert"><p>{error}</p><button onClick={()=>location.reload()}>Повторить загрузку</button></div>:!payload||!frame||!example?<div className="loading-card"><span className="loading-spinner"/>Готовим визуализацию…</div>:<>
      <div className="workspace-grid">
        <section className="visual-panel" aria-label="Визуализация алгоритма"><header className="panel-heading"><div><span className="panel-number">01</span><strong>Визуализация</strong></div><span className={`play-status ${playing?'playing':''}`}><i/>{frame.done?'Завершено':playing?'В движении':'На паузе'}</span></header>
          <div className="example-toolbar"><label>Пример<select aria-label="Пример" value={exampleIndex} onChange={e=>{setPlaying(false);setStep(0);setExampleIndex(Number(e.target.value));}}>{payload.examples.map((ex,i)=><option key={i} value={i}>{ex.label}</option>)}</select></label><div className="input-chips">{Object.entries(example.args).filter(([,v])=>!Array.isArray(v)&&typeof v!=='object').slice(0,3).map(([k,v])=><span key={k}><code>{k}</code> = <strong>{pretty(v)}</strong></span>)}</div></div>
          <div className="canvas"><Scene frame={frame} lesson={lesson} input={example.args}/></div>
          <div className="legend"><span><i className="legend-active"/>Текущий элемент</span><span><i className="legend-range"/>Рабочая область</span><span><i className="legend-muted"/>Вне поиска</span></div>
          <div className="step-explanation" aria-live="polite"><span className="step-badge">{String(step+1).padStart(2,'0')}</span><div><small>{frame.done?'РЕЗУЛЬТАТ':'СЛЕДУЮЩЕЕ ДЕЙСТВИЕ'}</small><p>{frame.message}</p></div></div>
          <div className="transport"><div className="transport-buttons"><button title="В начало" aria-label="В начало" disabled={step===0&&!playing} onClick={()=>move(0)}><Icon name="reset"/></button><button title="Предыдущий шаг (←)" aria-label="Предыдущий шаг" disabled={step===0} onClick={()=>move(step-1)}><Icon name="prev"/></button><button className="play-button" aria-label={playing?'Пауза':'Воспроизвести'} onClick={()=>{if(step===frames.length-1)setStep(0);setPlaying(p=>!p);}}><Icon name={playing?'pause':'play'}/><span>{playing?'Пауза':'Смотреть'}</span></button><button title="Следующий шаг (→)" aria-label="Следующий шаг" disabled={frame.done} onClick={()=>move(step+1)}><Icon name="next"/></button></div><label className="speed"><select aria-label="Скорость воспроизведения" value={speed} onChange={e=>setSpeed(Number(e.target.value))}>{[0.5,1,2,4].map(s=><option key={s} value={s}>{s}×</option>)}</select></label><div className="step-counter"><strong data-testid="step">{step+1}</strong><span> / {frames.length}</span></div></div>
          <div className="timeline"><input type="range" aria-label="Шаг анимации" min="0" max={frames.length-1} value={step} onChange={e=>move(Number(e.target.value))}/><div><span>Начало</span><span>Результат</span></div></div>
        </section>
        <aside className="execution-panel"><Code code={payload.code} line={frame.line} support={payload.support}/><section className="variables-panel"><button className="variables-toggle" aria-expanded={variablesOpen} onClick={()=>setVariablesOpen(o=>!o)}><span><span className="panel-number">02</span>Переменные</span><span>{variablesOpen?'−':'+'}</span></button>{variablesOpen&&<div className="variables">{scalarEntries.length?scalarEntries.map(([k,v])=><div key={k}><code>{k}</code><strong>{pretty(v)}</strong></div>):<p>Переменные появятся по ходу выполнения.</p>}</div>}</section></aside>
      </div>
      <section className={`result-strip ${frame.done?'done':''}`}><div><span className="result-icon">{frame.done?'✓':'→'}</span><div><small>{frame.done?'РЕЗУЛЬТАТ ВЫПОЛНЕНИЯ':'ОЖИДАЕМЫЙ ОТВЕТ'}</small><code>{pretty(frame.done?frame.result:example.expected)}</code></div></div>{frame.done&&<span className="result-match">{JSON.stringify(frame.result)===JSON.stringify(example.expected)?'Результат совпадает':'Проверьте результат'}</span>}<details><summary>Входные данные</summary><pre>{JSON.stringify(example.args,null,2)}</pre></details></section>
      <div className="learning-notes"><section><div className="note-icon">↳</div><div><h2>Почему это работает</h2><p>{lesson.idea}</p><p className="invariant"><strong>Инвариант.</strong> {chapter.invariant}</p></div></section><section><div className="note-icon">!</div><div><h2>На что обратить внимание</h2><p>{chapter.pitfall}</p><div className="complexity"><span>Время<strong>{lesson.time}</strong></span><span>Память<strong>{lesson.space}</strong></span></div></div></section></div>
      <div className="lesson-footer"><a href={lesson.source} target="_blank" rel="noreferrer">Задачи и книга · ByteByteGo ↗</a><span>← → по шагам · пробел — пауза</span></div>
      <nav className="lesson-pagination" aria-label="Следующая задача">{index>0?<a href={`#/problem/${lessons[index-1].id}`}><small>← ПРЕДЫДУЩАЯ</small><strong>{lessons[index-1].ru}</strong></a>:<div/>}{index<lessons.length-1&&<a href={`#/problem/${lessons[index+1].id}`}><small>СЛЕДУЮЩАЯ →</small><strong>{lessons[index+1].ru}</strong></a>}</nav>
    </>}
  </article>;
}

export default function App(){
  const [id,setId]=useState(()=>{try{return route();}catch{return 'unknown';}}),[search,setSearch]=useState(''),[difficulty,setDifficulty]=useState('all'),[mobile,setMobile]=useState(false);
  const [expanded,setExpanded]=useState(()=>new Set([byId.get(id)?.chapter??6]));
  const [completed,setCompleted]=useState<Set<string>>(()=>{try{const v=JSON.parse(safeRead('patterns-progress','[]'));return new Set(Array.isArray(v)?v.filter((s:unknown)=>typeof s==='string'&&byId.has(s)):[]);}catch{return new Set();}});
  const lesson=byId.get(id);
  useEffect(()=>{const onHash=()=>{try{setId(route());}catch{setId('unknown');}setMobile(false);};window.addEventListener('hashchange',onHash);return()=>window.removeEventListener('hashchange',onHash);},[]);
  useEffect(()=>{if(lesson){safeWrite('patterns-last',id);setExpanded(new Set([lesson.chapter]));document.title=`${lesson.ru} · Coding Patterns Lab`;window.scrollTo(0,0);}},[id]);
  const filtered=useMemo(()=>{const q=search.toLocaleLowerCase('ru').replaceAll('ё','е').trim();return lessons.filter(l=>(difficulty==='all'||l.difficulty===difficulty)&&`${l.ru} ${l.title} ${chapters[l.chapter-1].ru} ${chapters[l.chapter-1].title}`.toLocaleLowerCase('ru').replaceAll('ё','е').includes(q));},[search,difficulty]);
  const toggle=()=>setCompleted(old=>{const next=new Set(old);next.has(id)?next.delete(id):next.add(id);safeWrite('patterns-progress',JSON.stringify([...next]));return next;});
  return <div className="app-shell">
    {mobile&&<button className="sidebar-scrim" aria-label="Закрыть оглавление" onClick={()=>setMobile(false)}/>}
    <aside className={`sidebar ${mobile?'is-open':''}`} aria-label="Оглавление книги"><a className="brand" href="#/problem/insertion_index"><span className="brand-mark">A<span>↗</span></span><span>patterns<span>ALGORITHM LAB</span></span></a>
      <div className="sidebar-caption"><span>CODING INTERVIEW PATTERNS</span><p>Понять. Увидеть. Решить.</p></div>
      <div className="search-box"><Icon name="search"/><input placeholder="Найти задачу или паттерн" aria-label="Поиск задач" value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button aria-label="Очистить поиск" onClick={()=>setSearch('')}>×</button>}</div>
      <div className="catalog-controls"><span>{search||difficulty!=='all'?`${filtered.length} найдено`:'ОГЛАВЛЕНИЕ'}</span><select aria-label="Сложность" value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option value="all">Все уровни</option><option value="Easy">Легко</option><option value="Medium">Средне</option><option value="Hard">Сложно</option></select></div>
      <nav className="chapter-nav">{!filtered.length&&<div className="nothing-found">Ничего не найдено<button onClick={()=>{setSearch('');setDifficulty('all');}}>Сбросить фильтры</button></div>}{chapters.map(ch=>{const matches=filtered.filter(l=>l.chapter===ch.id);if(!matches.length)return null;const open=expanded.has(ch.id)||!!search||difficulty!=='all';return <div className={`chapter-group ${lesson?.chapter===ch.id?'current-chapter':''}`} key={ch.id}><button className="chapter-button" aria-expanded={open} onClick={()=>{setExpanded(old=>{const next=new Set(old);next.has(ch.id)?next.delete(ch.id):next.add(ch.id);return next;});if(lesson?.chapter!==ch.id)go(matches[0].id);}}><span className="chapter-icon">{icons[ch.id-1]}</span><span><small>{String(ch.id).padStart(2,'0')}</small>{ch.ru}</span><span className="chapter-count">{matches.length}</span><span className="chapter-chevron">{open?'−':'+'}</span></button>{open&&<div className="problem-links">{matches.map(l=><a key={l.id} data-testid="lesson-link" href={`#/problem/${l.id}`} className={id===l.id?'selected':''} aria-current={id===l.id?'page':undefined}><span className={`problem-dot ${completed.has(l.id)?'checked':''}`}>{completed.has(l.id)?'✓':''}</span><span>{l.ru}</span></a>)}</div>}</div>;})}</nav>
      <div className="sidebar-bottom"><div className="book-icon">≡</div><div><strong>19 глав · 101 задача</strong><span>Alex Xu & Shaun Gunawardane</span></div><a href="https://github.com/GLec1er/algorithms" target="_blank" rel="noreferrer" aria-label="Репозиторий GitHub"><Icon name="github"/></a></div>
    </aside>
    <main className="main"><header className="topbar"><button className="mobile-menu" aria-label="Открыть оглавление" onClick={()=>setMobile(m=>!m)}><Icon name="menu"/></button><div className="topbar-label">АЛГОРИТМЫ В ДВИЖЕНИИ<span>Интерактивный учебник</span></div><div className="topbar-right"><span className="local-progress" title="Отметки сохраняются в этом браузере"><span className="progress-ring" style={{background:`conic-gradient(#5b8250 ${completed.size/101*100}%, #e0e5dc 0)`}}/><span><strong>{completed.size}</strong> / 101 разобрано</span></span><a className="github-link" href="https://github.com/GLec1er/algorithms" target="_blank" rel="noreferrer"><Icon name="github"/><span>GitHub</span>↗</a></div></header>
      {lesson?<Player key={lesson.id} lesson={lesson} completed={completed.has(id)} toggle={toggle}/>:<div className="not-found"><span>404</span><h1>Задача не найдена</h1><p>Откройте задачу из оглавления или начните с первой главы.</p><a href="#/problem/pair_sum_sorted">К первой задаче</a></div>}
      <footer className="site-footer"><span>patterns / algorithm lab</span><span>Учебный спутник книги Coding Interview Patterns · 2026</span></footer>
    </main>
  </div>;
}
