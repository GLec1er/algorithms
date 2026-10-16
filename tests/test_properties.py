"""Independent small-domain checks; expectations use brute-force definitions."""
import itertools
import unittest


class AlgorithmProperties(unittest.TestCase):
    def test_insertion_boundaries_with_duplicates_and_empty_arrays(self):
        from curriculum.ch06 import insertion_index, first_last
        for n in range(5):
            for a in itertools.combinations_with_replacement(range(3), n):
                for target in range(-1, 4):
                    expected = sum(x < target for x in a)
                    self.assertEqual(insertion_index(list(a), target), expected)
                    matches = [i for i, x in enumerate(a) if x == target]
                    self.assertEqual(first_last(list(a), target), [matches[0], matches[-1]] if matches else [-1, -1])

    def test_stack_window_and_prefix_answers_against_enumeration(self):
        from curriculum.ch07 import next_largest, window_maximum
        from curriculum.ch10 import k_sum_subarrays
        for a in itertools.product(range(-1, 2), repeat=4):
            self.assertEqual(next_largest(list(a)), [next((y for y in a[i+1:] if y>x), -1) for i,x in enumerate(a)])
            for k in range(1, 5):
                self.assertEqual(window_maximum(list(a), k), [max(a[i:i+k]) for i in range(5-k)])
            for k in range(-2, 3):
                count=sum(sum(a[i:j])==k for i in range(4) for j in range(i+1,5))
                self.assertEqual(k_sum_subarrays(list(a), k), count)

    def test_half_open_interval_sweep_and_closed_merging(self):
        from curriculum.ch09 import largest_overlap, merge_intervals
        intervals=[[0,2],[2,4],[1,3]]
        self.assertEqual(largest_overlap(intervals), 2)
        self.assertEqual(merge_intervals(intervals.copy()), [[0,4]])
        self.assertEqual(largest_overlap([]), 0)

    def test_triangle_rule_matches_actual_three_neighbor_construction(self):
        from curriculum.ch19 import triangle_numbers
        row=[1]
        for n in range(2, 30):
            padded=[0,0]+row+[0,0]
            row=[sum(padded[i:i+3]) for i in range(len(row)+2)]
            if n >= 3:
                self.assertEqual(triangle_numbers(n), next(i+1 for i,x in enumerate(row) if x%2==0))

    def test_tree_validation_checks_ancestors_and_negative_paths(self):
        from curriculum.ch11 import validate_bst, maximum_tree_path
        self.assertFalse(validate_bst([10,5,15,None,None,6,20]))
        self.assertFalse(validate_bst([2,2,3]))
        self.assertEqual(maximum_tree_path([-5,-2,-9]), -2)


if __name__ == '__main__':
    unittest.main()
