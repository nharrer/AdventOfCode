import math

INPUT_FILE = 'input.txt'
INPUT_FILE_TEST1 = 'input.test1.txt'
INPUT_FILE_TEST2 = 'input.test2.txt'
INPUT_FILE_TEST3 = 'input.test3.txt'


class Node:
    def __init__(self, name, leftstr, rightstr):
        self.name = name
        self.leftstr = leftstr
        self.rightstr = rightstr
        self.left = None
        self.right = None

    def next(self, direction):
        if direction == 'L':
            return self.left
        return self.right

    def __str__(self) -> str:
        le = self.left.name if self.left else None
        re = self.right.name if self.right else None
        return f'{self.name}({le},{re})'

    def __repr__(self) -> str:
        return self.__str__()


def readfile(filename):
    with open(filename) as f:
        lines = f.readlines()
        lines = [line.strip() for line in lines]
        return lines


def read(lines):
    iterlines = iter(lines)
    nodes = []

    directions = next(iterlines)
    next(iterlines)
    for line in iterlines:
        parts = line.split(' = ')
        name = parts[0]
        dirs = parts[1].split(', ')
        left = dirs[0][1:]
        right = dirs[1][:-1]
        node = Node(name, left, right)
        nodes.append(node)

    for node in nodes:
        node.left = next((n for n in nodes if n.name == node.leftstr), None)
        node.right = next((n for n in nodes if n.name == node.rightstr), None)

    return [nodes, directions]


def solve1(directions, startnode, endsuffix):
    didx = 0
    steps = 0
    current = startnode
    while True:
        if current.name.endswith(endsuffix):
            return steps
        d = directions[didx]
        didx = (didx + 1) % len(directions)
        steps += 1
        current = current.next(d)


def solve2(nodes, directions):
    startnodes = list(filter(lambda n: n.name[-1] == 'A', nodes))
    cycles = list(map(lambda s: solve1(directions, s, 'Z'), startnodes))
    return math.lcm(*cycles)


lines = readfile(INPUT_FILE)
[nodes, directions] = read(lines)
node_aaa = next(filter(lambda n: n.name == 'AAA', nodes), None)
print(f'Solution 1: {solve1(directions, node_aaa, "ZZZ")}')
print(f'Solution 2: {solve2(nodes, directions)}')
