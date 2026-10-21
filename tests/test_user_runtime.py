import copy
import importlib
import inspect
import unittest


class UserRuntimeTests(unittest.TestCase):
    def run_code(self, source, args=None, expected=None, **kwargs):
        from curriculum.user_runtime import run_solution
        return run_solution(source, 'solve', args or {}, expected, **kwargs)

    def test_real_locals_helpers_and_return(self):
        result = self.run_code('def helper(x):\n    doubled = x * 2\n    return doubled\ndef solve(values):\n    answer = helper(values[0])\n    return answer\n', {'values': [3]}, 6)
        self.assertTrue(result['passed'])
        self.assertEqual(result['result'], 6)
        self.assertTrue(any(f['state'].get('doubled') == 6 for f in result['frames']))
        self.assertTrue(any(len(f['calls']) == 2 for f in result['frames']))
        self.assertTrue(result['frames'][-1]['done'])
        self.assertTrue(all(1 <= f['line'] <= 6 for f in result['frames']))

    def test_wrong_answer_and_error_keep_actual_trace(self):
        wrong = self.run_code('def solve():\n    return 9\n', expected=1)
        self.assertFalse(wrong['passed'])
        self.assertEqual(wrong['result'], 9)
        error = self.run_code('def solve():\n    value = 3\n    return value / 0\n')
        self.assertEqual(error['error']['type'], 'ZeroDivisionError')
        self.assertEqual(error['error']['line'], 3)
        self.assertTrue(error['frames'])
        self.assertFalse(any(f['done'] for f in error['frames']))

    def test_bad_source_and_contract(self):
        self.assertEqual(self.run_code('def solve(:')['error']['type'], 'SyntaxError')
        self.assertEqual(self.run_code('x = 1')['error']['type'], 'NameError')
        self.assertEqual(self.run_code('def solve(other): return other', {'value': 1})['error']['type'], 'TypeError')

    def test_limit_preserves_partial_trace_and_never_passes(self):
        result = self.run_code('def solve():\n    while True:\n        pass\n', frame_limit=12)
        self.assertEqual(result['error']['type'], 'TraceLimitError')
        self.assertFalse(result['passed'])
        self.assertLessEqual(len(result['frames']), 12)

    def test_caught_trace_limit_cannot_mark_incomplete_replay_successful(self):
        source = 'def solve():\n    try:\n        for value in range(30):\n            pass\n    except Exception:\n        return 7\n'
        result = self.run_code(source, expected=7, frame_limit=5)
        self.assertFalse(result['passed'])
        self.assertEqual(result['error']['type'], 'TraceLimitError')
        self.assertFalse(any(frame['done'] for frame in result['frames']))

    def test_mutated_node_metadata_stays_serializable(self):
        import json
        source = 'def solve():\n    from curriculum.structures import Node\n    node = Node(1)\n    node.end = {1}\n    node.kind = ["custom"]\n    node.id = {"custom": 1}\n    return 1\n'
        result = self.run_code(source, expected=1)
        self.assertIsNone(result['error'])
        self.assertTrue(result['passed'])
        json.dumps(result, allow_nan=False)
        self.assertEqual(result['frames'][-1]['nodes'][0]['end'], [1])

    def test_isolation_input_copy_and_stdout(self):
        args = {'values': [1, 2]}
        source = 'count = 0\ndef solve(values):\n    global count\n    count += 1\n    values.append(count)\n    print("hello")\n    return values\n'
        for _ in range(2):
            result = self.run_code(source, args, [1, 2, 1])
            self.assertTrue(result['passed'])
            self.assertEqual(result['stdout'], 'hello\n')
        self.assertEqual(args, {'values': [1, 2]})

    def test_bounded_cycles_output_and_full_result_comparison(self):
        source = 'def solve():\n    values = list(range(500))\n    loop = []\n    loop.append(loop)\n    print("x" * 40000)\n    return values\n'
        result = self.run_code(source, expected=list(range(500)))
        self.assertTrue(result['passed'])
        self.assertTrue(result['notices'])
        self.assertLessEqual(len(result['stdout']), 32768)
        self.assertLessEqual(len(result['frames'][-1]['result']), 201)

    def test_all_404_existing_reference_functions(self):
        from curriculum.catalog import LESSONS
        from curriculum.user_runtime import run_solution
        for lesson in LESSONS:
            function = getattr(importlib.import_module(f"curriculum.ch{lesson['chapter']:02}"), lesson['id'])
            source = inspect.getsource(function)
            for example in lesson['examples']:
                with self.subTest(lesson=lesson['id'], example=example['label']):
                    original = copy.deepcopy(example['args'])
                    result = run_solution(source, lesson['id'], example['args'], example['expected'])
                    self.assertIsNone(result['error'])
                    self.assertTrue(result['passed'])
                    self.assertEqual(example['args'], original)


if __name__ == '__main__':
    unittest.main()
