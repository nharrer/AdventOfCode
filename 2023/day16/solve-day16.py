INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'


class Tile:
    def __init__(self, x, y, mirror):
        self.x = x
        self.y = y
        self.mirror = mirror
        self.visited_beams = set()


class Field:
    def __init__(self, filename):
        self.mirrors = {}
        self.width = 0
        self.height = 0
        y = 0
        with open(filename) as f:
            for line1 in f.readlines():
                for x, c in enumerate(line1.strip()):
                    tile = Tile(x, y, c)
                    self.mirrors[(x, y)] = tile
                    self.width = max(self.width, x + 1)
                    self.height = max(self.height, y + 1)
                y += 1

    def solve1(self, beam=None):
        self.reset()
        if beam is None:
            beam = Beam(self.get_tile(0, 0), 1, 0)
        return self.raytrace(beam)

    def solve2(self):
        energy = 0
        for x in range(0, self.width):
            energy = max(energy, self.solve1(Beam(self.get_tile(x, 0), 0, 1)))
            energy = max(energy, self.solve1(Beam(self.get_tile(x, self.height - 1), 0, -1)))
        for y in range(0, self.height):
            energy = max(energy, self.solve1(Beam(self.get_tile(0, y), 1, 0)))
            energy = max(energy, self.solve1(Beam(self.get_tile(self.width - 1, y), -1, 0)))
        return energy

    def get_tile(self, x, y):
        return self.mirrors[(x, y)]

    def reset(self):
        for tile in self.mirrors.values():
            tile.visited_beams.clear()

    def raytrace(self, beam):
        energy = 0
        queue = [beam]
        while len(queue) > 0:
            beam = queue.pop(0)
            if len(beam.tile.visited_beams) == 0:
                energy += 1
            newbeams = beam.move(self)
            queue.extend(newbeams)
        return energy


class Beam:
    def __init__(self, tile, dx, dy):
        self.tile = tile
        self.dx = dx
        self.dy = dy

    def move(self, field):
        if self in self.tile.visited_beams:
            return []  # ray traversed tile already: stop endless loop
        self.tile.visited_beams.add(self)

        (nexts, nexty) = (self.tile.x + self.dx, self.tile.y + self.dy)
        if nexts < 0 or nexts >= field.width or nexty < 0 or nexty >= field.height:
            return []  # ray left field

        next_tile = field.get_tile(nexts, nexty)
        if next_tile.mirror == '.':
            return [Beam(next_tile, self.dx, self.dy)]
        if next_tile.mirror == '/':
            return [Beam(next_tile, -self.dy, -self.dx)]
        if next_tile.mirror == '\\':
            return [Beam(next_tile, self.dy, self.dx)]
        if next_tile.mirror == '|':
            if self.dy != 0:
                return [Beam(next_tile, self.dx, self.dy)]
            return [Beam(next_tile, 0, -1), Beam(next_tile, 0, 1)]
        if next_tile.mirror == '-':
            if self.dx != 0:
                return [Beam(next_tile, self.dx, self.dy)]
            return [Beam(next_tile, -1, 0), Beam(next_tile, 1, 0)]

    def __eq__(self, o: object) -> bool:
        if not isinstance(o, Beam):
            return False
        return self.tile.x == o.tile.x and self.tile.y == o.tile.y and self.dx == o.dx and self.dy == o.dy

    def __ne__(self, o: object) -> bool:
        return not self.__eq__(o)

    def __hash__(self) -> int:
        return hash((self.tile.x, self.tile.y, self.dx, self.dy))


field = Field(INPUT_FILE)
print(f'Solution 1: {field.solve1()}')
print(f'Solution 2: {field.solve2()}')
