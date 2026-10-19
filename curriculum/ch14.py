def permutations(a):
    result, path, used = [], [], set()
    def visit():
        if len(path) == len(a):
            result.append(path.copy())  # Copy the path so later undo operations cannot change this answer.
            return
        for i, x in enumerate(a):
            if i in used:
                continue
            used.add(i)
            path.append(x)
            visit()
            path.pop()  # Undo the choice before exploring the next branch.
            used.remove(i)
    visit()
    return result


def subsets(a):
    result, path = [], []
    def visit(i):
        if i == len(a):
            result.append(path.copy())
            return
        visit(i + 1)  # Explore without the current element.
        path.append(a[i])
        visit(i + 1)  # Explore with the current element.
        path.pop()
    visit(0)
    return result


def n_queens(n):
    result, placement = [], []
    columns, rising, falling = set(), set(), set()
    def visit(r):
        if r == n:
            result.append(placement.copy())
            return
        for c in range(n):
            if c in columns or r + c in rising or r - c in falling:
                continue  # The column or diagonal is already occupied.
            placement.append(c)
            columns.add(c)
            rising.add(r + c)
            falling.add(r - c)
            visit(r + 1)
            placement.pop()  # Restore every constraint for this row.
            columns.remove(c)
            rising.remove(r + c)
            falling.remove(r - c)
    visit(0)
    return result


def combinations_sum(a, target):
    a.sort()
    path, result = [], []
    def visit(start, remaining):
        if remaining == 0:
            result.append(path.copy())
            return
        for i in range(start, len(a)):
            if a[i] > remaining:
                break  # Later sorted values are even larger and cannot fit either.
            path.append(a[i])
            visit(i, remaining - a[i])  # Reuse is allowed, so the next start index remains i.
            path.pop()
    visit(0, target)
    return result


def phone_combinations(digits):
    keys = {'2':'abc','3':'def','4':'ghi','5':'jkl','6':'mno','7':'pqrs','8':'tuv','9':'wxyz'}
    path, result = [], []
    def visit(i):
        if i == len(digits):
            result.append(''.join(path))
            return
        for x in keys[digits[i]]:
            path.append(x)
            visit(i + 1)
            path.pop()  # Try the next letter for the same digit.
    if digits:
        visit(0)
    return result
