INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'


class Trench:
    directions = {'R': (1, 0), 'L': (-1, 0), 'U': (0, -1), 'D': (0, 1)}

    def __init__(self, dir, length):
        self.length = length
        self.dir = self.directions.get(dir)
        self.x1 = self.x2 = self.y1 = self.y2 = 0


class Logoon1:
    def __init__(self, filename):
        self.trenches = []
        with open(filename) as f:
            lines = [line.rstrip() for line in f]
            self.read_trenches(lines, self.trenches)

        current = (0, 0)
        for trench in self.trenches:
            next = (current[0] + trench.dir[0] * trench.length, current[1] + trench.dir[1] * trench.length)
            trench.x1 = min(current[0], next[0])
            trench.x2 = max(current[0], next[0])
            trench.y1 = min(current[1], next[1])
            trench.y2 = max(current[1], next[1])
            current = next

    def read_trenches(self, lines, trenches):
        for line in lines:
            parts = line.split()
            dir = parts[0]
            length = int(parts[1])
            trenches.append(Trench(dir, length))

    def solve(self):
        # we only look at the horizontal lines, and sort them in y-direction
        hlines = filter(lambda t: t.y1 == t.y2, self.trenches)
        hlines = sorted(hlines, key=lambda t: t.y1)
        hlines = list(map(lambda t: (t.x1, t.x2, t.y1), hlines))

        # for every y-position, where there are horizontal lines, we recalculate the fill lines
        area = 0
        (yprev, fill_prev) = self.jump_to_next_corner(hlines)
        while len(hlines) > 0:
            (ynow, fill_new) = self.jump_to_next_corner(hlines)
            # this are the fill lines after the current row
            fill_next = self.split_lines(fill_prev, fill_new)
            # this is the fill line for the current row
            fill_now = self.merge_lines(fill_new + fill_next)

            # add the fill area for the previous rows and the current row
            area += self.calc_line_area(fill_now)
            area += self.calc_line_area(fill_prev) * (ynow - yprev)

            (yprev, fill_prev) = (ynow + 1, fill_next)
        return area

    def split_lines(self, lines1, lines2):
        """Based on the current fill lines and the new horizontal lines, we generate how the fill lines will look like after this row."""
        newlines = []
        lns2 = lines2.copy()
        for line1 in lines1:
            while len(lns2) > 0 and lns2[0][1] <= line1[0]:
                newlines.append(lns2.pop(0))
            x1 = line1[0]
            while len(lns2) > 0 and lns2[0][0] < line1[1]:
                line2 = lns2.pop(0)
                if x1 != line2[0]:
                    newlines.append((x1, line2[0], line2[2]))
                x1 = line2[1]
            if x1 < line1[1]:
                newlines.append((x1, line1[1], line1[2]))
        newlines.extend(lns2)
        return self.merge_lines(newlines)

    def merge_lines(self, lines):
        """Merge lines that overlap"""
        if len(lines) <= 1:
            return lines
        lines = sorted(lines, key=lambda line: line[0])

        prev = lines[0]
        merged = [prev]
        for i in range(1, len(lines)):
            current = lines[i]
            if current[0] <= prev[1]:
                merged[-1] = (prev[0], max(prev[1], current[1]), prev[2])
            else:
                merged.append(current)
            prev = merged[-1]
        return merged

    def jump_to_next_corner(self, lines):
        y = lines[0][2]
        hl = []
        while len(lines) > 0 and lines[0][2] == y:
            hl.append(lines.pop(0))
        hl = sorted(hl, key=lambda line: line[0])
        return (y, hl)

    def calc_line_area(self, lines):
        return sum(map(lambda line: line[1] - line[0] + 1, lines))


class Lagoon2(Logoon1):
    def read_trenches(self, lines, trenches):
        directions = ['R', 'D', 'L', 'U']
        for line in lines:
            parts = line.split()
            dircode = int(parts[2][-2])
            dir = directions[dircode % 4]
            lenhex = parts[2][2:-2]
            trenches.append(Trench(dir, int(lenhex, 16)))


lagoon1 = Logoon1(INPUT_FILE)
print(f'Solution 1: {lagoon1.solve()}')
lagoon2 = Lagoon2(INPUT_FILE)
print(f'Solution 2: {lagoon2.solve()}')
