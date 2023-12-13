from itertools import combinations
import re

INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'


class Row:
    def __init__(self, line):
        parts = line.split(' ')
        self.row = parts[0]
        self.size = len(line)
        self.brokengroups = list(map(lambda b: int(b), parts[1].split(',')))
        self.solution = 0

    def solve(self):
        knownbroken = self.row.count('#')
        allbroken = sum(self.brokengroups)
        unknownbroken = allbroken - knownbroken
        indexes = [i for i, char in enumerate(self.row) if char == '?']
        cc = combinations(indexes, unknownbroken)
        for c in cc:
            fixedlist = list(self.row)
            for i in range(0, unknownbroken):
                fixedlist[c[i]] = '#'
            fixedrow = ''.join(fixedlist)
            if self.check(fixedrow):
                self.solution += 1

    def check(self, fixedrow):
        broken = list(filter(lambda x: x > 0, map(lambda b: len(b), re.split('[.?]+', fixedrow))))
        return broken == self.brokengroups


def readfile(filename):
    with open(filename) as f:
        lines = f.readlines()
        lines = [line.strip() for line in lines]
        return lines


def solve1(lines):
    rows = []
    for line in lines:
        row = Row(line)
        row.solve()
        rows.append(row)
        print(f'{len(rows)} / {len(lines)}')
    return sum(map(lambda r: r.solution, rows))


lines = readfile(INPUT_FILE)
print(f'Solution 1: {solve1(lines)}')
# TODO: Solution 2 ;-(
