import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { useTheme } from '../useTheme';
import ThemeToggle from './ThemeToggle';
import Icon from './Icon';

export default function AppShell({ activeRoute, catalog, children, completedCount, lessonCount }: {
  activeRoute: string; catalog: ReactNode; children: ReactNode; completedCount: number; lessonCount: number;
}) {
  const theme = useTheme();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [opened, setOpened] = useState(false);
  const lastLesson = useRef(activeRoute !== 'calendar' && activeRoute !== 'unknown' ? activeRoute : 'insertion_index');
  if (activeRoute !== 'calendar' && activeRoute !== 'unknown') lastLesson.current = activeRoute;
  const close = () => dialog.current?.close();
  useEffect(() => { dialog.current?.close(); }, [activeRoute]);
  function open() {
    dialog.current?.showModal();
    setOpened(true);
    dialog.current?.querySelector('input')?.focus();
  }
  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#/problem/insertion_index" aria-label="Algorithms Lab">
        <span className="brand-mark"><svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="m14 11-8 9 8 9m12-18 8 9-8 9M22 8l-4 24"/></svg></span>
        <span className="brand-word">Algorithms <b>Lab</b><small>CODING INTERVIEW PATTERNS</small></span>
      </a>
      <button className="catalog-trigger" ref={opener} onClick={open} aria-label="Открыть каталог" aria-haspopup="dialog" aria-expanded={opened} aria-controls="lesson-catalog"><Icon name="menu"/><span>Каталог</span></button>
      <nav className="section-switch" aria-label="Разделы приложения">
        <a href={`#/problem/${lastLesson.current}`} aria-current={activeRoute !== 'calendar' ? 'page' : undefined}>Практика</a>
        <a href="#/calendar" aria-label="Календарь практики" aria-current={activeRoute === 'calendar' ? 'page' : undefined}>Календарь</a>
      </nav>
      <div className="topbar-right">
        <span className="local-progress" title="Отметки сохраняются в этом браузере"><span className="progress-ring" style={{ '--progress': `${completedCount / lessonCount * 100}%` } as CSSProperties}/><span><strong>{completedCount}</strong><span> / {lessonCount}</span></span></span>
        <ThemeToggle value={theme.preference} onChange={theme.setPreference}/>
        <a className="github-link" href="https://github.com/GLec1er/algorithms" target="_blank" rel="noreferrer" aria-label="Репозиторий GitHub"><Icon name="github"/></a>
      </div>
    </header>
    <dialog id="lesson-catalog" className="catalog-dialog" ref={dialog} aria-label="Каталог задач" onClose={() => { setOpened(false); opener.current?.focus({preventScroll:true}); }} onClick={event => {
      const target=event.target as HTMLElement;
      if(target.closest('a[href^="#/"]')) close();
      if(target === dialog.current) {
        const bounds=dialog.current.getBoundingClientRect();
        if(event.clientX<bounds.left || event.clientX>bounds.right || event.clientY<bounds.top || event.clientY>bounds.bottom) close();
      }
    }}>
      <div className="catalog-heading"><div><span className="eyebrow">ТВОЯ БИБЛИОТЕКА</span><h2>Паттерны и задачи</h2></div><button onClick={close} aria-label="Закрыть каталог">×</button></div>
      {catalog}
    </dialog>
    {children}
  </div>;
}
