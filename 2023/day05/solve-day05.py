from functools import reduce

INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'


class Range:
    def __init__(self, start, end):
        self.start = start
        self.end = end

    def valueInRange(self, value):
        return value >= self.start and value <= self.end

    def splitrange(self, range):
        parts = []
        if range.start < self.start:
            parts.append(Range(range.start, min(range.end, self.start - 1)))
        if range.start <= self.end and range.end >= self.start:
            parts.append(Range(max(self.start, range.start), min(self.end, range.end)))
        if range.end > self.end:
            parts.append(Range(max(self.end + 1, range.start), range.end))
        return parts

    def __str__(self):
        return f'R({self.start}-{self.end})'

    def __repr__(self):
        return str(self)


class RangeMap:
    def __init__(self, sstart, dstart, range):
        self.srange = Range(sstart, sstart + range - 1)
        self.drange = Range(dstart, dstart + range - 1)

    def mapvalue(self, value):
        if self.srange.valueInRange(value):
            return value - self.srange.start + self.drange.start
        else:
            return None

    def maprange(self, range):
        if self.srange.valueInRange(range.start):
            dstart = self.mapvalue(range.start)
            dend = self.mapvalue(range.end)
            if (dstart is None) or (dend is None):
                raise Exception('Invalid range! This should not happen!')
            return Range(dstart, dend)
        else:
            return range

    def __str__(self):
        return f'{self.srange} -> {self.drange}'

    def __repr__(self):
        return str(self)


class Mapper:
    def __init__(self, sname, dname, mappers):
        self.sname = sname
        self.dname = dname
        self.rangemaps = []
        self.mappers = mappers

    def mapranges(self, ranges):
        sranges = ranges
        for rangemap in self.rangemaps:
            sranges = reduce(
                lambda x, y: x + y,
                map(lambda srange: rangemap.srange.splitrange(srange), sranges),
            )

        dranges = map(
            lambda srange: next(
                map(
                    lambda rangemap: rangemap.maprange(srange),
                    filter(lambda rangemap: rangemap.srange.valueInRange(srange.start), self.rangemaps),
                ),
                srange,
            ),
            sranges,
        )

        nextmapper = self.mappers.get(self.dname)
        if nextmapper is not None:
            return nextmapper.mapranges(dranges)
        return dranges

    def __str__(self):
        return f'{self.sname} -> {self.dname}: {", ".join(map(lambda x: str(x), self.rangemaps))}'

    def __repr__(self):
        return str(self)


def readfile(filename):
    with open(filename) as f:
        lines = f.readlines()
        lines = [line.strip() for line in lines]
        return lines


def readmaps(lines):
    seeds = []
    mappers = {}
    mapper = None
    for line in lines:
        if line.startswith('seeds: '):
            parts = line.split(': ')[1]
            seeds = list(map(lambda x: int(x), parts.split()))
        elif ':' in line:
            [sname, _, dname] = line.split()[0].split('-')
            mapper = Mapper(sname, dname, mappers)
            mappers[sname] = mapper
        elif line.strip():  # Check if line is not empty
            if not mapper:
                raise Exception('No mapper')
            values = list(map(lambda x: int(x), line.split()))
            rangemap = RangeMap(values[1], values[0], values[2])
            mapper.rangemaps.append(rangemap)
        else:
            mapper = None
    return [seeds, mappers]


def find_location(sranges, mappers):
    locationranges = mappers['seed'].mapranges(sranges)
    locations = sorted(map(lambda range: range.start, locationranges))
    return locations[0]


def solve1(seeds, mappers):
    sranges = map(lambda seed: Range(seed, seed), seeds)
    return find_location(sranges, mappers)


def solve2(seeds, mappers):
    sranges = []
    idx = 0
    while idx < len(seeds):
        sstart = seeds[idx]
        send = sstart + seeds[idx + 1] - 1
        sranges.append(Range(sstart, send))
        idx = idx + 2

    return find_location(sranges, mappers)


[seeds, mappers] = readmaps(readfile(INPUT_FILE))
print(f'Solution 1: {solve1(seeds, mappers)}')
print(f'Solution 2: {solve2(seeds, mappers)}')
