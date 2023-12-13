import numpy as np

INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'


class Fields:
    def __init__(self, filename):
        self.fields = []
        lines = self.readfile(filename)
        part = []
        for line in lines:
            if line == '':
                self.fields.append(Field(part))
                part = []
            else:
                part.append(line)
        self.fields.append(Field(part))

    def readfile(self, filename):
        with open(filename) as f:
            lines = f.readlines()
            lines = [line.strip() for line in lines]
            return lines

    def solve(self):
        solutions = [0, 0]
        for i in range(0, len(self.fields)):
            print(f'{i + 1} / {len(self.fields)}')
            field = self.fields[i]
            [sol1, sol2] = field.solve()
            solutions[0] += sol1
            solutions[1] += sol2
        return solutions


class Field:
    def __init__(self, lines):
        self.matrix = np.array([list(line) for line in lines])
        self.transposed = np.transpose(self.matrix)
        (self.height, self.width) = self.matrix.shape

    def solve(self):
        s1 = self.findmirrors((-1, -1))
        for x in range(0, self.width):
            for y in range(0, self.height):
                smudge = (x, y)
                s2 = self.findmirrors(smudge, [s1[0] - 1, s1[1] - 1])
                if s1 != s2 and s2 != (0, 0):  # noqa: PLR1714
                    return (s1[0] + 100 * s1[1], s2[0] + 100 * s2[1])
        raise Exception('No solution 2 found')

    def findmirrors(self, smudge1, ignore=(-1, -1)):
        smudge2 = (smudge1[1], smudge1[0])
        s1 = self.findmirror(self.transposed, smudge2, ignore[0])
        s2 = self.findmirror(self.matrix, smudge1, ignore[1])
        return (s1, s2)

    def findmirror(self, matrix, smudge, ignore):
        height = len(matrix)
        width = len(matrix[0])
        for y in filter(lambda y: y != ignore, range(0, height - 1)):
            y1 = y
            y2 = y + 1
            mirror = True
            while y1 >= 0 or y2 < height:
                for x in range(0, width):
                    if self.get(matrix, smudge, [x, y1], [x, y2]) != self.get(matrix, smudge, [x, y2], [x, y1]):
                        mirror = False
                        break
                y1 -= 1
                y2 += 1
            if mirror:
                return y + 1
        return 0

    def get(self, matrix, smudge, p1, p2):
        [x, y] = p1
        (height, width) = matrix.shape
        if x < 0 or y < 0 or x >= width or y >= height:
            if p2 is None:
                raise Exception('Out of bounds')
            return self.get(matrix, smudge, p2, None)
        c = matrix[y][x]
        if (x, y) == smudge:
            c = '.' if c == '#' else '#'
        return c


fields = Fields(INPUT_FILE)
solutions = fields.solve()
print(f'Solution 1: {solutions[0]}')
print(f'Solution 2: {solutions[1]}')
