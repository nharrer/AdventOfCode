from copy import deepcopy
import math

INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'
CYCLES = 1000000000


class Field:
    def __init__(self, filename):
        self.rocks = dict()
        self.orig = dict()
        self.width = 0
        self.height = 0
        y = 0
        with open(filename) as f:
            lines = f.readlines()
            for line1 in lines:
                line = line1.strip()
                for x in range(len(line)):
                    type = line[x]
                    if type == '.':
                        continue
                    self.add_rock(Rock(type, x, y))
                y += 1
        self.orig = deepcopy(self.rocks)

    def solve1(self):
        self.tilt_north()
        return self.total_load()

    def solve2(self):
        self.reset()
        count = 0
        config0 = self.config()
        memory = {config0: count}
        while count < CYCLES:
            self.cycle()
            count += 1
            config = self.config()
            # if we saw this configuration of rocks before, we can fast forward to just below the finishing line
            if config in memory:
                last = memory[config]
                diff = count - last
                jumps = math.floor((CYCLES - count) / diff)
                count += jumps * diff  # fast forward
                memory.clear()
            memory[config] = count
        return self.total_load()

    def add_rock(self, rock):
        self.rocks[rock.pos] = rock
        self.width = max(self.width, rock.pos[0] + 1)
        self.height = max(self.height, rock.pos[1] + 1)

    def reset(self):
        self.rocks = deepcopy(self.orig)

    def config(self):
        return frozenset(map(lambda r: r.pos, filter(lambda rock: rock.type == 'O', self.rocks.values())))

    def cycle(self):
        self.tilt((0, -1), range(0, self.height), range(0, self.width), 1)  # north
        self.tilt((-1, 0), range(0, self.width), range(0, self.height), 0)  # west
        self.tilt((0, 1), range(self.height - 1, -1, -1), range(0, self.width), 1)  # south
        self.tilt((1, 0), range(self.width - 1, -1, -1), range(0, self.height), 0)  # east

    def tilt_north(self):
        self.tilt((0, -1), range(0, self.height), range(0, self.width), 1)

    def tilt(self, dir, range1, range2, order):
        for r1 in range1:
            for r2 in range2:
                pos = (r1, r2) if order == 0 else (r2, r1)
                rock = self.rocks.get(pos)
                if rock is not None:
                    if rock.type == 'O':
                        newpos = pos
                        while True:
                            (x2, y2) = (newpos[0] + dir[0], newpos[1] + dir[1])
                            if x2 < 0 or x2 >= self.width or y2 < 0 or y2 >= self.height or (x2, y2) in self.rocks:
                                break
                            newpos = (x2, y2)
                        if rock.pos != newpos:
                            rock.pos = newpos
                            self.rocks.pop(pos)
                            self.add_rock(rock)

    def total_load(self):
        return sum(map(lambda rock: self.height - rock.pos[1], filter(lambda rock: rock.type == 'O', self.rocks.values())))


class Rock:
    def __init__(self, type, x, y):
        self.type = type
        self.pos = (x, y)

    def __repr__(self):
        return f'{self.type}{self.pos}'


field = Field(INPUT_FILE)
print(f'Solution 1: {field.solve1()}')
print(f'Solution 2: {field.solve2()}')
