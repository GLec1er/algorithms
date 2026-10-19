"""Generate static lesson payloads; wrong results make the build fail."""
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from curriculum.catalog import CHAPTERS, LESSONS
from curriculum.runtime import compile_lesson
from curriculum.english import localize_catalog


def build():
    counts = [sum(p['chapter'] == i for p in LESSONS) for i in range(1, 20)]
    assert counts == [6,5,6,3,3,8,6,4,3,3,12,3,10,5,9,3,4,3,5]
    assert len({p['id'] for p in LESSONS}) == 101
    target = ROOT / 'public' / 'lessons'
    target.mkdir(parents=True, exist_ok=True)
    examples = states = 0
    for lesson in LESSONS:
        assert len(lesson['examples']) >= 4
        payload = compile_lesson(lesson)
        for example in payload['examples']:
            frames = example['frames']
            assert len(frames) > 1 and frames[-1]['done']
            assert example['labelEn'] and not re.search('[А-Яа-яЁё]', example['labelEn'])
            assert all(f['messageEn'] and not re.search('[А-Яа-яЁё]', f['messageEn']) for f in frames)
            assert all(1 <= f['line'] <= len(payload['code'].splitlines()) for f in frames)
            examples += 1
            states += len(frames)
        (target / f"{lesson['id']}.json").write_text(json.dumps(payload, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n', encoding='utf-8')
    english_chapters, english_lessons = localize_catalog(CHAPTERS, LESSONS)
    catalog = dict(english=dict(chapters=english_chapters, lessons=[{k:v for k,v in p.items() if k != 'examples'} for p in english_lessons]), chapters=CHAPTERS, lessons=[{k:v for k,v in p.items() if k != 'examples'} for p in LESSONS], stats=dict(chapters=19, lessons=101, examples=examples, states=states))
    (ROOT / 'src' / 'catalog.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Compiled 19 chapters, 101 lessons, {examples} checked examples, {states} Python states.')


if __name__ == '__main__':
    build()
