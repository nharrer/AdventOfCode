from z3 import Int, Solver, sat  # pip install z3-solver
import re

INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'

# the precision we are using for numbers
epsn = 6
eps = 1.0 / 10**epsn


class Ray:
    def __init__(self, p, v):
        self.p = (float(p[0]), float(p[1]), float(p[2]))
        self.v = (float(v[0]), float(v[1]), float(v[2]))


class Line:
    def __init__(self, p1, p2):
        self.p1 = p1
        self.p2 = p2


class Hailstorm:
    def __init__(self, filename, min, max):
        self.rays = []
        self.minx = self.miny = min
        self.maxx = self.maxy = max
        with open(filename) as f:
            for lin in f:
                line = lin.strip()
                parts = re.split('[,@ ]+', line)
                self.rays.append(Ray((parts[0], parts[1], parts[2]), (parts[3], parts[4], parts[5])))

    def solve1(self):  # noqa: PLR0912
        self.lines = []

        for ray in self.rays:
            p = ray.p
            v = ray.v

            # calculate line resulting from clipping the ray with the bounding box
            points1 = []
            for x, y in ((self.minx, None), (self.maxx, None), (None, self.miny), (None, self.maxy)):
                if x:
                    if v[0] != 0:
                        yy = p[1] + v[1] * (x - p[0]) / v[0]
                        points1.append((x, yy, 0))
                elif y:
                    if v[1] != 0:
                        xx = p[0] + v[0] * (y - p[1]) / v[1]
                        points1.append((xx, y, 0))
            # filter points which are inside the bounding box and after the ray origin
            points = []
            for b in points1:
                if self.is_inside(b):
                    d = (b[0] - p[0], b[1] - p[1])
                    if d[0] * v[0] > 0 and d[1] * v[1] > 0:
                        points.append(b)
            if len(points) > 0:
                if len(points) == 1:
                    points.insert(0, p)
                elif len(points) > 2:
                    raise Exception(f'Expected 2 points, got {len(points)}')
                self.lines.append(Line(*points))

        # count intersections of all line pairs
        cnt = 0
        for idx1 in range(len(self.lines)):
            for idx2 in range(idx1 + 1, len(self.lines)):
                intersection = self.intersection(self.lines[idx1], self.lines[idx2])
                cnt += 1 if intersection is not None else 0
        return cnt

    def is_inside(self, p):
        return p[0] >= self.minx and p[0] <= self.maxx and p[1] >= self.miny and p[1] <= self.maxy

    def intersection(self, line1, line2):
        ((x1, y1, _), (x2, y2, _)) = (line1.p1, line1.p2)
        ((x3, y3, _), (x4, y4, _)) = (line2.p1, line2.p2)

        dA = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
        dB = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
        if dA == 0 or dB == 0:
            return None

        uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / dA
        uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / dB

        if uA >= -eps and uA <= (1 + eps) and uB >= -eps and uB <= (1 + eps):
            intersectionX = round(x1 + (uA * (x2 - x1)), epsn)
            intersectionY = round(y1 + (uA * (y2 - y1)), epsn)
            return (intersectionX, intersectionY, 0)

        return None

    def solve2(self):
        rx = Int('rx')  # position of rock
        ry = Int('ry')
        rz = Int('rz')
        rvx = Int('rvx')  # velocity of rock
        rvy = Int('rvy')
        rvz = Int('rvz')
        t1 = Int('t1')  # times of collision
        t2 = Int('t2')
        t3 = Int('t3')
        times = (t1, t2, t3)
        solver = Solver()
        for idx in range(0, 3):  # three equations are enough to find a solution
            ray = self.rays[idx]
            ti = times[idx]
            solver.add(int(ray.p[0]) + ti * int(ray.v[0]) == rx + ti * rvx)
            solver.add(int(ray.p[1]) + ti * int(ray.v[1]) == ry + ti * rvy)
            solver.add(int(ray.p[2]) + ti * int(ray.v[2]) == rz + ti * rvz)
        if solver.check() != sat:
            raise Exception('Unsatisfied constraints')
        sol = solver.model()
        return sol[rx].as_long() + sol[ry].as_long() + sol[rz].as_long()


# storm = Hailstorm(INPUT_FILE_TEST, 7, 27)
storm = Hailstorm(INPUT_FILE, 200000000000000, 400000000000000)
print(f'Solution 1: {storm.solve1()}')
print(f'Solution 2: {storm.solve2()}')
