import re

INPUT_FILE = 'input.txt'
TEST_INPUT_FILE1 = 'input.test1.txt'
TEST_INPUT_FILE2 = 'input.test2.txt'

NUMBER_WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']


def read(filename):
    with open(filename) as f:
        return f.readlines()


def find_number(line, reverse=False):
    buf = ''
    if reverse:
        line = line[::-1]
    for char in line:
        if char.isdigit():
            return char
        else:
            if reverse:
                buf = char + buf
                found = list(filter(lambda x: buf.startswith(x), NUMBER_WORDS))
            else:
                buf += char
                found = list(filter(lambda x: buf.endswith(x), NUMBER_WORDS))
            if found:
                nr = str(NUMBER_WORDS.index(found[0]) + 1)
                return nr


def solve1(lines):
    sum = 0
    for line in lines:
        line2 = line.strip()
        line2 = re.sub(r'[a-zA-Z]', '', line2)
        z = line2[0] + line2[-1]
        nr = int(z)
        sum += nr
    print(f'Solution 1: The sum is {sum}')


def solve2(lines):
    sum = 0
    for line in lines:
        line2 = line.strip()
        z1 = find_number(line2)
        z2 = find_number(line2, True)
        z = z1 + z2
        nr = int(z)
        sum += nr
    print(f'Solution 2: The sum is {sum}')


solve1(read(INPUT_FILE))
solve2(read(INPUT_FILE))
