from itertools import combinations
from copy import deepcopy


class Universe:
    def __init__(self, filename):
        self.galaxies = set()
        y = 0
        with open(filename) as f:
            for line in f:
                x = 0
                for symbol in line:
                    if symbol == '#':
                        self.galaxies.add((x, y))
                    x += 1
                y += 1

    def expand(self, dist):
        xes = set(map(lambda g: g[0], self.galaxies))
        for x in sorted(set(range(0, max(xes))).difference(xes), reverse=True):
            for g in list(filter(lambda g: g[0] > x, self.galaxies)):
                self.galaxies.remove(g)
                self.galaxies.add((g[0] + dist, g[1]))

        yes = set(map(lambda g: g[1], self.galaxies))
        for y in sorted(set(range(0, max(yes))).difference(yes), reverse=True):
            for g in list(filter(lambda g: g[1] > y, self.galaxies)):
                self.galaxies.remove(g)
                self.galaxies.add((g[0], g[1] + dist))
        return self

    def distances(self):
        return sum(map(lambda t: self.distance(*t), combinations(self.galaxies, 2)))

    def distance(self, g1, g2):
        return abs(g1[0] - g2[0]) + abs(g1[1] - g2[1])


universe = Universe('input.txt')
print(f'Solution 1: {deepcopy(universe).expand(1).distances()}')
print(f'Solution 2: {deepcopy(universe).expand(1000000 - 1).distances()}')
