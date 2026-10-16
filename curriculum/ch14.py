def permutations(a):
    result, path, used = [], [], set()
    def visit():
        if len(path) == len(a):
            result.append(path.copy())  # Снимок пути не изменится при последующих откатах.
            return
        for i, x in enumerate(a):
            if i in used:
                continue
            used.add(i)
            path.append(x)
            visit()
            path.pop()  # Отменяем выбор перед следующей ветвью.
            used.remove(i)
    visit()
    return result


def subsets(a):
    result, path = [], []
    def visit(i):
        if i == len(a):
            result.append(path.copy())
            return
        visit(i + 1)  # Ветвь без текущего элемента.
        path.append(a[i])
        visit(i + 1)  # Ветвь с текущим элементом.
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
                continue  # Столбец или диагональ уже заняты.
            placement.append(c)
            columns.add(c)
            rising.add(r + c)
            falling.add(r - c)
            visit(r + 1)
            placement.pop()  # Полностью восстанавливаем ограничения строки.
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
                break  # Следующие значения ещё больше и тоже не подходят.
            path.append(a[i])
            visit(i, remaining - a[i])  # Повтор разрешён, поэтому индекс остаётся i.
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
            path.pop()  # Пробуем следующую букву той же цифры.
    if digits:
        visit(0)
    return result
