def pair_sum_sorted(a, target):
    left, right = 0, len(a) - 1
    while left < right:  # Все ещё возможные пары лежат между указателями.
        total = a[left] + a[right]
        if total == target:
            return [left, right]
        if total < target:  # С текущим левым числом сумма уже не вырастет.
            left += 1
        else:  # С текущим правым числом сумма слишком велика.
            right -= 1
    return []


def triplet_sum(a):
    a.sort()
    result = []
    for i in range(len(a) - 2):
        if i and a[i] == a[i - 1]:  # Одинаковый первый элемент дал бы повтор ответа.
            continue
        left, right = i + 1, len(a) - 1
        while left < right:
            total = a[i] + a[left] + a[right]
            if total == 0:
                result.append([a[i], a[left], a[right]])
                left += 1
                right -= 1
                while left < right and a[left] == a[left - 1]:
                    left += 1
            elif total < 0:
                left += 1
            else:
                right -= 1
    return result


def is_palindrome_valid(s):
    left, right = 0, len(s) - 1
    while left < right:
        if not s[left].isalnum():  # Пунктуация не участвует в сравнении.
            left += 1
        elif not s[right].isalnum():
            right -= 1
        elif s[left].lower() != s[right].lower():
            return False
        else:
            left += 1
            right -= 1
    return True


def largest_container(a):
    left, right, best = 0, len(a) - 1, 0
    while left < right:
        area = (right - left) * min(a[left], a[right])
        best = max(best, area)
        if a[left] <= a[right]:  # Только замена меньшей высоты может улучшить результат.
            left += 1
        else:
            right -= 1
    return best


def shift_zeros(a):
    write = 0
    for i in range(len(a)):
        if a[i] != 0:
            a[write], a[i] = a[i], a[write]  # Ненулевой префикс расширяется на один элемент.
            write += 1
    return a


def next_sequence(a):
    i = len(a) - 2
    while i >= 0 and a[i] >= a[i + 1]:  # Справа уже наибольшая перестановка суффикса.
        i -= 1
    if i >= 0:
        j = len(a) - 1
        while a[j] <= a[i]:
            j -= 1
        a[i], a[j] = a[j], a[i]  # Минимально увеличиваем точку роста.
    left, right = i + 1, len(a) - 1
    while left < right:
        a[left], a[right] = a[right], a[left]
        left += 1
        right -= 1
    return a
