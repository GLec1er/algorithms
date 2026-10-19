def sort_linked(a):
    from curriculum.structures import linked, list_values, Node
    head = linked(a)
    def merge_sort(head):
        if not head or not head.next:
            return head
        slow, fast = head, head.next
        while fast and fast.next:
            slow, fast = slow.next, fast.next.next
        right = slow.next
        slow.next = None  # Split the list into two independent halves.
        left, right = merge_sort(head), merge_sort(right)
        dummy = Node('∅')
        tail = dummy
        while left and right:
            if left.value <= right.value:
                tail.next, left = left, left.next
            else:
                tail.next, right = right, right.next
            tail = tail.next
        tail.next = left or right
        return dummy.next
    head = merge_sort(head)
    return list_values(head)


def sort_array(a):
    buffer = [0] * len(a)
    def merge(left, right):
        if right - left <= 1:
            return
        mid = (left + right) // 2
        merge(left, mid)
        merge(mid, right)
        i, j = left, mid
        for write in range(left, right):
            if i < mid and (j >= right or a[i] <= a[j]):
                buffer[write] = a[i]
                i += 1
            else:
                buffer[write] = a[j]
                j += 1
        a[left:right] = buffer[left:right]  # The merged interval is now sorted.
    merge(0, len(a))
    return a


def kth_largest(a, k):
    target = len(a) - k
    left, right = 0, len(a) - 1
    while left <= right:
        pivot = a[right]
        write = left
        for i in range(left, right):
            if a[i] <= pivot:
                a[i], a[write] = a[write], a[i]
                write += 1
        a[write], a[right] = a[right], a[write]  # The pivot reaches its final position.
        if write == target:
            return a[write]
        if write < target:
            left = write + 1
        else:
            right = write - 1


def dutch_flag(a):
    low, i, high = 0, 0, len(a) - 1
    while i <= high:
        if a[i] == 0:
            a[low], a[i] = a[i], a[low]
            low += 1
            i += 1
        elif a[i] == 2:
            a[i], a[high] = a[high], a[i]
            high -= 1  # The value arriving from the right is unchecked: do not advance i.
        else:
            i += 1
    return a
