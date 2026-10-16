def valid_parentheses(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for i, x in enumerate(s):
        if x in '([{':
            stack.append(x)
        elif not stack or stack.pop() != pairs[x]:  # Закрываем именно последнюю открытую пару.
            return False
    return not stack


def next_largest(a):
    stack = []
    result = [-1] * len(a)
    for i, x in enumerate(a):
        while stack and a[stack[-1]] < x:
            j = stack.pop()
            result[j] = x  # Первое большее значение для отложенного индекса.
        stack.append(i)
    return result


def evaluate_expression(s):
    stack = []
    number, sign, total = 0, 1, 0
    for i, x in enumerate(s):
        if x.isdigit():
            number = number * 10 + int(x)
        elif x in '+-':
            total += sign * number
            number = 0
            sign = 1 if x == '+' else -1
        elif x == '(':
            stack.append([total, sign])  # Сохраняем внешний контекст перед вложенным выражением.
            total, sign = 0, 1
        elif x == ')':
            total += sign * number
            outer, factor = stack.pop()
            total = outer + factor * total  # Восстанавливаем знак и сумму внешнего уровня.
            number = 0
    return total + sign * number


def remove_duplicates(s):
    stack = []
    for i, x in enumerate(s):
        if stack and stack[-1] == x:
            stack.pop()  # Пара исчезает; новая вершина может образовать следующую пару.
        else:
            stack.append(x)
    return ''.join(stack)


def queue_stacks(ops):
    incoming, outgoing, result = [], [], []
    for op in ops:
        if op[0] == 'enqueue':
            incoming.append(op[1])
        else:
            if not outgoing:
                while incoming:
                    outgoing.append(incoming.pop())  # Переворот превращает LIFO в FIFO.
            result.append(outgoing.pop() if outgoing else None)
    return result


def window_maximum(a, k):
    from collections import deque
    queue, result = deque(), []
    for i, x in enumerate(a):
        while queue and queue[0] <= i - k:
            queue.popleft()  # Удаляем индекс, вышедший из окна.
        while queue and a[queue[-1]] <= x:
            queue.pop()  # Новый элемент больше и живёт дольше: старый больше не нужен.
        queue.append(i)
        if i >= k - 1:
            result.append(a[queue[0]])
    return result
