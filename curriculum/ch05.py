def substring_anagrams(s, pattern):
    from collections import Counter
    need, window = Counter(pattern), Counter()
    result = []
    left = 0
    for right, x in enumerate(s):
        window[x] += 1
        if right - left + 1 > len(pattern):
            old = s[left]
            window[old] -= 1
            if window[old] == 0:
                del window[old]
            left += 1
        if right - left + 1 == len(pattern) and window == need:
            result.append(left)  # Both the window length and every character frequency match.
    return result


def unique_substring(s):
    seen = {}
    left, best = 0, 0
    for right, x in enumerate(s):
        if x in seen:
            left = max(left, seen[x] + 1)  # The left boundary never moves backward.
        seen[x] = right
        best = max(best, right - left + 1)
    return best


def uniform_substring(s, k):
    from collections import Counter
    window = Counter()
    left, best = 0, 0
    for right, x in enumerate(s):
        window[x] += 1
        while right - left + 1 - max(window.values()) > k:
            window[s[left]] -= 1  # Too many replacements are needed: shrink the window.
            left += 1
        best = max(best, right - left + 1)
    return best
