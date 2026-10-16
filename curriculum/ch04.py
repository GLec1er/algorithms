def linked_loop(a, pos):
    from curriculum.structures import linked
    head = linked(a)
    nodes, current = [], head
    while current:
        nodes.append(current)
        current = current.next
    if nodes and pos >= 0:
        nodes[-1].next = nodes[pos]
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:  # Оба указателя оказались в одном узле цикла.
            return True
    return False


def linked_midpoint(a):
    from curriculum.structures import linked
    slow = fast = linked(a)
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow.value if slow else None


def happy_number(n):
    def advance(x):
        total = 0
        while x:
            digit = x % 10
            total += digit * digit
            x //= 10
        return total
    slow = fast = n
    while True:
        slow = advance(slow)
        fast = advance(advance(fast))
        if slow == fast:  # Встреча произошла либо в 1, либо в повторяющемся цикле.
            return slow == 1
