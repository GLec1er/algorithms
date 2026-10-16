import copy
import importlib
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
                self.assertGreaterEqual(len(p['examples']), 2)
                fn = getattr(importlib.import_module(f"curriculum.ch{p['chapter']:02}"), p['id'])
                for example in p['examples']:
                    self.assertEqual(fn(**copy.deepcopy(example['args'])), example['expected'], (p['id'], example))


if __name__ == '__main__':
    unittest.main()
