import { useMemo, useState } from 'react';
import type { Lesson, Chapter } from '../types';
import { dailyCounts, dayStatus, goalStart, monthCells, practiceStats, shiftDay, shiftMonth, type DayStatus, type StudyProgress } from '../progress';

const format=(day:string,options:Intl.DateTimeFormatOptions)=>new Intl.DateTimeFormat('ru-RU',{...options,timeZone:'UTC'}).format(new Date(`${day}T12:00:00Z`));
const dayLabel=(day:string)=>format(day,{day:'numeric',month:'long'});
const statusText:Record<DayStatus,string>={done:'Цель выполнена',bonus:'Бонусная практика',missed:'Цель не закрыта',pending:'Нужна одна новая задача',planned:'В плане одна новая задача',weekend:'Выходной — по желанию',untracked:'До начала учёта',free:'Курс пройден — свободная практика'};

export default function PracticeCalendar({progress,today,lessons,chapters,storageAvailable}:{progress:StudyProgress;today:string;lessons:Lesson[];chapters:Chapter[];storageAvailable:boolean}) {
  const [month,setMonth]=useState(()=>today.slice(0,7)),[selected,setSelected]=useState(today);
  const stats=useMemo(()=>practiceStats(progress,today,chapters.map(ch=>({id:ch.id,lessonIds:lessons.filter(l=>l.chapter===ch.id).map(l=>l.id)}))),[progress,today,lessons,chapters]);
  const counts=dailyCounts(progress), status=dayStatus(progress,today,today,stats.finishedOn);
  const next=lessons.find(l=>!Object.hasOwn(progress.firstCompletions,l.id));
  const records=lessons.filter(l=>progress.firstCompletions[l.id]===selected);
  const undated=Object.values(progress.firstCompletions).filter(d=>d===null).length;
  const selectedStatus=dayStatus(progress,selected,today,stats.finishedOn);
  const upcoming=goalStart(progress)>today?goalStart(progress):(()=>{let day=shiftDay(today,1);while([0,6].includes(new Date(`${day}T12:00:00Z`).getUTCDay()))day=shiftDay(day,1);return day;})();
  const closed=stats.todayCount>0;
  return <article className="practice-content">
    <div className="breadcrumb"><a href="#/problem/insertion_index">Практикум</a><span>/</span><span>Календарь</span></div>
    <div className="practice-heading"><span className="practice-emblem" aria-hidden="true">✓</span><div><div className="eyebrow">МАЛЕНЬКИЙ ШАГ КАЖДЫЙ БУДНИЙ ДЕНЬ</div><h1>Календарь практики</h1><p>Понедельник — пятница: хотя бы одна новая задача. Выходные — по желанию.</p></div></div>
    {!storageAvailable&&<p className="storage-notice" role="alert">Хранилище браузера недоступно. Прогресс работает в этой вкладке, но после перезагрузки может исчезнуть.</p>}
    <section className={`daily-goal ${closed?'goal-done':''}`}>
      <span className="goal-symbol" aria-hidden="true">{closed?'✓':stats.finished?'✦':status==='weekend'?'☀':'○'}</span>
      <div><small>СЕГОДНЯ · {dayLabel(today)}</small><h2>{stats.finished?'Все задачи разобраны!':closed?'Дневная цель закрыта':status==='weekend'?'Выходной — без обязательной задачи':'Одна новая задача — уже хороший день'}</h2><p>{stats.finished?'Курс пройден. Можно возвращаться к сложным темам в своём темпе.':closed?'Можно остановиться здесь или разобрать ещё одну задачу.':status==='weekend'?`Следующая обязательная цель — ${dayLabel(upcoming)}.`:'Выберите задачу, разберите решение и отметьте её как разобранную.'}</p><span className="today-result">Новых задач сегодня: <strong data-testid="today-count">{stats.todayCount}</strong></span></div>
      {next&&<a className="practice-primary" href={`#/problem/${next.id}`}>{closed?'Следующая новая задача':'Выбрать новую задачу'} →</a>}
    </section>
    <div className="practice-stats">
      <section><span className="stat-caption">ОПЫТ И УРОВЕНЬ</span><div className="stat-value"><strong data-testid="xp-total">{stats.xp}</strong><span>XP</span><b>Уровень {stats.level}</b></div><div className="level-track" role="progressbar" aria-label="Опыт до следующего уровня" aria-valuenow={stats.levelProgress} aria-valuemin={0} aria-valuemax={500}><i style={{width:`${stats.levelProgress/5}%`}}/></div><p>{500-stats.levelProgress} XP до следующего уровня · 100 XP за новую задачу</p></section>
      <section><span className="stat-caption">СЕРИЯ БУДНЕЙ</span><div className="stat-value"><strong data-testid="streak-current">{stats.currentStreak}</strong><span>подряд</span><span className="streak-glyph" aria-hidden="true">↗</span></div><p>Лучшая серия: {stats.bestStreak}. Выходные не прерывают её.</p></section>
      <section><span className="stat-caption">НЕДЕЛЯ · {dayLabel(stats.week[0].date)}</span><div className="stat-value"><strong>{stats.finished?'✓':<>{stats.weeklyMet}<small> / {stats.weeklyTarget}</small></>}</strong><span>{stats.finished?'Курс пройден':'целей'}</span></div><div className="week-goals">{stats.week.map((day,i)=><span className={day.status} key={day.date} title={`${dayLabel(day.date)}: ${statusText[day.status]}`}><i>{day.status==='done'?'✓':day.status==='untracked'||day.status==='free'?'—':'·'}</i>{['Пн','Вт','Ср','Чт','Пт'][i]}</span>)}</div></section>
    </div>
    <div className="calendar-layout">
      <section className="calendar-panel" aria-label="Календарь выполнения задач">
        <header><h2>{format(`${month}-01`,{month:'long',year:'numeric'})}</h2><div><button aria-label="Предыдущий месяц" onClick={()=>setMonth(m=>shiftMonth(m,-1))}>‹</button><button className="month-now" aria-label="Текущий месяц" onClick={()=>{setMonth(today.slice(0,7));setSelected(today);}}>Сегодня</button><button aria-label="Следующий месяц" onClick={()=>setMonth(m=>shiftMonth(m,1))}>›</button></div></header>
        <div className="calendar-weekdays">{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d=><span key={d}>{d}</span>)}</div>
        <div className="calendar-days">{monthCells(month).map(day=>{
          const state=dayStatus(progress,day,today,stats.finishedOn),count=counts[day]??0;
          return <button key={day} data-date={day} data-status={state} className={`calendar-day ${day.slice(0,7)!==month?'other-month':''} ${day===today?'is-today':''} ${day===selected?'is-selected':''}`} aria-pressed={day===selected} aria-label={`${dayLabel(day)}: ${statusText[state]}${count?`, новых задач: ${count}`:''}`} onClick={()=>setSelected(day)}><span>{Number(day.slice(8))}</span><i aria-hidden="true">{count?'✓':state==='pending'?'○':state==='missed'?'·':''}</i>{count>0&&<small>{count}</small>}</button>;
        })}</div>
        <div className="calendar-legend"><span><i className="done"/>Новая задача закрыта</span><span><i className="pending"/>Цель на сегодня</span><span><i className="weekend"/>Выходной</span></div>
      </section>
      <aside className="day-details"><small>ИСТОРИЯ ПРАКТИКИ</small><h2>{dayLabel(selected)}</h2><span className={`day-status status-${selectedStatus}`}>{statusText[selectedStatus]}</span>{records.length?<ul>{records.map(l=><li key={l.id}><a href={`#/problem/${l.id}`}><span>✓</span><div><strong>{l.ru}</strong><small>{chapters[l.chapter-1].ru} · +100 XP</small></div><b>↗</b></a></li>)}</ul>:<p>{selectedStatus==='untracked'?'В этот день календарь ещё не вёлся.':selectedStatus==='weekend'?'Отдыхать можно. Любая новая задача в выходной принесёт XP.':selectedStatus==='free'?'Обязательных новых задач больше нет.':'Здесь появятся задачи, впервые отмеченные разобранными в этот день.'}</p>}<div className="day-rule"><strong>Что считается новой задачей?</strong><p>Первое закрытие засчитывается один раз. Повторение и снятие отметки не меняют дату первого закрытия и не приносят XP повторно.</p></div></aside>
    </div>
    <section className="achievements-panel"><header><div><h2>Достижения</h2><p>Награды за регулярность и понимание, а не за скорость.</p></div><span>{stats.achievements.filter(a=>a.earned).length} / {stats.achievements.length}</span></header><div className="achievement-grid">{stats.achievements.map(a=><div className={`achievement ${a.earned?'earned':''}`} key={a.id}><span className="achievement-symbol" aria-hidden="true">{a.symbol}</span><div><strong>{a.title}</strong><p>{a.description}</p><small>{a.earned?'Получено ✓':'Ещё впереди'}</small></div></div>)}</div></section>
    <div className="practice-footnote"><p>Прогресс сохраняется только в этом браузере. Начало учёта: {dayLabel(progress.startedOn)}. Даты определяются часовым поясом устройства.</p>{undated>0&&<p>Ранее разобрано без даты: <strong data-testid="undated-count">{undated}</strong>. Эти задачи сохранены в общем прогрессе и XP, но не заполняют календарь задним числом.</p>}</div>
  </article>;
}
