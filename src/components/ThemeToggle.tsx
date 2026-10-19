import type { ThemePreference } from '../useTheme';

export default function ThemeToggle({ value, onChange }: { value: ThemePreference; onChange: (value: ThemePreference) => void }) {
  return <label className="theme-toggle">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>
    <select aria-label="Оформление" value={value} onChange={event => onChange(event.target.value as ThemePreference)}>
      <option value="system">Системная</option><option value="light">Светлая</option><option value="dark">Тёмная</option>
    </select>
  </label>;
}
