import timeit
from enum import Enum
import heapq

INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'

type Coord = tuple[int, int]


class Dir(Enum):
    RIGHT = ((1, 0), '>')
    LEFT = ((-1, 0), '<')
    UP = ((0, -1), '^')
    DOWN = ((0, 1), 'v')

    def __repr__(self) -> str:
        return self.value[1]

    __str__ = __repr__


class Node:
    def __init__(self, x: int, y: int, slope: Dir | None):
        self.x: int = x
        self.y: int = y
        self.slope: Dir | None = slope
        self.neighbors: dict[Dir, Node] = {}
        self.edges: dict[Node, int] = {}

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Node):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __hash__(self) -> int:
        return hash((self.x, self.y))

    def __repr__(self) -> str:
        return f'({self.x}, {self.y}{self.slope if self.slope else ""})'

    __str__ = __repr__


class HeapItem:
    def __init__(self, weight: int, current: Node, path: set[Node]) -> None:
        self.weight: int = weight
        self.current: Node = current
        self.path: set[Node] = path

    def __lt__(self, other: object) -> bool:
        if not isinstance(other, HeapItem):
            return NotImplemented
        return self.weight > other.weight  # important: reverse order because we seek the longest path


class Maze:
    def __init__(self, filename: str):
        self.blocks: list[list[str]] = []
        with open(filename) as f:
            for line in f:
                self.blocks.append(list(line.strip()))
        self.width = len(self.blocks[0])
        self.height = len(self.blocks)
        self.start: Node
        self.end: Node
        self.create_node()

    def create_node(self):
        self.nodes: dict[Coord, Node] = {}
        start: Coord = (self.blocks[0].index('.'), 0)
        end: Coord = (self.blocks[-1].index('.'), self.height - 1)
        for y in range(self.height):
            for x in range(self.width):
                c = self.blocks[y][x]
                if c != '#':
                    self.nodes[(x, y)] = Node(x, y, next(filter(lambda d: str(d) == c, Dir)) if c != '.' else None)
        # connect nodes
        for node in self.nodes.values():
            for dir in Dir:
                x = node.x + dir.value[0][0]
                y = node.y + dir.value[0][1]
                if x < 0 or x >= self.width or y < 0 or y >= self.height:
                    continue
                other = self.nodes.get((x, y))
                if other is not None:
                    node.neighbors[dir] = other
            if start == (node.x, node.y):
                self.start = node
            elif end == (node.x, node.y):
                self.end = node
        # connect edges
        for node in self.nodes.values():
            for _, neighbor in node.neighbors.items():
                neighbor.edges[node] = 1
        # reduce graph
        simplenodes = list(filter(lambda p: len(p.edges) == 2, self.nodes.values()))
        self.complexnodes = list(filter(lambda p: len(p.edges) != 2, self.nodes.values()))
        while len(simplenodes) > 0:
            sn = simplenodes.pop(0)
            (p1, w1), (p2, w2) = sn.edges.items()
            p1.edges.pop(sn)
            p2.edges.pop(sn)
            p1.edges[p2] = w1 + w2
            p2.edges[p1] = w1 + w2

    def solve1(self) -> int:
        solutions = self.find_directed_path(self.start, self.end)
        solutions.sort(key=len)
        return len(solutions[-1]) - 1

    def find_directed_path(self, start: Node, end: Node) -> list[set[Node]]:
        solutions: list[set[Node]] = []
        queue: list[tuple[Node, set[Node]]] = [(start, set())]
        while len(queue) > 0:
            current, path1 = queue.pop(0)

            path = path1.union([current])
            if current == end:
                solutions.append(path)
                continue

            for dir, neighbor in current.neighbors.items():
                if current.slope and dir != current.slope:
                    continue
                if neighbor not in path:
                    queue.append((neighbor, path))

        return solutions

    def solve2(self) -> int:
        solution = self.find_path(self.start, self.end)
        return solution[0]

    def find_path(self, start: Node, end: Node) -> tuple[int, set[Node]]:
        # we use a priority queue, which finds better solutions earlier
        solution: tuple[int, set[Node]] = (0, set())
        heap: list[HeapItem] = [HeapItem(0, start, set())]
        while len(heap) > 0:
            item = heapq.heappop(heap)
            weight, current, path1 = (item.weight, item.current, item.path)

            path = path1.union([current])
            if current == end:
                if weight > solution[0]:
                    print(f'New solution found: {weight}')
                    solution = (weight, path)
                continue

            for neighbor, w in current.edges.items():
                if neighbor not in path:
                    heapq.heappush(heap, HeapItem(weight + w, neighbor, path))

        return solution


if __name__ == '__main__':
    maze = Maze(INPUT_FILE)
    print(f'Solution 1: {maze.solve1()}')

    start_time = timeit.default_timer()
    # Note: this takes 5 minutes for the real input, but the best solution is
    # already printed after about 3 seconds.
    print(f'Solution 2: {maze.solve2()}')
    end_time = timeit.default_timer()
    print(f'Time taken by maze.solve2(): {end_time - start_time} seconds')
