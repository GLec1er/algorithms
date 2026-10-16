def climbing_stairs(n):
    dp = [1] * (n + 1)
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]  # Последний шаг имеет длину 1 или 2.
    return dp[n]


def minimum_coins(coins, amount):
    dp = [0] + [amount + 1] * amount
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)  # Лучший ответ после выбора последней монеты.
    return dp[amount] if dp[amount] <= amount else -1


def matrix_pathways(rows, cols):
    dp = [[1] * cols for _ in range(rows)]
    for r in range(1, rows):
        for c in range(1, cols):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]  # Два допустимых направления прихода.
    return dp[-1][-1]


def burglary(a):
    dp = [0] * (len(a) + 1)
    for i, x in enumerate(a):
        take = x + (dp[i - 1] if i else 0)
        skip = dp[i]
        dp[i + 1] = max(take, skip)  # Нельзя выбирать одновременно два соседних дома.
    return dp[-1]


def lcs(s, t):
    dp = [[0] * (len(t) + 1) for _ in range(len(s) + 1)]
    for r in range(1, len(s) + 1):
        for c in range(1, len(t) + 1):
            if s[r - 1] == t[c - 1]:
                dp[r][c] = dp[r - 1][c - 1] + 1
            else:
                dp[r][c] = max(dp[r - 1][c], dp[r][c - 1])  # Пропускаем один из несовпавших символов.
    return dp[-1][-1]


def longest_palindrome(s):
    n = len(s)
    dp = [[False] * n for _ in range(n)]
    start, best = 0, 0
    for length in range(1, n + 1):
        for left in range(n - length + 1):
            right = left + length - 1
            dp[left][right] = s[left] == s[right] and (length <= 2 or dp[left + 1][right - 1])
            if dp[left][right] and length > best:
                start, best = left, length  # При равенстве сохраняем более ранний ответ.
    return s[start:start + best]


def maximum_subarray(a):
    dp = [a[0]]
    best = a[0]
    for i in range(1, len(a)):
        dp.append(max(a[i], dp[-1] + a[i]))  # Начинаем заново или продолжаем предыдущий отрезок.
        best = max(best, dp[-1])
    return best


def knapsack(weights, values, capacity):
    dp = [[0] * (capacity + 1) for _ in range(len(weights) + 1)]
    for r in range(1, len(weights) + 1):
        for c in range(capacity + 1):
            dp[r][c] = dp[r - 1][c]  # Вариант: не брать предмет.
            if weights[r - 1] <= c:
                dp[r][c] = max(dp[r][c], values[r - 1] + dp[r - 1][c - weights[r - 1]])
    return dp[-1][-1]


def largest_square(grid):
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * (cols + 1) for _ in range(rows + 1)]
    best = 0
    for r in range(1, rows + 1):
        for c in range(1, cols + 1):
            if grid[r - 1][c - 1] == 1:
                dp[r][c] = 1 + min(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1])
                best = max(best, dp[r][c])  # Все три соседних квадрата должны поддерживать расширение.
    return best * best
