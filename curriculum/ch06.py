def insertion_index(a, target):
    left, right = 0, len(a)
    while left < right:  # The candidate interval is half-open: [left, right).
        mid = (left + right) // 2
        if a[mid] < target:
            left = mid + 1  # Every position through mid is too small.
        else:
            right = mid  # mid remains a possible answer.
    return left


def first_last(a, target):
    def boundary(strict):
        left, right = 0, len(a)
        while left < right:
            mid = (left + right) // 2
            if a[mid] < target or (strict and a[mid] == target):
                left = mid + 1
            else:
                right = mid
        return left
    first = boundary(False)
    if first == len(a) or a[first] != target:
        return [-1, -1]
    return [first, boundary(True) - 1]


def cutting_wood(a, k):
    left, right = 0, max(a)
    while left < right:
        mid = (left + right + 1) // 2  # An upper midpoint ensures progress when assigning left = mid.
        wood = 0
        for i, height in enumerate(a):
            wood += max(0, height - mid)
        if wood >= k:
            left = mid  # There is enough wood: try a higher cut.
        else:
            right = mid - 1
    return left


def rotated_search(a, target):
    left, right = 0, len(a) - 1
    while left <= right:
        mid = (left + right) // 2
        if a[mid] == target:
            return mid
        if a[left] <= a[mid]:  # The left half is sorted.
            if a[left] <= target < a[mid]:
                right = mid - 1
            else:
                left = mid + 1
        elif a[mid] < target <= a[right]:
            left = mid + 1
        else:
            right = mid - 1
    return -1


def median_arrays(a, b):
    if len(a) > len(b):
        a, b = b, a
    left, right = 0, len(a)
    half = (len(a) + len(b) + 1) // 2
    while left <= right:
        i = (left + right) // 2
        j = half - i
        al = a[i - 1] if i else float('-inf')
        ar = a[i] if i < len(a) else float('inf')
        bl = b[j - 1] if j else float('-inf')
        br = b[j] if j < len(b) else float('inf')
        if al <= br and bl <= ar:  # Every value in either left part is no greater than either right part.
            if (len(a) + len(b)) % 2:
                return max(al, bl)
            return (max(al, bl) + min(ar, br)) / 2
        if al > br:
            right = i - 1
        else:
            left = i + 1


def matrix_search(grid, target):
    if not grid or not grid[0]:
        return False
    cols = len(grid[0])
    left, right = 0, len(grid) * cols - 1
    while left <= right:
        mid = (left + right) // 2
        r, c = divmod(mid, cols)  # Convert the flat index back into a matrix cell.
        if grid[r][c] == target:
            return True
        if grid[r][c] < target:
            left = mid + 1
        else:
            right = mid - 1
    return False


def local_maxima(a):
    left, right = 0, len(a) - 1
    while left < right:
        mid = (left + right) // 2
        if a[mid] < a[mid + 1]:  # An uphill direction on the right guarantees a peak there.
            left = mid + 1
        else:
            right = mid
    return left


def weighted_selection(a, ticket):
    prefix = []
    total = 0
    for x in a:
        total += x
        prefix.append(total)
    left, right = 0, len(prefix)
    while left < right:
        mid = (left + right) // 2
        if prefix[mid] < ticket:
            left = mid + 1
        else:
            right = mid  # Find the first bucket endpoint covering the ticket.
    return left
