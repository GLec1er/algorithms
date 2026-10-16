def range_sum(a, queries):
    prefix = [0]
    for i, x in enumerate(a):
        prefix.append(prefix[-1] + x)
    result = []
    for left, right in queries:
        result.append(prefix[right + 1] - prefix[left])  # Вычитаем вклад элементов до left.
    return result


def k_sum_subarrays(a, k):
    counts = {0: 1}
    total, result = 0, 0
    for i, x in enumerate(a):
        total += x
        result += counts.get(total - k, 0)  # Каждый такой префикс задаёт начало подходящего отрезка.
        counts[total] = counts.get(total, 0) + 1
    return result


def product_except(a):
    result = [1] * len(a)
    product = 1
    for i in range(len(a)):
        result[i] = product  # Произведение строго слева от i.
        product *= a[i]
    product = 1
    for i in range(len(a) - 1, -1, -1):
        result[i] *= product  # Домножаем на произведение строго справа.
        product *= a[i]
    return result
