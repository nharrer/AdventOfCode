from numpy.polynomial import Polynomial  # pip install numpy

INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'


class Garden:
    def __init__(self, filename):
        self.rocks = set()
        self.start = None
        self.width = 0
        self.height = 0
        self.readfile(filename)

    def solve1(self, steps):  # noqa: B006
        state = set()
        state.add(self.start)
        record = [1]
        for _ in range(1, steps + 1):
            newstate = set()
            for pos in state:
                neighbors = self.get_neighbor(pos)
                newstate.update(neighbors)
            state = newstate
            record.append(len(state))
        return record

    def solve2(self, steps):
        # We take 4 samples at steps 65+n*131 and create a 2nd order polynomial curve fit,
        # which we use to extrapolate step 26501365 (which happens to be 65+2023*100*131).
        samples = 4
        offset = self.width // 2
        xdata = list(range(offset, offset + self.width * samples, self.width))
        record = self.solve1(xdata[-1])
        ydata = list(map(lambda x: record[x], xdata))
        p = Polynomial.fit(xdata, ydata, deg=2)
        return round(p(steps))

    def readfile(self, filename):
        with open(filename) as f:
            lines = f.readlines()
            lines = [line.strip() for line in lines]
            y = 0
            for line in lines:
                for x in range(len(line)):
                    if line[x] == '#':
                        self.rocks.add((x, y))
                    elif line[x] == 'S':
                        self.start = (x, y)
                y += 1
            self.width = len(lines[0])
            self.height = len(lines)

    def has_rock(self, pos):
        x = pos[0] % self.width
        y = pos[1] % self.height
        return (x, y) in self.rocks

    def get_neighbor(self, pos):
        neighbor = []
        for delta in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            neighbour = (pos[0] + delta[0], pos[1] + delta[1])
            if not self.has_rock(neighbour):
                neighbor.append(neighbour)
        return neighbor


garden = Garden(INPUT_FILE)
print(f'Solution 1: {garden.solve1(64)[-1]}')
print(f'Solution 2: {garden.solve2(26501365)}')
# 3740
# 620962518745459
