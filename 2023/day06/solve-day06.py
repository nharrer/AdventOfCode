import math

INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'


class Race:
    def __init__(self, nr, time, record):
        self.nr = nr
        self.time = time
        self.record = record


def readfile(filename):
    with open(filename) as f:
        lines = f.readlines()
        lines = [line.strip() for line in lines]
        return lines


def splitline1(line):
    parts = line.split(':')
    numbers = list(map(lambda x: int(x), parts[1].split()))
    return numbers


def splitline2(line):
    str = line.split(':')[1].strip()
    str = str.replace(' ', '')
    return [int(str)]


def readraces(lines, splitfunc):
    races = []
    times = splitfunc(lines[0])
    records = splitfunc(lines[1])
    for i in range(0, len(times)):
        races.append(Race(i, times[i], records[i]))
    return races


def solve(races):
    sum = 1
    for race in races:
        t1 = (race.time - math.sqrt(race.time**2 - 4 * race.record)) / 2
        t2 = (race.time + math.sqrt(race.time**2 - 4 * race.record)) / 2
        t1i = math.floor(t1 + 1)
        t2i = math.ceil(t2 - 1)
        r = t2i - t1i + 1
        sum = sum * r
    return sum


lines = readfile(INPUT_FILE)
races1 = readraces(lines, splitline1)
races2 = readraces(lines, splitline2)
print(f'Solution 1: {solve(races1)}')
print(f'Solution 2: {solve(races2)}')
