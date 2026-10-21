def merge_intervals(intervals):
    intervals.sort()
    result = []
    for i, (start, end) in enumerate(intervals):
        if not result or start > result[-1][1]:
            result.append([start, end])
        else:
            result[-1][1] = max(result[-1][1], end)  # Extend only the right endpoint of the merged interval.
    return result


def interval_overlaps(a, b):
    i, j, result = 0, 0, []
    while i < len(a) and j < len(b):
        start = max(a[i][0], b[j][0])
        end = min(a[i][1], b[j][1])
        if start <= end:
            result.append([start, end])
        if a[i][1] < b[j][1]:  # The earlier-ending interval cannot overlap later intervals from the other list.
            i += 1
        else:
            j += 1
    return result


def largest_overlap(intervals):
    events = []
    for start, end in intervals:
        events.append((start, 1))
        events.append((end, -1))
    events.sort()  # At an equal coordinate, -1 precedes +1 because intervals are half-open.
    active, best = 0, 0
    for position, delta in events:
        active += delta
        best = max(best, active)
    return best
