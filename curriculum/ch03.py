def linked_reversal(a):
    from curriculum.structures import linked, list_values
    current, prev = linked(a), None
    while current:
        following = current.next  # Сохраняем путь к ещё не обработанной части.
        current.next = prev
        prev = current
        current = following
    return list_values(prev)


def remove_kth(a, k):
    from curriculum.structures import linked, list_values, Node
    dummy = Node('∅')
    dummy.next = linked(a)
    slow = fast = dummy
    for i in range(k):
        fast = fast.next
    while fast.next:
        slow, fast = slow.next, fast.next
    slow.next = slow.next.next  # slow находится перед удаляемым узлом.
    return list_values(dummy.next)


def linked_intersection(a, b, tail):
    from curriculum.structures import linked
    common = linked(tail)
    def attach(values):
        head = linked(values)
        if not head:
            return common
        current = head
        while current.next:
            current = current.next
        current.next = common
        return head
    head_a, head_b = attach(a), attach(b)
    left, right = head_a, head_b
    while left is not right:  # Сравниваем идентичность узлов, а не их значения.
        left = left.next if left else head_b
        right = right.next if right else head_a
    return left.value if left else None


def lru_cache(capacity, ops):
    from curriculum.structures import Node
    root = Node('LRU')
    root.next = root.prev = root
    cache, result = {}, []
    def unlink(node):
        node.prev.next = node.next
        node.next.prev = node.prev
    def append(node):
        node.prev, node.next = root.prev, root
        root.prev.next = node
        root.prev = node
    for op in ops:
        key = op[1]
        if op[0] == 'get':
            if key not in cache:
                result.append(-1)
                continue
            node = cache[key]
            result.append(node.value[1])
            unlink(node)
            append(node)  # Недавно использованный узел перемещается в конец.
        elif capacity:
            if key in cache:
                node = cache[key]
                unlink(node)
                node.value = [key, op[2]]
            else:
                node = Node([key, op[2]])
                cache[key] = node
            append(node)
            if len(cache) > capacity:
                oldest = root.next
                unlink(oldest)
                del cache[oldest.value[0]]
    return result


def palindromic_list(a):
    from curriculum.structures import linked
    head = linked(a)
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    prev, current = None, slow
    while current:
        following = current.next
        current.next = prev
        prev, current = current, following
    left, right, valid = head, prev, True
    while right:
        if left.value != right.value:
            valid = False
        left, right = left.next, right.next
    current, prev = prev, None
    while current:  # Восстанавливаем вторую половину даже после несовпадения.
        following = current.next
        current.next = prev
        prev, current = current, following
    return valid


def flatten_list(a):
    from curriculum.structures import multilevel, list_values
    head = multilevel(a)
    stack = [head] if head else []
    prev = None
    while stack:
        current = stack.pop()
        if current.next:
            stack.append(current.next)
        if current.child:
            stack.append(current.child)  # Дочерний уровень обрабатывается раньше следующего соседа.
        if prev:
            prev.next, current.prev = current, prev
        current.child = None
        prev = current
    if prev:
        prev.next = None
    return list_values(head)
