def pair_sum_unsorted(a, target):
    seen = {}
    for i, x in enumerate(a):
        complement = target - x
        if complement in seen:  # The complement must have a distinct, already visited index.
            return [seen[complement], i]
        seen[x] = i
    return []


def verify_sudoku(grid):
    rows, cols, boxes = [set() for _ in range(9)], [set() for _ in range(9)], [set() for _ in range(9)]
    for r in range(9):
        for c in range(9):
            x = grid[r][c]
            if x == '.':
                continue
            box = (r // 3) * 3 + c // 3
            if x in rows[r] or x in cols[c] or x in boxes[box]:
                return False
            rows[r].add(x)  # Record the value in all three constraint sets.
            cols[c].add(x)
            boxes[box].add(x)
    return True


def zero_striping(grid):
    rows, cols = set(), set()
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] == 0:  # Record only the original zero cells.
                rows.add(r)
                cols.add(c)
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if r in rows or c in cols:
                grid[r][c] = 0
    return grid


def longest_chain(a):
    seen = set(a)
    best = 0
    for x in seen:
        if x - 1 in seen:  # An internal run element must not start another scan.
            continue
        current = x
        while current in seen:
            current += 1
        best = max(best, current - x)
    return best


def geometric_triplets(a, ratio):
    from collections import Counter
    left_map, right_map = Counter(), Counter(a)
    count = 0
    for i, x in enumerate(a):
        right_map[x] -= 1  # The current element no longer belongs to the right side.
        if x % ratio == 0:
            count += left_map[x // ratio] * right_map[x * ratio]
        left_map[x] += 1  # It is now available as the first element of later triples.
    return count
