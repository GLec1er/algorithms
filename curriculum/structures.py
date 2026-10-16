"""Small input adapters. Algorithmic complexity excludes constructing/printing examples."""
from collections import deque

NODES = []


class Node:
    def __init__(self, value, kind='linked'):
        self.id = len(NODES)
        self.value = value
        self.kind = kind
        self.next = self.prev = self.child = self.left = self.right = None
        self.children = {}
        self.neighbors = []
        self.end = False
        NODES.append(self)


def linked(values):
    head = tail = None
    for value in values:
        node = Node(value)
        if tail:
            tail.next = node
            node.prev = tail
        else:
            head = node
        tail = node
    return head


def list_values(head):
    values, seen = [], set()
    while head and head.id not in seen:
        seen.add(head.id)
        values.append(head.value)
        head = head.next
    return values


def tree(values):
    if not values or values[0] is None:
        return None
    root = Node(values[0], 'tree')
    queue, i = deque([root]), 1
    while queue and i < len(values):
        node = queue.popleft()
        for side in ('left', 'right'):
            if i < len(values) and values[i] is not None:
                child = Node(values[i], 'tree')
                setattr(node, side, child)
                queue.append(child)
            i += 1
    return root


def tree_values(root):
    if not root:
        return []
    queue, result = deque([root]), []
    while queue:
        node = queue.popleft()
        if node is None:
            result.append(None)
        else:
            result.append(node.value)
            queue.extend([node.left, node.right])
    while result and result[-1] is None:
        result.pop()
    return result


def multilevel(items):
    head = tail = None
    for item in items:
        if isinstance(item, list):
            if tail:
                tail.child = multilevel(item)
        else:
            node = Node(item)
            if tail:
                tail.next, node.prev = node, tail
            else:
                head = node
            tail = node
    return head
