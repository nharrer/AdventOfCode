import heapq

INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'


class Node:
    def __init__(self, pos, heatloss, direction, straight):
        self.pos = pos
        self.heatloss = heatloss
        self.direction = direction
        self.straight = straight

    # heapq only seems to need lt
    def __lt__(self, other):
        return self.heatloss < other.heatloss


class Field:
    def __init__(self, filename):
        self.blocks = []
        with open(filename) as f:
            for line in f.readlines():
                row = list(map(lambda c: int(c), line.strip()))
                self.blocks.append(row)
        self.width = len(self.blocks[0])
        self.height = len(self.blocks)
        self.start = (0, 0)
        self.end = (self.width - 1, self.height - 1)

    def solve(self, minstraight, maxstraight):
        existing_nodes = set()
        heap = [Node(self.start, 0, 0, 0), Node(self.start, 0, 1, 0)]
        while len(heap) > 0:
            node = heapq.heappop(heap)

            if node.pos == self.end:
                return node.heatloss  # we found the end !!

            state = (node.pos, node.direction, node.straight)
            if state in existing_nodes:
                continue
            existing_nodes.add(state)

            for d in [(0, (1, 0)), (1, (0, 1)), (2, (-1, 0)), (3, (0, -1))]:
                delta = d[1]
                nextdir = d[0]
                if nextdir != node.direction and (node.direction + 2) % 4 == nextdir:
                    continue  # don't go back
                if nextdir == node.direction and node.straight >= maxstraight:
                    continue  # don'to go more than maxstraight in the same direction
                if nextdir != node.direction and node.straight < minstraight:
                    continue  # don't go less than minstraight in the same direction
                nextpos = (node.pos[0] + delta[0], node.pos[1] + delta[1])
                if nextpos[0] < 0 or nextpos[0] >= self.width or nextpos[1] < 0 or nextpos[1] >= self.height:
                    continue  # outside of field

                nextheatloss = node.heatloss + self.blocks[nextpos[1]][nextpos[0]]
                nextstraight = node.straight + 1 if nextdir == node.direction else 1
                nextnode = Node(nextpos, nextheatloss, nextdir, nextstraight)

                heapq.heappush(heap, nextnode)


field = Field(INPUT_FILE)
print(f'Solution 1: {field.solve(0, 3)}')
print(f'Solution 2: {field.solve(4, 10)}')
