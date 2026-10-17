import copy
import importlib
import json
import unittest


class CurriculumTests(unittest.TestCase):
    def test_all_book_problems_have_correct_executable_examples(self):
        from curriculum.catalog import CHAPTERS, LESSONS
        self.assertEqual(len(CHAPTERS), 19)
        counts = [sum(p['chapter'] == i for p in LESSONS) for i in range(1, 20)]
        self.assertEqual(counts, [6, 5, 6, 3, 3, 8, 6, 4, 3, 3, 12, 3, 10, 5, 9, 3, 4, 3, 5])
        self.assertEqual(len({p['id'] for p in LESSONS}), 101)
        for p in LESSONS:
            with self.subTest(problem=p['id']):
                self.assertGreaterEqual(len(p['examples']), 4)
                self.assertEqual(len({json.dumps(e['args'], sort_keys=True) for e in p['examples']}), len(p['examples']), p['id'])
                fn = getattr(importlib.import_module(f"curriculum.ch{p['chapter']:02}"), p['id'])
                for example in p['examples']:
                    self.assertEqual(fn(**copy.deepcopy(example['args'])), example['expected'], (p['id'], example))

    def test_every_pattern_has_an_actionable_guide_and_worked_example(self):
        from curriculum.catalog import CHAPTERS
        for chapter in CHAPTERS:
            with self.subTest(chapter=chapter['id']):
                guide = chapter.get('guide', {})
                self.assertTrue(guide.get('intuition'))
                self.assertGreaterEqual(len(guide.get('signals', [])), 2)
                self.assertGreaterEqual(len(guide.get('steps', [])), 3)
                self.assertTrue(guide.get('compare'))
                self.assertGreaterEqual(len(guide.get('pitfalls', [])), 2)
                example = guide.get('example', {})
                self.assertTrue(example.get('input'))
                self.assertGreaterEqual(len(example.get('trace', [])), 3)
                self.assertTrue(example.get('answer'))


if __name__ == '__main__':
    unittest.main()
