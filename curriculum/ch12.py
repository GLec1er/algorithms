def design_trie(words, queries):
    from curriculum.structures import Node
    root = Node('∅', 'trie')
    for word in words:
        node = root
        for i, x in enumerate(word):
            if x not in node.children:
                node.children[x] = Node(x, 'trie')
            node = node.children[x]
        node.end = True
    result = []
    for operation, word in queries:
        node = root
        for i, x in enumerate(word):
            node = node.children.get(x)
            if node is None:
                break
        result.append(node is not None and (operation == 'prefix' or node.end))
    return result


def wildcard_words(words, patterns):
    from curriculum.structures import Node
    root = Node('∅', 'trie')
    for word in words:
        node = root
        for x in word:
            if x not in node.children:
                node.children[x] = Node(x, 'trie')
            node = node.children[x]
        node.end = True
    def search(node, word, i):
        if i == len(word):
            return node.end
        x = word[i]
        if x != '.':
            return x in node.children and search(node.children[x], word, i + 1)
        for child in node.children.values():  # A dot tries every possible next character.
            if search(child, word, i + 1):
                return True
        return False
    result = []
    for word in patterns:
        result.append(search(root, word, 0))
    return result


def board_words(grid, words):
    from curriculum.structures import Node
    root = Node('∅', 'trie')
    for word in words:
        node = root
        for x in word:
            if x not in node.children:
                node.children[x] = Node(x, 'trie')
            node = node.children[x]
        node.end = True
    found, visited = set(), set()
    def visit(r, c, node, path):
        if not (0 <= r < len(grid) and 0 <= c < len(grid[0])) or (r, c) in visited:
            return
        x = grid[r][c]
        if x not in node.children:
            return  # No dictionary word has this prefix.
        node = node.children[x]
        path += x
        if node.end:
            found.add(path)
        visited.add((r, c))
        for dr, dc in ((0,1),(1,0),(0,-1),(-1,0)):
            visit(r + dr, c + dc, node, path)
        visited.remove((r, c))
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            visit(r, c, root, '')
    return sorted(found)
