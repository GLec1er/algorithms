def range_sum(a, queries):
    prefix = [0]
    for i, x in enumerate(a):
        prefix.append(prefix[-1] + x)
    result = []
    for left, right in queries:
        result.append(prefix[right + 1] - prefix[left])  # Subtract the contribution strictly before left.
    return result


def k_sum_subarrays(a, k):
    counts = {0: 1}
    total, result = 0, 0
    for i, x in enumerate(a):
        total += x
        result += counts.get(total - k, 0)  # Each matching prefix identifies one valid subarray start.
        counts[total] = counts.get(total, 0) + 1
    return result


def product_except(a):
    result = [1] * len(a)
    product = 1
    for i in range(len(a)):
        result[i] = product  # The product strictly to the left of i.
        product *= a[i]
    product = 1
    for i in range(len(a) - 1, -1, -1):
        result[i] *= product  # Multiply by the product strictly to the right.
        product *= a[i]
    return result
