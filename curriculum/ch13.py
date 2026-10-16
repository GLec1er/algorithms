def graph_copy(adj):
    from curriculum.structures import Node
    nodes = [Node(i, 'graph') for i in range(len(adj))]
    for i, neighbors in enumerate(adj):
        nodes[i].neighbors = [nodes[j] for j in neighbors]
    copies = {}
    def clone(node):
        if node.id in copies:
            return copies[node.id]  # Этот узел уже создан: сохраняем ссылочную идентичность.
        copy = Node(node.value, 'graph')
        copies[node.id] = copy
        for neighbor in node.neighbors:
            copy.neighbors.append(clone(neighbor))
        return copy
    if not nodes:
        return []
    root = clone(nodes[0])
    result = [[] for _ in adj]
    for copy in copies.values():
        result[copy.value] = [node.value for node in copy.neighbors]
    return result


def count_islands(grid):
    rows, cols = len(grid), len(grid[0])
    visited, count = set(), 0
    def visit(r, c):
        if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] == 0 or (r,c) in visited:
            return
        visited.add((r,c))
        for dr, dc in ((0,1),(1,0),(0,-1),(-1,0)):
            visit(r + dr, c + dc)
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and (r,c) not in visited:
                count += 1
                visit(r,c)  # Этот обход пометит ровно одну компоненту суши.
    return count


def matrix_infection(grid):
    from collections import deque
    queue, healthy = deque(), 0
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] == 2:
                queue.append((r,c))
            elif grid[r][c] == 1:
                healthy += 1
    minutes = 0
    while queue and healthy:
        for i in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in ((0,1),(1,0),(0,-1),(-1,0)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    healthy -= 1
                    queue.append((nr,nc))
        minutes += 1  # Завершили одну волну распространения.
    return minutes if healthy == 0 else -1


def bipartite(adj):
    from collections import deque
    colors = {}
    for start in range(len(adj)):
        if start in colors:
            continue
        colors[start] = 0
        queue = deque([start])
        while queue:
            current = queue.popleft()
            for neighbor in adj[current]:
                if neighbor not in colors:
                    colors[neighbor] = 1 - colors[current]
                    queue.append(neighbor)
                elif colors[neighbor] == colors[current]:
                    return False  # Ребро связывает одинаковые цвета.
    return True


def increasing_path(grid):
    memo = {}
    def visit(r, c):
        if (r,c) in memo:
            return memo[(r,c)]
        best = 1
        for dr, dc in ((0,1),(1,0),(0,-1),(-1,0)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and grid[nr][nc] > grid[r][c]:
                best = max(best, 1 + visit(nr,nc))
        memo[(r,c)] = best  # Ответ для клетки вычисляется только один раз.
        return best
    result = 0
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            result = max(result, visit(r,c))
    return result


def word_transform(start, end, words):
    from collections import deque
    remaining = set(words)
    if end not in remaining:
        return 0
    queue = deque([(start, 1)])
    remaining.discard(start)
    while queue:
        current, distance = queue.popleft()
        if current == end:
            return distance
        for word in sorted(remaining):
            differences = sum(a != b for a, b in zip(current, word))
            if len(word) == len(current) and differences == 1:
                remaining.remove(word)  # Первое посещение в BFS имеет минимальную длину.
                queue.append((word, distance + 1))
    return 0


def merge_communities(n, ops):
    parent, sizes, result = list(range(n)), [1] * n, []
    def find(current):
        while parent[current] != current:
            parent[current] = parent[parent[current]]  # Сжатие пути через дедушку.
            current = parent[current]
        return current
    for op in ops:
        left = find(op[1])
        if op[0] == 'size':
            result.append(sizes[left])
        else:
            right = find(op[2])
            if left == right:
                continue
            if sizes[left] < sizes[right]:
                left, right = right, left
            parent[right] = left
            sizes[left] += sizes[right]
    return result


def prerequisites(n, edges):
    from collections import deque
    adj, indegree = [[] for _ in range(n)], [0] * n
    for course, prerequisite in edges:
        adj[prerequisite].append(course)
        indegree[course] += 1
    queue = deque(i for i in range(n) if indegree[i] == 0)
    visited = []
    while queue:
        current = queue.popleft()
        visited.append(current)
        for neighbor in adj[current]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)
    return len(visited) == n  # Невзятые вершины означают цикл зависимостей.


def shortest_path(n, edges, start):
    import heapq
    adj = [[] for _ in range(n)]
    for source, target, weight in edges:
        adj[source].append((target, weight))
    dist = [float('inf')] * n
    dist[start] = 0
    heap = [(0, start)]
    while heap:
        distance, current = heapq.heappop(heap)
        if distance != dist[current]:
            continue  # В куче мог остаться устаревший, более длинный путь.
        for neighbor, weight in adj[current]:
            candidate = distance + weight
            if candidate < dist[neighbor]:
                dist[neighbor] = candidate
                heapq.heappush(heap, (candidate, neighbor))
    return [None if x == float('inf') else x for x in dist]


def connect_dots(points):
    n = len(points)
    dist, visited, result = [float('inf')] * n, set(), 0
    dist[0] = 0
    for step in range(n):
        current = min((i for i in range(n) if i not in visited), key=lambda i: dist[i])
        visited.add(current)
        result += dist[current]
        for i, point in enumerate(points):
            if i not in visited:
                weight = abs(points[current][0] - point[0]) + abs(points[current][1] - point[1])
                dist[i] = min(dist[i], weight)  # Лучшее ребро из уже соединённой части к точке i.
    return result
