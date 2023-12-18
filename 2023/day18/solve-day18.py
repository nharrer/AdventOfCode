INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'


class Trench:
    def __init__(self, dir, length):
        self.dir = dir
        self.length = length
        if dir == 'R':
            self.dir = (1, 0)
        elif dir == 'L':
            self.dir = (-1, 0)
        elif dir == 'U':
            self.dir = (0, -1)
        elif dir == 'D':
            self.dir = (0, 1)
        self.xmin = 0
        self.xmax = 0
        self.ymin = 0
        self.ymax = 0


class Dig:
    def __init__(self, pos, symbol):
        self.pos = pos
        self.symbol = symbol

    def __str__(self):
        return self.symbol


class Field1:
    def __init__(self, filename):
        self.trenches = []
        self.read(filename)
        self.fields = {}
        self.minx = 0
        self.maxx = 0
        self.miny = 0
        self.maxy = 0
        current = (0, 0)
        c = (0, 0)
        for trench in self.trenches:
            next = (current[0] + trench.dir[0] * trench.length, current[1] + trench.dir[1] * trench.length)
            self.minx = min(self.minx, current[0], next[0])
            self.maxx = max(self.maxx, current[0], next[0])
            self.miny = min(self.miny, current[1], next[1])
            self.maxy = max(self.maxy, current[1], next[1])
            trench.xmin = min(current[0], next[0])
            trench.xmax = max(current[0], next[0])
            trench.ymin = min(current[1], next[1])
            trench.ymax = max(current[1], next[1])
            current = next

            # for _ in range(trench.length):
            #     c = (c[0] + trench.dir[0], c[1] + trench.dir[1])
            #     self.fields[c] = Dig(c, '#')

    def read(self, filename):
        with open(filename) as f:
            for line1 in f.readlines():
                parts = line1.strip().split()
                dir = parts[0]
                length = int(parts[1])
                self.trenches.append(Trench(dir, length))

    def solve_old(self):
        start = self.findstart()
        self.fill(start, '#')
        self.save('output1.txt')
        return len(self.fields)

    def solve(self):
        filename = 'output2.txt'
        with open(filename, 'w') as _:
            pass

        hlines = filter(lambda t: t.ymin == t.ymax, self.trenches)
        hlines = sorted(hlines, key=lambda t: t.ymin)
        hlines = list(map(lambda t: (t.xmin, t.xmax, t.ymin), hlines))

        area = 0
        (ylast, hlast) = self.get_next(hlines)
        while len(hlines) > 0:
            (ynow, hnow) = self.get_next(hlines)

            ydiff = ynow - ylast

            # self.print_hlines(hlast, ydiff, filename)
            area += self.calc_area(hlast) * ydiff

            hlater = self.split_lines(hlast, hnow)

            hnow2 = self.merge_lines(hlater, hnow)

            # self.print_hlines(hnow2, 1, filename)
            area += self.calc_area(hnow2)

            hlast = hlater
            ylast = ynow + 1

        return area

    def split_lines(self, lines1, lines2x):
        lines2 = lines2x.copy()
        hl = []
        for line1 in lines1:
            while len(lines2) > 0 and lines2[0][1] <= line1[0]:
                hl.append(lines2.pop(0))
            x1 = line1[0]
            while len(lines2) > 0 and lines2[0][0] < line1[1]:
                line2 = lines2.pop(0)
                if x1 == line2[0]:
                    x1 = line2[1]
                else:
                    hl.append((x1, line2[0], line2[2]))
                    x1 = line2[1]
            if x1 < line1[1]:
                hl.append((x1, line1[1], line1[2]))

        hl.extend(lines2)
        hl2 = self.merge_lines(hl, [])
        return hl2

    def merge_lines(self, lines1, lines2):
        lines = lines1 + lines2
        if len(lines) <= 1:
            return lines
        lines = sorted(lines, key=lambda line: line[0])

        last = lines[0]
        merged = [last]
        for i in range(1, len(lines)):
            current = lines[i]
            if current[0] <= last[1]:
                merged[-1] = (last[0], max(last[1], current[1]), last[2])
            else:
                merged.append(current)
            last = merged[-1]
        return merged

    def get_next(self, lines):
        y = lines[0][2]
        hl = []
        while len(lines) > 0 and lines[0][2] == y:
            hl.append(lines.pop(0))
        hl = sorted(hl, key=lambda line: line[0])
        return (y, hl)

    def calc_area(self, lines):
        area = 0
        for line in lines:
            area += line[1] - line[0] + 1
        return area

    def print_hlines(self, lines, ydiff, filename):
        with open(filename, 'a') as f:
            for _ in range(ydiff):
                for x in range(self.minx, self.maxx + 1):
                    if len(list(filter(lambda line: x >= line[0] and x <= line[1], lines))) > 0:
                        f.write('#')
                    else:
                        f.write(' ')
                f.write('\n')

    def findstart(self):
        for y in range(self.miny, self.maxy + 1):
            lasttwo = ''
            for x in range(self.minx, self.maxx + 1):
                dig = self.fields.get((x, y), None)
                c = dig.symbol if dig else ' '
                if lasttwo == ' #' and c == ' ':
                    return (x, y)
                lasttwo += c
                if len(lasttwo) > 2:
                    lasttwo = lasttwo[1:]
        raise Exception('No start found')

    def fill(self, pos, symbol):
        queue = [pos]
        while len(queue) > 0:
            pos = queue.pop(0)
            if pos in self.fields:
                continue
            self.fields[pos] = Dig(pos, symbol)
            for d in [(1, 0), (0, 1), (-1, 0), (0, -1)]:
                queue.append((pos[0] + d[0], pos[1] + d[1]))

    def str(self):
        str = ''
        for y in range(self.miny, self.maxy + 1):
            for x in range(self.minx, self.maxx + 1):
                dig = self.fields.get((x, y), None)
                c = dig.symbol if dig else ' '
                str += c
            str += '\n'
        return str

    def save(self, filename):
        str = self.str()
        # write str to file
        with open(filename, 'w') as f:
            f.write(str)


class Field2(Field1):
    def __init__(self, filename):
        super().__init__(filename)

    def read(self, filename):
        with open(filename) as f:
            for line1 in f.readlines():
                parts = line1.strip().split()
                dircode = int(parts[2][-2])
                lenhex = parts[2][2:-2]
                # convert lenhex to int
                length = int(lenhex, 16)
                if dircode == 0:
                    dir = 'R'
                elif dircode == 1:
                    dir = 'D'
                elif dircode == 2:
                    dir = 'L'
                else:
                    dir = 'U'
                self.trenches.append(Trench(dir, length))
        pass


field1 = Field1(INPUT_FILE)
print(f'Solution 1: {field1.solve()}')
field2 = Field2(INPUT_FILE)
print(f'Solution 2: {field2.solve()}')

# Solution 1: 33491
# Solution 2: 87716969654406
