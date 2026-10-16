def jump_end(a):
    farthest = 0
    for i, x in enumerate(a):
        if i > farthest:
            return False  # Здесь начинается недостижимая область.
        farthest = max(farthest, i + x)
        if farthest >= len(a) - 1:
            return True
    return False


def gas_stations(gas, cost):
    start, tank, total = 0, 0, 0
    for i in range(len(gas)):
        delta = gas[i] - cost[i]
        tank += delta
        total += delta
        if tank < 0:  # Все старты от start до i тоже приводят к нехватке топлива.
            start = i + 1
            tank = 0
    return start if total >= 0 else -1


def candies(a):
    amounts = [1] * len(a)
    for i in range(1, len(a)):
        if a[i] > a[i - 1]:
            amounts[i] = amounts[i - 1] + 1
    for i in range(len(a) - 2, -1, -1):
        if a[i] > a[i + 1]:
            amounts[i] = max(amounts[i], amounts[i + 1] + 1)  # Сохраняем оба ограничения одновременно.
    return sum(amounts)
