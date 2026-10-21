def invert_tree(a):
    from curriculum.structures import tree, tree_values
    root = tree(a)
    def visit(node):
        if not node:
            return
        node.left, node.right = node.right, node.left
        visit(node.left)
        visit(node.right)
    visit(root)
    return tree_values(root)


def balanced_tree(a):
    from curriculum.structures import tree
    root = tree(a)
    def height(node):
        if not node:
            return 0
        left = height(node.left)
        right = height(node.right)
        if left < 0 or right < 0 or abs(left - right) > 1:
            return -1  # Propagate the imbalance signal toward the root.
        return 1 + max(left, right)
    return height(root) >= 0


def rightmost_nodes(a):
    from collections import deque
    from curriculum.structures import tree
    root = tree(a)
    queue, result = deque([root] if root else []), []
    while queue:
        width = len(queue)
        for i in range(width):
            node = queue.popleft()
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
            if i == width - 1:
                result.append(node.value)  # The final node at this level is visible from the right.
    return result


def widest_level(a):
    from collections import deque
    from curriculum.structures import tree
    root = tree(a)
    queue, best = deque([(root, 0)] if root else []), 0
    while queue:
        first = queue[0][1]
        last = queue[-1][1]
        best = max(best, last - first + 1)
        for i in range(len(queue)):
            node, position = queue.popleft()
            position -= first  # Normalization preserves width while limiting index growth.
            if node.left:
                queue.append((node.left, 2 * position))
            if node.right:
                queue.append((node.right, 2 * position + 1))
    return best


def validate_bst(a):
    from curriculum.structures import tree
    root = tree(a)
    def check(node, low, high):
        if not node:
            return True
        if not low < node.value < high:
            return False
        return check(node.left, low, node.value) and check(node.right, node.value, high)
    return check(root, float('-inf'), float('inf'))


def lowest_ancestor(a, p, q):
    from curriculum.structures import tree
    root = tree(a)
    def visit(node):
        if not node or node.value in (p, q):
            return node
        left = visit(node.left)
        right = visit(node.right)
        if left and right:
            return node  # The targets occur in different child subtrees.
        return left or right
    answer = visit(root)
    return answer.value


def build_tree(preorder, inorder):
    from curriculum.structures import Node, tree_values
    positions = {value: i for i, value in enumerate(inorder)}
    index = 0
    def build(left, right):
        nonlocal index
        if left >= right:
            return None
        node = Node(preorder[index], 'tree')
        index += 1
        mid = positions[node.value]
        node.left = build(left, mid)
        node.right = build(mid + 1, right)
        return node
    root = build(0, len(inorder))
    return tree_values(root)


def maximum_tree_path(a):
    from curriculum.structures import tree
    root = tree(a)
    best = float('-inf')
    def gain(node):
        nonlocal best
        if not node:
            return 0
        left = max(0, gain(node.left))
        right = max(0, gain(node.right))
        best = max(best, node.value + left + right)  # A path through this node may join both branches.
        return node.value + max(left, right)  # Only one branch may continue toward the parent.
    gain(root)
    return best


def tree_symmetry(a):
    from curriculum.structures import tree
    root = tree(a)
    def mirror(left, right):
        if not left or not right:
            return left is right
        if left.value != right.value:
            return False
        return mirror(left.left, right.right) and mirror(left.right, right.left)
    return not root or mirror(root.left, root.right)


def tree_columns(a):
    from collections import deque
    from curriculum.structures import tree
    root = tree(a)
    queue = deque([(root, 0)] if root else [])
    columns = {}
    while queue:
        node, column = queue.popleft()
        columns.setdefault(column, []).append(node.value)
        if node.left:
            queue.append((node.left, column - 1))
        if node.right:
            queue.append((node.right, column + 1))
    return [columns[c] for c in sorted(columns)]


def kth_bst(a, k):
    from curriculum.structures import tree
    current, stack = tree(a), []
    while current or stack:
        while current:
            stack.append(current)
            current = current.left
        current = stack.pop()
        k -= 1
        if k == 0:
            return current.value
        current = current.right


def serialize_tree(a):
    from curriculum.structures import tree, tree_values, Node
    root = tree(a)
    tokens = []
    def encode(node):
        if not node:
            tokens.append('#')
            return
        tokens.append(str(node.value))
        encode(node.left)
        encode(node.right)
    encode(root)
    code = ','.join(tokens)
    index = 0
    def decode():
        nonlocal index
        token = tokens[index]
        index += 1
        if token == '#':
            return None
        node = Node(int(token), 'tree')
        node.left = decode()
        node.right = decode()
        return node
    restored = decode()
    return [code, tree_values(restored)]
