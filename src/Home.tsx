import HomeDemo from './components/HomeDemo';
import data from './catalog.json';
import {t} from './locale';
import {useState} from 'react';
import {useLocale} from './i18n';
import type {Chapter,Lesson} from './types';
import {PatternGlyph} from './components/PatternGlyph';
export default function Home({chapters,lessons,completed,lastLesson,storageAvailable}:{chapters:Chapter[];lessons:Lesson[];completed:Set<string>;lastLesson:string;storageAvailable:boolean}){
 const {locale}=useLocale(),en=locale==='en';const [query,setQuery]=useState('');
 const resume=lessons.find(l=>l.id===lastLesson);
 const matches=lessons.filter(l=>`${l.title} ${l.ru} ${data.lessons.find(original=>original.id===l.id)?.ru} ${chapters[l.chapter-1].title} ${data.chapters[l.chapter-1].ru}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
 return <article className="home-content">
  <section className="home-hero"><div className="home-intro"><span className="eyebrow">ALGORITHMS LAB</span><h1>{en?'Coding interview patterns in Python.':'Паттерны для собеседований на Python.'}</h1><p>{en?'Trace the pointers, read the code and step through each decision. Start with binary search.':'Следи за указателями, читай код и разбирай каждое решение по шагам. Начни с бинарного поиска.'}</p>
   <div className="home-facts"><span>{en?'101 problems':'101 задача'}</span><span>{en?'19 patterns':'19 паттернов'}</span><span>{en?'English & Russian':'Английский и русский'}</span></div>
   <div className="hero-actions"><a className="practice-primary" href="#/problem/insertion_index">{en?'Try binary search':'Посмотреть бинарный поиск'} <span aria-hidden="true">↗</span></a><button className="secondary-action" onClick={()=>{document.getElementById('patterns')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}>{en?'Browse patterns':'Выбрать паттерн'} ↓</button>{resume&&<a className="resume-link" href={`#/problem/${resume.id}`}>{en?'Resume':'Продолжить'}: {resume.ru} →</a>}</div>
  </div><HomeDemo/></section>
  {!storageAvailable&&<p className="storage-notice" role="alert">{en?'Browser storage is unavailable. Your progress may be lost on reload.':'Хранилище браузера недоступно. Прогресс может исчезнуть при перезагрузке.'}</p>}
  <section id="patterns" className="home-patterns"><header><div><span className="eyebrow">{en?'19 PATTERNS / 101 PROBLEMS':'19 ПАТТЕРНОВ / 101 ЗАДАЧА'}</span><h2>{en?'Problem library':'Библиотека задач'}</h2></div><label className="home-search"><span>{en?'Search':'Поиск'}</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={en?'Problem or pattern…':'Задача или паттерн…'}/></label></header>
  <div className="pattern-grid">{chapters.map(ch=>{const group=matches.filter(l=>l.chapter===ch.id);return group.length>0&&<details className="pattern-card" key={`${ch.id}-${!!query}`} open={query?true:undefined}><summary><span className="pattern-icon"><PatternGlyph chapter={ch.id}/></span><div><h3>{ch.ru}</h3><small>{lessons.filter(l=>l.chapter===ch.id&&completed.has(l.id)).length} / {lessons.filter(l=>l.chapter===ch.id).length} {en?'understood':'разобрано'}</small></div><span className="pattern-expand" aria-hidden="true">+</span></summary><p>{ch.use}</p><div className="home-lesson-list">{group.map(l=><a href={`#/problem/${l.id}`} key={l.id}><span>{completed.has(l.id)?'✓':'↗'} {l.ru}</span><small>{t(({Easy:'Легко',Medium:'Средне',Hard:'Сложно'} as Record<string,string>)[l.difficulty])}</small></a>)}</div></details>;})}</div>
  {!matches.length&&<p role="status">{en?'No matches. Try a different problem or pattern.':'Ничего не найдено. Попробуй другое название.'}</p>}</section>
  <section className="home-note"><h2>{en?'About this lab':'Об этом практикуме'}</h2><p>{en?'Python runs when the site is built. Your browser replays verified examples, with no server, account or custom code execution. Study history stays in your browser; export a backup from the calendar.':'Python выполняется при сборке сайта. Браузер воспроизводит проверенные примеры без сервера, аккаунта и выполнения произвольного кода. История остаётся в браузере; резервную копию можно сохранить в календаре.'}</p><a href="https://github.com/GLec1er/algorithms" target="_blank" rel="noreferrer">{en?'Explore the source on GitHub':'Исходники на GitHub'} ↗</a></section>
 </article>;
}
