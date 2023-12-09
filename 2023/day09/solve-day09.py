INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'


def readfile(filename):
    with open(filename) as f:
        lines = f.readlines()
        lines = [line.strip() for line in lines]
        return lines


def read(lines):
    sequences = []
    for line in lines:
        numbers = list(map(lambda c: int(c), line.split()))
        sequences.append(numbers)
    return sequences


def differentiate(sequence):
    diffs = []
    for i in range(1, len(sequence)):
        diffs.append(sequence[i] - sequence[i - 1])
    return diffs


def solve_sequence(sequence, direction):
    current = sequence
    stack = []
    iszero = False
    while not iszero:
        stack.insert(0, current)
        current = differentiate(current)
        iszero = len(list(filter(lambda n: n != 0, current))) == 0
    value = 0
    for seq in stack:
        next = seq[direction]
        value = next - value if direction == 0 else next + value
    return value


def solve(sequences, direction):
    sum = 0
    for sequence in sequences:
        sum += solve_sequence(sequence, direction)
    return sum


sequences = read(readfile(INPUT_FILE))
print(f'Solution 1: {solve(sequences, -1)}')
print(f'Solution 2: {solve(sequences, 0)}')
