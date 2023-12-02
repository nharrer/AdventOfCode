INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'

COLOR_COUNT = [12, 13, 14]
COLOR_NAMES = ['red', 'green', 'blue']


def read(filename):
    games = []
    with open(filename) as f:
        for line in f:
            parts = line.strip().split(':')
            parts2 = parts[0].split(' ')
            idx = int(parts2[1])
            sets = parts[1].split(';')
            game = (idx, [])
            games.append(game)
            for set in sets:
                colors = [0, 0, 0]
                color_line = set.split(',')
                for color_str in color_line:
                    color_parts = color_str.strip().split(' ')
                    color = color_parts[1]
                    count = int(color_parts[0])
                    cindex = COLOR_NAMES.index(color)
                    colors[cindex] = count
                game[1].append(colors)
    return games


def solve1(games):
    sum = 0
    for game in games:
        valid = True
        idx = game[0]
        for set in game[1]:
            for cidx in range(0, 3):
                cmax = COLOR_COUNT[cidx]
                count = set[cidx]
                if count > cmax:
                    valid = False
        if valid:
            sum += idx
    print(f'Solution 1: The sum is {sum}')


def solve2(games):
    sum = 0
    for game in games:
        color_max = [0, 0, 0]
        for set in game[1]:
            for cidx in range(0, 3):
                count = set[cidx]
                m = max(color_max[cidx], count)
                color_max[cidx] = m
        power = color_max[0] * color_max[1] * color_max[2]
        sum += power
    print(f'Solution 2: The sum is {sum}')


games = read(INPUT_FILE)
solve1(games)
solve2(games)
