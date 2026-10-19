import { useEffect, useLayoutEffect, useState } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
const valid = (value: string | null): value is ThemePreference => value === 'system' || value === 'light' || value === 'dark';
const read = (): ThemePreference => {
  try { const value = localStorage.getItem('patterns-theme'); return valid(value) ? value : 'system'; }
  catch { return 'system'; }
};

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(read);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const resolved = preference === 'system' ? systemDark ? 'dark' : 'light' : preference;
  useLayoutEffect(() => { document.documentElement.dataset.theme = resolved; }, [resolved]);
  useEffect(() => { try { localStorage.setItem('patterns-theme', preference); } catch { /* Theme remains available in memory. */ } }, [preference]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    const receive = (event: StorageEvent) => { if (event.key === 'patterns-theme') setPreference(valid(event.newValue) ? event.newValue : 'system'); };
    update();
    media.addEventListener('change', update);
    window.addEventListener('storage', receive);
    return () => { media.removeEventListener('change', update); window.removeEventListener('storage', receive); };
  }, []);
  return { preference, setPreference, resolved };
}
