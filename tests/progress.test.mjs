import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProgress, toggleLesson, localDay, shiftDay, monthCells, shiftMonth, dayStatus, practiceStats } from '../src/progress.ts';

const ids=['a','b','c','d','e','f','g','h','i','j'];
const fresh=(day='2026-10-19')=>parseProgress(null,null,day,ids);
const stats=(p,day)=>practiceStats(p,day,[{id:1,lessonIds:['a','b']},{id:2,lessonIds:ids.slice(2)}]);

test('legacy marks retain XP without invented dates or daily credit',()=>{
  let p=parseProgress(null,'["a","a","unknown"]','2026-10-19',ids);
  assert.deepEqual(p.completed,['a']);
  assert.equal(p.firstCompletions.a,null);
  assert.equal(stats(p,'2026-10-19').xp,100);
  assert.equal(stats(p,'2026-10-19').todayCount,0);
  p=toggleLesson(toggleLesson(p,'a','2026-10-19'),'a','2026-10-20');
  assert.equal(p.firstCompletions.a,null);
  assert.equal(stats(p,'2026-10-20').todayCount,0);
});
test('first completion closes the weekday goal and repeat toggles award nothing',()=>{
  let p=toggleLesson(fresh(),'a','2026-10-19');
  assert.equal(dayStatus(p,'2026-10-19','2026-10-19'),'done');
  assert.equal(stats(p,'2026-10-19').xp,100);
  p=toggleLesson(p,'a','2026-10-19');
  assert.deepEqual(p.completed,[]);
  p=toggleLesson(p,'a','2026-10-20');
  assert.equal(p.firstCompletions.a,'2026-10-19');
  assert.equal(stats(p,'2026-10-20').todayCount,0);
  assert.equal(stats(p,'2026-10-20').xp,100);
});
test('two new tasks on one day count as one successful weekday',()=>{
  const p=toggleLesson(toggleLesson(fresh(),'a','2026-10-19'),'b','2026-10-19');
  const s=stats(p,'2026-10-19');
  assert.equal(s.todayCount,2);
  assert.equal(s.currentStreak,1);
  assert.equal(s.weeklyMet,1);
  assert.equal(s.weeklyTarget,5);
});
test('weekends neither extend nor break a weekday streak',()=>{
  let p=fresh('2026-10-23');
  for(const [id,day] of [['a','2026-10-23'],['b','2026-10-24'],['c','2026-10-26']])p=toggleLesson(p,id,day);
  assert.equal(dayStatus(p,'2026-10-24','2026-10-26'),'bonus');
  assert.equal(stats(p,'2026-10-25').currentStreak,1);
  assert.equal(stats(p,'2026-10-26').currentStreak,2);
  assert.equal(stats(p,'2026-10-26').xp,300);
});
test('pending today preserves the streak but a missed prior weekday resets it',()=>{
  const p=toggleLesson(fresh('2026-10-23'),'a','2026-10-23');
  assert.equal(stats(p,'2026-10-26').currentStreak,1);
  assert.equal(dayStatus(p,'2026-10-26','2026-10-26'),'pending');
  assert.equal(dayStatus(p,'2026-10-26','2026-10-27'),'missed');
  assert.equal(stats(p,'2026-10-27').currentStreak,0);
  assert.equal(stats(p,'2026-10-27').bestStreak,1);
});
test('tracking begins without retroactive missed weekdays and weekends stay optional',()=>{
  const p=fresh('2026-10-17');
  assert.equal(dayStatus(p,'2026-10-16','2026-10-17'),'untracked');
  assert.equal(dayStatus(p,'2026-10-17','2026-10-17'),'weekend');
  assert.equal(dayStatus(p,'2026-10-19','2026-10-17'),'planned');
  const s=stats(p,'2026-10-17');
  assert.equal(s.week[0].date,'2026-10-19');
  assert.equal(s.weeklyTarget,5);
});
test('damaged records fall back safely and valid history survives a reload',()=>{
  assert.deepEqual(parseProgress('{broken','["b"]','2026-10-19',ids).completed,['b']);
  const p=toggleLesson(fresh(),'a','2026-10-19');
  assert.deepEqual(parseProgress(JSON.stringify(p),null,'2026-10-20',ids),p);
  const bad=parseProgress(JSON.stringify({version:2,startedOn:'2026-02-30',completed:['a','unknown','a'],firstCompletions:{a:'2026-02-30',unknown:'2026-10-19'}}),null,'2026-10-19',ids);
  assert.deepEqual(bad.completed,['a']);
  assert.equal(bad.firstCompletions.a,null);
  assert.equal(bad.startedOn,'2026-10-19');
});
test('calendar arithmetic handles local dates, leap days and year boundaries',()=>{
  assert.equal(localDay(new Date(2026,2,29,23,59)),'2026-03-29');
  assert.equal(shiftDay('2028-02-28',1),'2028-02-29');
  assert.equal(shiftDay('2028-02-29',1),'2028-03-01');
  assert.equal(shiftDay('2026-12-31',1),'2027-01-01');
  assert.equal(shiftMonth('2026-12',1),'2027-01');
  assert.equal(shiftMonth('2027-01',-1),'2026-12');
  const cells=monthCells('2028-02');
  assert.equal(cells.length,42);
  assert.equal(cells[0],'2028-01-31');
  assert.ok(cells.includes('2028-02-29'));
});
test('levels and earned achievements use unique tasks and the best weekday streak',()=>{
  let p=fresh();
  for(const [id,day] of [['a','2026-10-19'],['b','2026-10-20'],['c','2026-10-21'],['d','2026-10-22'],['e','2026-10-23']])p=toggleLesson(p,id,day);
  const s=stats(p,'2026-10-23');
  assert.equal(s.xp,500);
  assert.equal(s.level,2);
  assert.equal(s.levelProgress,0);
  assert.equal(s.bestStreak,5);
  assert.deepEqual(s.achievements.filter(a=>a.earned).map(a=>a.id),['first','streak','chapter']);
  for(const id of ids.slice(5))p=toggleLesson(p,id,'2026-10-24');
  assert.equal(stats(p,'2026-10-24').achievements.find(a=>a.id==='ten').earned,true);
});
