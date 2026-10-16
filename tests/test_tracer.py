import unittest


class TraceTests(unittest.TestCase):
    def test_cycles_keep_stable_node_identity(self):
        from curriculum.catalog import LESSONS
        from curriculum.runtime import compile_lesson
        payload = compile_lesson(next(p for p in LESSONS if p['id'] == 'linked_loop'))
        example = payload['examples'][0]
        final = example['frames'][-1]
        self.assertEqual([n['id'] for n in final['nodes']], [0, 1, 2, 3])
        self.assertEqual(final['nodes'][3]['next'], {'ref': 1})
        self.assertEqual(final['result'], True)
        self.assertEqual(payload, compile_lesson(next(p for p in LESSONS if p['id'] == 'linked_loop')))

    def test_step_limit_fails_instead_of_hanging_or_publishing_truncated_lesson(self):
        from curriculum.runtime import trace, TraceLimitError
        from curriculum.ch06 import insertion_index
        with self.assertRaises(TraceLimitError):
            trace(insertion_index, {'a': [1, 3, 5], 'target': 4}, limit=2)

    def test_every_example_has_valid_replayable_python_frames(self):
        from curriculum.catalog import LESSONS
        from curriculum.runtime import compile_lesson
        for lesson in LESSONS:
            with self.subTest(problem=lesson['id']):
                payload = compile_lesson(lesson)
                for example in payload['examples']:
                    frames = example['frames']
                    self.assertGreater(len(frames), 1)
                    self.assertLessEqual(len(frames), 1801)
                    self.assertTrue(frames[-1]['done'])
                    self.assertEqual(frames[-1]['result'], example['expected'])
                    self.assertTrue(all(1 <= f['line'] <= len(payload['code'].splitlines()) for f in frames))
                    self.assertFalse(frames[0]['done'])

    def test_trace_does_not_mutate_example_input(self):
        from curriculum.runtime import compile_lesson
        from curriculum.catalog import LESSONS
        import copy
        original = copy.deepcopy(LESSONS)
        for lesson in LESSONS:
            compile_lesson(lesson)
        self.assertEqual(LESSONS, original)


if __name__ == '__main__':
    unittest.main()
