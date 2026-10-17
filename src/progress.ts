export type StudyProgress = {
  version: 2;
  startedOn: string;
  completed: string[];
  firstCompletions: Record<string, string | null>;
};
export type DayStatus = 'done' | 'bonus' | 'missed' | 'pending' | 'planned' | 'weekend' | 'untracked';
export type PracticeChapter = { id: number; lessonIds: string[] };

const isoDay = (date: Date) => date.toISOString().slice(0, 10);
const utcDate = (day: string) => new Date(`${day}T12:00:00Z`);
const validDay = (day: unknown): day is string => typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(utcDate(day).getTime()) && isoDay(utcDate(day)) === day;
const weekday = (day: string) => utcDate(day).getUTCDay();
const isWorkday = (day: string) => weekday(day) !== 0 && weekday(day) !== 6;
const parse = (raw: string | null): unknown => { try { return raw ? JSON.parse(raw) : null; } catch { return null; } };
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function shiftDay(day: string, delta: number): string {
  const date = utcDate(day);
  date.setUTCDate(date.getUTCDate() + delta);
  return isoDay(date);
}
export function shiftMonth(month: string, delta: number): string {
  const date = utcDate(`${month}-01`);
  date.setUTCMonth(date.getUTCMonth() + delta);
  return isoDay(date).slice(0, 7);
}
export function monthCells(month: string): string[] {
  const first = `${month}-01`;
  const monday = shiftDay(first, -((weekday(first) + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => shiftDay(monday, i));
}
export function parseProgress(raw: string | null, legacy: string | null, today: string, knownIds: string[]): StudyProgress {
  const saved = parse(raw), old = parse(legacy), known = new Set(knownIds);
  const record = object(saved) && saved.version === 2 ? saved : null;
  const marks = record?.completed ?? old;
  const completed = Array.isArray(marks) ? [...new Set(marks.filter((id): id is string => typeof id === 'string' && known.has(id)))] : [];
  const firstCompletions: Record<string, string | null> = {};
  if (record && object(record.firstCompletions)) {
    for (const [id, date] of Object.entries(record.firstCompletions)) {
      if (known.has(id) && (date === null || validDay(date))) firstCompletions[id] = date;
    }
  }
  for (const id of completed) if (!Object.hasOwn(firstCompletions, id)) firstCompletions[id] = null;
  let startedOn = record && validDay(record.startedOn) && record.startedOn <= today ? record.startedOn : today;
  for (const date of Object.values(firstCompletions)) if (date && date < startedOn) startedOn = date;
  return { version: 2, startedOn, completed, firstCompletions };
}
export function toggleLesson(progress: StudyProgress, id: string, today: string): StudyProgress {
  const completed = new Set(progress.completed), firstCompletions = { ...progress.firstCompletions };
  if (completed.has(id)) completed.delete(id);
  else {
    completed.add(id);
    if (!Object.hasOwn(firstCompletions, id)) firstCompletions[id] = today;
  }
  return { ...progress, completed: [...completed], firstCompletions };
}
export function dailyCounts(progress: StudyProgress): Record<string, number> {
  const result: Record<string, number> = {};
  for (const date of Object.values(progress.firstCompletions)) if (date) result[date] = (result[date] ?? 0) + 1;
  return result;
}
export function goalStart(progress: StudyProgress): string {
  let date = progress.startedOn;
  while (!isWorkday(date)) date = shiftDay(date, 1);
  return date;
}
export function dayStatus(progress: StudyProgress, day: string, today: string): DayStatus {
  if (day < progress.startedOn) return 'untracked';
  if (day > today) return isWorkday(day) ? 'planned' : 'weekend';
  const count = dailyCounts(progress)[day] ?? 0;
  if (count) return isWorkday(day) ? 'done' : 'bonus';
  if (!isWorkday(day)) return 'weekend';
  return day === today ? 'pending' : 'missed';
}
export function practiceStats(progress: StudyProgress, today: string, chapters: PracticeChapter[]) {
  const counts = dailyCounts(progress);
  let currentStreak = 0, bestStreak = 0;
  for (let day = goalStart(progress); day <= today; day = shiftDay(day, 1)) {
    if (!isWorkday(day)) continue;
    if (counts[day]) { currentStreak++; bestStreak = Math.max(bestStreak, currentStreak); }
    else if (day !== today) currentStreak = 0;
  }
  const basis = goalStart(progress) > today ? goalStart(progress) : today;
  const monday = shiftDay(basis, -((weekday(basis) + 6) % 7));
  const week = Array.from({ length: 5 }, (_, i) => {
    const date = shiftDay(monday, i);
    return { date, count: counts[date] ?? 0, status: dayStatus(progress, date, today) };
  });
  const total = Object.keys(progress.firstCompletions).length, xp = total * 100;
  const achievements = [
    { id: 'first', symbol: '✦', title: 'Первый шаг', description: 'Разобрать первую задачу', earned: total >= 1 },
    { id: 'ten', symbol: '10', title: 'Вхожу в ритм', description: 'Разобрать 10 разных задач', earned: total >= 10 },
    { id: 'streak', symbol: '↗', title: 'Рабочая серия', description: 'Закрыть цель 5 будней подряд', earned: bestStreak >= 5 },
    { id: 'chapter', symbol: '◇', title: 'Паттерн освоен', description: 'Разобрать все задачи одной главы', earned: chapters.some(ch => ch.lessonIds.length > 0 && ch.lessonIds.every(id => Object.hasOwn(progress.firstCompletions, id))) },
  ];
  return { total, xp, level: Math.floor(xp / 500) + 1, levelProgress: xp % 500, currentStreak, bestStreak, todayCount: counts[today] ?? 0,
    week, weeklyMet: week.filter(day => day.status === 'done').length, weeklyTarget: week.filter(day => day.status !== 'untracked').length, achievements };
}
