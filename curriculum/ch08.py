def frequent_strings(a, k):
    from collections import Counter
    import heapq
    counts = Counter(a)
    heap = []
    for word, count in counts.items():
        heapq.heappush(heap, (-count, word))  # Negative counts put the most frequent words first.
    result = []
    for i in range(min(k, len(heap))):
        count, word = heapq.heappop(heap)
        result.append(word)
    return result


def combine_lists(lists):
    import heapq
    heap, result = [], []
    for row, a in enumerate(lists):
        if a:
            heapq.heappush(heap, (a[0], row, 0))
    while heap:
        x, row, i = heapq.heappop(heap)  # Take the smallest available stream head.
        result.append(x)
        if i + 1 < len(lists[row]):
            heapq.heappush(heap, (lists[row][i + 1], row, i + 1))
    return result


def stream_median(a):
    import heapq
    lower, upper, result = [], [], []
    for i, x in enumerate(a):
        heapq.heappush(lower, -x)
        heapq.heappush(upper, -heapq.heappop(lower))  # The left maximum must not exceed the right minimum.
        if len(lower) < len(upper):
            heapq.heappush(lower, -heapq.heappop(upper))
        median = -lower[0] if len(lower) > len(upper) else (-lower[0] + upper[0]) / 2
        result.append(median)
    return result


def sort_k_sorted(a, k):
    import heapq
    heap = []
    result = []
    for i, x in enumerate(a):
        heapq.heappush(heap, x)
        if len(heap) > k:
            result.append(heapq.heappop(heap))  # The next minimum is among these k + 1 candidates.
    while heap:
        result.append(heapq.heappop(heap))
    return result
