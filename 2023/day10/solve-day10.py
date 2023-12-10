from enum import Enum

INPUT_FILE = 'input.txt'
INPUT_FILE_TEST1 = 'input.test1.txt'
INPUT_FILE_TEST2 = 'input.test2.txt'
INPUT_FILE_TEST3 = 'input.test3.txt'
INPUT_FILE_TEST4 = 'input.test4.txt'


class Direction(Enum):
    NS = ('|', (0, -1), (0, 1))
    EN = ('-', (-1, 0), (1, 0))
    NE = ('L', (0, -1), (1, 0))
    NW = ('J', (0, -1), (-1, 0))
    SW = ('7', (0, 1), (-1, 0))
    SE = ('F', (0, 1), (1, 0))


class Tile:
    def __init__(self, field, symbol, x, y):
        self.field = field
        self.symbol = symbol
        self.x = x
        self.y = y
        self.n1 = None  # neighbor 1
        self.n2 = None  # neighbor 2
        self.loop = False
        self.inside = False

    def get_next(self, prev):
        return self.n1 if prev == self.n2 else self.n2

    def get_neighbor(self, delta):
        pos = [self.x + delta[0], self.y + delta[1]]
        if pos[0] < 0 or pos[0] >= self.field.width:
            return None
        if pos[1] < 0 or pos[1] >= self.field.height:
            return None
        return self.field.get(pos[0], pos[1])

    def __repr__(self):
        return f'{self.symbol}({self.x}, {self.y})'


class Field:
    def __init__(self, lines):
        self.all = []
        self.rows = []
        self.start = None
        y = 0
        for line in lines:
            x = 0
            columns = []
            for symbol in line:
                tile = Tile(self, symbol, x, y)
                columns.append(tile)
                self.all.append(tile)
                if symbol == 'S':
                    self.start = tile
                x += 1
            self.rows.append(columns)
            y += 1
        self.width = len(self.rows[0])
        self.height = len(self.rows)
        self.determine_start(self.start)
        self.connect()

    def get(self, x, y):
        if x < 0 or x >= self.width:
            return None
        if y < 0 or y >= self.height:
            return None
        return self.rows[y][x]

    def determine_start(self, start):
        # look at the four neighbors and pick the two pipes which are connected
        connected = []
        self.add_possible_neightbor(start.x, start.y - 1, ('|', 'F', '7'), connected)  # north
        self.add_possible_neightbor(start.x, start.y + 1, ('|', 'L', 'J'), connected)  # south
        self.add_possible_neightbor(start.x - 1, start.y, ('-', 'L', 'F'), connected)  # west
        self.add_possible_neightbor(start.x + 1, start.y, ('-', '7', 'J'), connected)  # east

        if len(connected) != 2:
            raise Exception('Invalid start')
        start.n1 = connected[0]
        start.n2 = connected[1]

        # determine the symbol which matches the neighbors
        minx = min(connected[0].x, connected[1].x)
        maxx = max(connected[0].x, connected[1].x)
        miny = min(connected[0].y, connected[1].y)
        maxy = max(connected[0].y, connected[1].y)
        if minx == maxx:
            start.symbol = '|'
        elif miny == maxy:
            start.symbol = '-'
        elif minx < start.x and miny < start.y:
            start.symbol = 'J'
        elif minx < start.x and maxy > start.y:
            start.symbol = '7'
        elif maxx > start.x and miny < start.y:
            start.symbol = 'L'
        elif maxx > start.x and maxy > start.y:
            start.symbol = 'F'
        if start.symbol == 'S':
            raise Exception('Invalid start')

    def add_possible_neightbor(self, x, y, symbols, neighbors):
        other = self.get(x, y)
        if other is not None and other.symbol in symbols:
            neighbors.append(other)

    def connect(self):
        # determine the neighbors for each tile
        dirs = list(map(lambda dir: dir.value, Direction))
        for tile in self.all:
            sym = next(filter(lambda s: s[0] == tile.symbol, dirs), None)
            if sym is not None:
                tile.n1 = tile.get_neighbor(sym[1])
                tile.n2 = tile.get_neighbor(sym[2])

    def print(self):
        for row in self.rows:
            for tile in row:
                print('*' if tile.loop else 'I' if tile.inside else 'O', end='')
            print()


def readfile(filename):
    with open(filename) as f:
        lines = f.readlines()
        lines = [line.strip() for line in lines]
        return lines


def solve1(field):
    # walk into both directions until we meet again
    steps = 0
    current = [field.start, field.start]
    prev = [field.start.n2, field.start.n1]
    while True:
        steps += 1
        current[0].loop = True
        current[1].loop = True
        next1 = current[0].get_next(prev[0])
        next2 = current[1].get_next(prev[1])
        if next1 is None or next2 is None:
            raise Exception('No path')  # must not happen
        if next1 == next2:
            next1.loop = True
            return steps
        prev = current
        current = [next1, next2]


def solve2(field):
    cnt = 0
    for row in field.rows:
        last = '.'
        inside = False
        for tile in row:
            now = tile.symbol if tile.loop else '.'
            # flip inside flag at a horizontal (or horizontal like) pipe
            if now == '|':
                inside = not inside
            elif last == 'F' and now == 'J':
                inside = not inside
            elif last == 'L' and now == '7':
                inside = not inside

            if not tile.loop:
                tile.inside = inside
                if inside:
                    cnt += 1

            if now != '-':  # ignore horizontal pipes
                last = now
    return cnt


field = Field(readfile(INPUT_FILE))
print(f'Start={field.start.symbol}')
print(f'Solution 1: {solve1(field)}')
print(f'Solution 2: {solve2(field)}')
# field.print()
