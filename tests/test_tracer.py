import unittest


class TraceTests(unittest.TestCase):
    def test_minimum_spanning_tree_records_actual_selected_edges(self):
        from curriculum.runtime import trace
        from curriculum.ch13 import connect_dots
        recorded = trace(connect_dots, {'points': [[0, 0], [2, 2], [3, 1]]})
        final = recorded['frames'][-1]
        self.assertEqual(final['state']['chosen'], [[0, 1], [1, 2]])
        self.assertEqual(final['result'], 6)

    def test_swapping_array_values_moves_element_identity(self):
        from curriculum.runtime import trace
        from curriculum.ch01 import shift_zeros
        recorded = trace(shift_zeros, {'a': [0, 7, 0, 3]})
        first = recorded['frames'][0]
        final = recorded['frames'][-1]
        self.assertEqual(final['state']['a'], [7, 3, 0, 0])
        self.assertEqual(final['arrays']['a'][0], first['arrays']['a'][1])
        self.assertEqual(final['arrays']['a'][1], first['arrays']['a'][3])

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
