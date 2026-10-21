import type { ReactNode } from 'react';

export default function Icon({name}:{name:string}) {
  const paths:Record<string,ReactNode>={
    home:<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>,library:<><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></>,
    calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18m-12 4h2"/></>,play:<path d="m8 5 10 7-10 7Z"/>,pause:<><path d="M8 5v14M16 5v14"/></>,prev:<><path d="M5 5v14m13-14-9 7 9 7"/></>,next:<><path d="M19 5v14M6 5l9 7-9 7"/></>,reset:<><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/></>,arrow:<path d="M5 12h14m-6-6 6 6-6 6"/>,menu:<path d="M4 6h16M4 12h16M4 18h16"/>,search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,check:<path d="m5 12 4 4L19 6"/>,github:<><path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1 .1-1.7-.5-2.3 3.3-.4 6.5-1.6 6.5-7A5.5 5.5 0 0 0 19.5 5c.2-1 .1-2-.3-3-1.3 0-2.7.6-3.7 1.4a13 13 0 0 0-7 0A7 7 0 0 0 4.8 2a6 6 0 0 0-.3 3A5.5 5.5 0 0 0 3 8.7c0 5.4 3.2 6.6 6.5 7C9 16.3 9 17 9 18v4"/></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
