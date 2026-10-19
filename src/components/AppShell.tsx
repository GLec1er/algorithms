import { t } from '../locale';
import { useEffect, useRef, useState, type ReactNode, type CSSProperties, type MouseEvent } from 'react';
import { useTheme } from '../useTheme';
import ThemeToggle from './ThemeToggle';
import {LanguageToggle} from '../i18n';
import Icon from './Icon';

export default function AppShell({ activeRoute, catalog, children, completedCount, lessonCount }: {
  activeRoute: string; catalog: ReactNode; children: ReactNode; completedCount: number; lessonCount: number;
}) {
  const theme = useTheme();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [opened, setOpened] = useState(false);
  const lastLesson = useRef(activeRoute !== 'calendar' && activeRoute !== 'unknown' && activeRoute !== 'home' ? activeRoute : 'insertion_index');
  if (activeRoute !== 'calendar' && activeRoute !== 'unknown' && activeRoute !== 'home') lastLesson.current = activeRoute;
  const close = () => dialog.current?.close();
  useEffect(() => { dialog.current?.close(); }, [activeRoute]);
  function open(event:MouseEvent<HTMLButtonElement>) {
    opener.current=event.currentTarget;
    dialog.current?.showModal();
    setOpened(true);
    dialog.current?.querySelector('input')?.focus();
  }
  return <div className="app-shell studio-shell">
    <aside className="studio-rail" aria-label={t('Разделы приложения')}>
      <a className="rail-brand" href="#/" aria-label="Algorithms Lab"><svg width="42" height="42" viewBox="0 0 42 42" fill="none" stroke="currentColor" aria-hidden="true"><path d="M13 6H7v30h6m16-30h6v30h-6" strokeWidth="3"/><circle cx="21" cy="21" r="2.5" strokeWidth="1"/></svg></a>
      <nav aria-label={t('Разделы приложения')}>
        <a href="#/" aria-label={t('На главную')} title={t('На главную')} aria-current={activeRoute==='home'?'page':undefined}><Icon name="home"/></a>
        <button onClick={open} aria-label={t('Открыть каталог')} title={t('Каталог')} aria-haspopup="dialog" aria-expanded={opened} aria-controls="lesson-catalog"><Icon name="library"/></button>
        <a href={`#/problem/${lastLesson.current}`} aria-label={t('Практика')} title={t('Практика')} aria-current={!['home','calendar','unknown'].includes(activeRoute)?'page':undefined}><Icon name="play"/></a>
        <a href="#/calendar" aria-label={t('Календарь практики')} title={t('Календарь')} aria-current={activeRoute==='calendar'?'page':undefined}><Icon name="calendar"/></a>
      </nav>
      <a className="rail-source" href="https://github.com/GLec1er/algorithms" target="_blank" rel="noreferrer" aria-label={t('Репозиторий GitHub')} title="GitHub"><Icon name="github"/></a>
    </aside>
    <header className="topbar">
      <a className="brand" href="#/" aria-label="Algorithms Lab">
        <span className="brand-mark"><svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="m14 11-8 9 8 9m12-18 8 9-8 9M22 8l-4 24"/></svg></span>
        <span className="brand-word">Algorithms <b>Lab</b><small>CODING INTERVIEW PATTERNS</small></span>
      </a>
      <button className="catalog-trigger" onClick={open} aria-label={t("Открыть каталог")} aria-haspopup="dialog" aria-expanded={opened} aria-controls="lesson-catalog"><Icon name="menu"/><span>{t("Каталог")}</span></button>
      <nav className="section-switch" aria-label={t("Разделы приложения")}>
        <a href={`#/problem/${lastLesson.current}`} aria-label={t("Практика")} title={t("Практика")} aria-current={activeRoute !== 'calendar' && activeRoute !== 'home' ? 'page' : undefined}><span className="nav-icon"><Icon name="play"/></span><span className="nav-label">{t("Практика")}</span></a>
        <a href="#/calendar" aria-label={t("Календарь практики")} title={t("Календарь практики")} aria-current={activeRoute === 'calendar' ? 'page' : undefined}><span className="nav-icon"><Icon name="calendar"/></span><span className="nav-label">{t("Календарь")}</span></a>
      </nav>
      <div className="topbar-right">
        <span className="local-progress" title={t("Отметки сохраняются в этом браузере")}><span className="progress-ring" style={{ '--progress': `${completedCount / lessonCount * 100}%` } as CSSProperties}/><span><strong>{completedCount}</strong><span> / {lessonCount}</span></span></span>
        <LanguageToggle/><ThemeToggle value={theme.preference} onChange={theme.setPreference}/>
        <a className="github-link" href="https://github.com/GLec1er/algorithms" target="_blank" rel="noreferrer" aria-label={t("Репозиторий GitHub")}><Icon name="github"/></a>
      </div>
    </header>
    <dialog id="lesson-catalog" className="catalog-dialog" ref={dialog} aria-label={t("Каталог задач")} onClose={() => { setOpened(false); opener.current?.focus({preventScroll:true}); }} onClick={event => {
      const target=event.target as HTMLElement;
      if(target.closest('a[href^="#/"]')) close();
      if(target === dialog.current) {
        const bounds=dialog.current.getBoundingClientRect();
        if(event.clientX<bounds.left || event.clientX>bounds.right || event.clientY<bounds.top || event.clientY>bounds.bottom) close();
      }
    }}>
      <div className="catalog-heading"><div><span className="eyebrow">{t("ТВОЯ БИБЛИОТЕКА")}</span><h2>{t("Паттерны и задачи")}</h2></div><button onClick={close} aria-label={t("Закрыть каталог")}>×</button></div>
      {catalog}
    </dialog>
    {children}
  </div>;
}
