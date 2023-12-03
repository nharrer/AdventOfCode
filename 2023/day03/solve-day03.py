class Position:
    def __init__(self, x, y):
        self.x = x
        self.y = y


class Number:
    def __init__(self, value, positions):
        self.value = value
        self.positions = positions
        self.xmin = self.positions[0].x - 1
        self.xmax = self.positions[-1].x + 1
        self.ymin = self.positions[0].y - 1
        self.ymax = self.positions[-1].y + 1

    def is_symbol_adjacent(self, symbol):
        return (
            symbol.position.x >= self.xmin
            and symbol.position.x <= self.xmax
            and symbol.position.y >= self.ymin
            and symbol.position.y <= self.ymax
        )


class Symbol:
    def __init__(self, value, position):
        self.value = value
        self.position = position


def read(filename):
    with open(filename) as f:
        lines = f.readlines()
        lines = [line.strip() for line in lines]
        return lines


def add_number(numbers, xstart, xend, y, numbuf):
    if xstart is not None:
        xrange = range(xstart, xend + 1)
        positions = [Position(x, y) for x in xrange]
        number = Number(int(numbuf), positions)
        numbers.append(number)


def create_objects(lines):
    numbers = []
    symbols = []
    y = 0
    for line in lines:
        numbuf = ''
        xstart = None
        xend = None
        for x in range(len(line)):
            c = line[x]
            if c.isdigit():
                numbuf += c
                if xstart is None:
                    xstart = x
                xend = x
            else:
                add_number(numbers, xstart, xend, y, numbuf)
                numbuf = ''
                xstart = None
                xend = None
                if c != '.':
                    symbol = Symbol(c, Position(x, y))
                    symbols.append(symbol)
        add_number(numbers, xstart, xend, y, numbuf)
        y = y + 1
    return (numbers, symbols)


def solve1(numbers, symbols):
    sum = 0
    for number in numbers:
        adjacent_symbols = list(filter(lambda s: number.is_symbol_adjacent(s), symbols))
        if adjacent_symbols:
            sum += number.value
    print('Solution 1:', sum)


def solve2(numbers, symbols):
    sum = 0
    for symbol in symbols:
        if symbol.value == '*':
            gear_numbers = []
            for number in numbers:
                if number.is_symbol_adjacent(symbol):
                    gear_numbers.append(number)
            if len(gear_numbers) == 2:
                sum = sum + (gear_numbers[0].value * gear_numbers[1].value)
    print('Solution 2:', sum)


(numbers, symbols) = create_objects(read('input.txt'))
solve1(numbers, symbols)
solve2(numbers, symbols)
