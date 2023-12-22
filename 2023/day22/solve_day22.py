INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'


class Brick:
    def __init__(self, id, pos1, pos2):
        self.id = id
        self.pos1 = pos1
        self.pos2 = pos2
        assert pos1[0] <= pos2[0]  # x
        assert pos1[1] <= pos2[1]  # y
        assert pos1[2] <= pos2[2]  # z
        self.above = set()
        self.below = set()

    def intercects_xy(self, other):
        return (
            self.pos1[0] <= other.pos2[0]
            and self.pos2[0] >= other.pos1[0]
            and self.pos1[1] <= other.pos2[1]
            and self.pos2[1] >= other.pos1[1]
        )

    def __hash__(self):
        return self.id

    def __eq__(self, o: object):
        return self.id == o.id


class Sandbox:
    def __init__(self, filename):
        self.bricks = []
        self.readfile(filename)
        self.collapse()
        self.connect()

    def solve1(self):
        self.culprits = set()
        for brick in filter(lambda b: len(b.below) == 1, self.bricks):
            self.culprits.add(next(iter(brick.below), None))
        return len(self.bricks) - len(self.culprits)

    def solve2(self):
        cnt = 0
        for brick in self.culprits:
            fallen = set([brick])
            queue = list(brick.above)
            while len(queue) > 0:
                queue.sort(key=lambda b: b.pos1[2])
                b2 = queue.pop(0)
                if len(b2.below - fallen) == 0:
                    fallen.add(b2)
                    queue.extend(filter(lambda b: b not in fallen, b2.above))
            cnt += len(fallen) - 1
        return cnt

    def connect(self):
        for brick1 in self.bricks:
            for brick2 in self.bricks:
                if brick1 != brick2:
                    z1 = brick1.pos2[2]
                    z2 = brick2.pos1[2]
                    if z1 == (z2 - 1):
                        if brick1.intercects_xy(brick2):
                            brick1.above.add(brick2)
                    z1 = brick1.pos1[2]
                    z2 = brick2.pos2[2]
                    if z1 == (z2 + 1):
                        if brick1.intercects_xy(brick2):
                            brick1.below.add(brick2)

    def collapse(self):
        self.bricks.sort(key=lambda b: b.pos1[2])
        stable = False
        while not stable:
            stable = True
            for brick in self.bricks:
                # get all bricks underneath and move the current to the top of that stack
                range_below = ((brick.pos1[0], brick.pos2[0]), (brick.pos1[1], brick.pos2[1]), (1, brick.pos1[2] - 1))
                bricks_below = self.get_bricks_in_space(range_below)
                zmax = 1
                if len(bricks_below) > 0:
                    zmax = max(map(lambda b: b.pos2[2] + 1, bricks_below))
                if zmax < brick.pos1[2]:
                    deltaz = brick.pos1[2] - zmax
                    brick.pos1 = (brick.pos1[0], brick.pos1[1], brick.pos1[2] - deltaz)
                    brick.pos2 = (brick.pos2[0], brick.pos2[1], brick.pos2[2] - deltaz)
                    stable = False

    def get_bricks_in_space(self, ranges):
        def overlap(brick, xrange, yrange, zrange):
            return (
                (xrange is None or (xrange[0] <= brick.pos2[0] and xrange[1] >= brick.pos1[0]))
                and (yrange is None or (yrange[0] <= brick.pos2[1] and yrange[1] >= brick.pos1[1]))
                and (zrange is None or (zrange[0] <= brick.pos2[2] and zrange[1] >= brick.pos1[2]))
            )

        return list(filter(lambda b: overlap(b, *ranges), self.bricks))

    def readfile(self, filename):
        with open(filename) as f:
            for rawline in f:
                line = rawline.strip()
                parts = line.split('~')
                pos1 = tuple(map(lambda c: int(c), parts[0].split(',')))
                pos2 = tuple(map(lambda c: int(c), parts[1].split(',')))
                self.bricks.append(Brick(len(self.bricks) + 1, pos1, pos2))


if __name__ == '__main__':
    sandbox = Sandbox(INPUT_FILE)
    print(f'Solution 1: {sandbox.solve1()}')
    print(f'Solution 2: {sandbox.solve2()}')
