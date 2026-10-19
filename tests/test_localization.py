import copy
import re
import unittest

class LocalizationTests(unittest.TestCase):
    def test_all_curriculum_material_has_complete_english_without_changing_examples(self):
        from curriculum.catalog import CHAPTERS, LESSONS
        from curriculum.english import localize_catalog
        chapters, lessons = localize_catalog(CHAPTERS, LESSONS)
        self.assertEqual(len(chapters), 19)
        self.assertEqual(len(lessons), 101)
        for original, translated in zip(LESSONS, lessons):
            self.assertEqual(original['id'], translated['id'])
            self.assertEqual(original['examples'], translated['examples'])
            for key in ('ru', 'statement', 'idea', 'time', 'space'):
                self.assertNotRegex(translated[key], '[А-Яа-яЁё]', (original['id'], key))
        for ch in chapters:
            self.assertNotRegex(str(ch), '[А-Яа-яЁё]')
            self.assertGreaterEqual(len(ch['guide']['example']['trace']), 3)

    def test_missing_translation_fails_instead_of_silently_showing_russian(self):
        from curriculum.catalog import CHAPTERS, LESSONS
        from curriculum.english import localize_catalog
        changed=copy.deepcopy(LESSONS)
        changed[0]['id']='new_untranslated_lesson'
        with self.assertRaises(ValueError):
            localize_catalog(CHAPTERS, changed)

    def test_trace_messages_are_bilingual_and_share_identical_states(self):
        from curriculum.catalog import LESSONS
        from curriculum.runtime import compile_lesson
        payload=compile_lesson(next(l for l in LESSONS if l['id']=='insertion_index'))
        for example in payload['examples']:
            for frame in example['frames']:
                self.assertIn('messageEn', frame)
                self.assertNotRegex(frame['messageEn'], '[А-Яа-яЁё]')
        self.assertEqual(payload['examples'][0]['frames'][-1]['result'], 1)
