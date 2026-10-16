def spiral_traversal(grid):
    top, bottom, left, right = 0, len(grid) - 1, 0, len(grid[0]) - 1
    result = []
    while top <= bottom and left <= right:
        r = top
        for c in range(left, right + 1):
            result.append(grid[r][c])
        top += 1
        c = right
        for r in range(top, bottom + 1):
            result.append(grid[r][c])
        right -= 1
        if top <= bottom:
            r = bottom
            for c in range(right, left - 1, -1):
                result.append(grid[r][c])
            bottom -= 1
        if left <= right:
            c = left
            for r in range(bottom, top - 1, -1):
                result.append(grid[r][c])
            left += 1  # Закончили кольцо, дальше остаётся только внутренняя часть.
    return result


def reverse_integer(n):
    sign = -1 if n < 0 else 1
    remaining, result = abs(n), 0
    while remaining:
        digit = remaining % 10
        result = result * 10 + digit
        remaining //= 10
    result *= sign
    return result if -(2 ** 31) <= result < 2 ** 31 else 0


def collinear_points(points):
    from math import gcd
    best = min(1, len(points))
    for i, (x, y) in enumerate(points):
        slopes = {}
        for j in range(i + 1, len(points)):
            dx, dy = points[j][0] - x, points[j][1] - y
            divisor = gcd(dx, dy)
            dx, dy = dx // divisor, dy // divisor
            if dx < 0 or (dx == 0 and dy < 0):
                dx, dy = -dx, -dy  # Одинаковые прямые имеют одинаковый нормализованный знак.
            key = (dy, dx)
            slopes[key] = slopes.get(key, 0) + 1
            best = max(best, slopes[key] + 1)
    return best


def josephus(n, k):
    survivor = 0
    for size in range(2, n + 1):
        survivor = (survivor + k) % size  # Возвращаем индекс из меньшего круга в исходную нумерацию.
    return survivor + 1  # Во входном условии люди нумеруются с 1.


def triangle_numbers(n):
    remainder = n % 4  # Чётность первых четырёх позиций повторяется каждые четыре строки.
    if n % 2 == 1:
        return 2
    if remainder == 0:
        return 3
    return 4
