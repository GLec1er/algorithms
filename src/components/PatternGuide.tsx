import { t } from '../locale';
import type { Chapter, Lesson } from '../types';
import { PatternGlyph } from './PatternGlyph';

export default function PatternGuide({chapter,lessons,current}:{chapter:Chapter;lessons:Lesson[];current:string}) {
  const guide=chapter.guide;
  return <details className="pattern-intro">
    <summary><span className="pattern-icon"><PatternGlyph chapter={chapter.id}/></span><div><small>{t("РАЗОБРАТЬ ПАТТЕРН")}</small><strong>{chapter.ru}</strong></div><span className="summary-label">{t("Подробное объяснение")}{' '}<span>↗</span></span></summary>
    <div className="pattern-body detailed-guide">
      <p className="guide-intuition">{guide.intuition}</p>
      <div className="guide-columns">
        <section><h2>{t("Как распознать")}</h2><ul>{guide.signals.map(text=><li key={text}>{text}</li>)}</ul></section>
        <section><h2>{t("План решения")}</h2><ol>{guide.steps.map(text=><li key={text}>{text}</li>)}</ol></section>
      </div>
      <div className="guide-invariant"><strong>{t("Инвариант")}</strong><p>{chapter.invariant}</p></div>
      <section className="guide-example"><h2>{t("Мини-разбор")}</h2><code>{guide.example.input}</code><ol>{guide.example.trace.map(text=><li key={text}>{text}</li>)}</ol><p className="guide-answer"><strong>{t("Ответ:")}</strong> <code>{guide.example.answer}</code></p></section>
      <div className="guide-columns">
        <section><h2>{t("Типичные ошибки")}</h2><ul>{guide.pitfalls.map(text=><li key={text}>{text}</li>)}</ul></section>
        <section><h2>{t("С чем сравнить")}</h2><p>{guide.compare}</p></section>
      </div>
      <h2>{t("Практика по этому паттерну")}</h2><div className="chapter-links">{lessons.filter(l=>l.chapter===chapter.id).map(l=><a key={l.id} href={`#/problem/${l.id}`} aria-current={l.id===current?'page':undefined}>{l.ru}</a>)}</div>
    </div>
  </details>;
}
