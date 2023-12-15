INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'


class Sequence:
    def __init__(self, filename):
        self.lenses = []
        with open(filename) as f:
            for term in f.read().strip().split(','):
                (i, op) = next(filter(lambda x: x[1] in ('=', '-'), enumerate(term)), (-1, ''))
                label = term[0:i]
                value = int(term[(i + 1) :]) if op == '=' else 0
                self.lenses.append(Lens(term, label, op, value))

    def solve1(self):
        return sum(map(lambda lens: lens.hash(lens.term), self.lenses))

    def solve2(self):
        boxes = list(map(lambda nr: Box(nr), range(256)))
        for lens in self.lenses:
            box = boxes[lens.destination]
            if lens.op == '=':
                box.add_lens(lens)
            else:
                box.remove_lens(lens)
        return sum(map(lambda box: box.focusing_power(), boxes))


class Lens:
    def __init__(self, term, label, op, value):
        self.term = term
        self.label = label
        self.op = op
        self.value = value
        self.destination = self.hash(label)

    def hash(self, term):
        v = 0
        for c in term:
            a = ord(c)
            v += a
            v *= 17
            v = v % 256
        return v

    def __repr__(self):
        return f'{self.term}'


class Box:
    def __init__(self, nr):
        self.nr = nr
        self.lenses = []

    def add_lens(self, lens):
        index = self.find(lens)
        if index == -1:
            self.lenses.append(lens)
        else:
            self.lenses[index] = lens

    def remove_lens(self, lens):
        index = self.find(lens)
        if index != -1:
            self.lenses.pop(index)

    def find(self, lens):
        return next((i for i, le in enumerate(self.lenses) if le.label == lens.label), -1)

    def focusing_power(self):
        return sum(map(lambda x: (self.nr + 1) * (x[0] + 1) * x[1].value, enumerate(self.lenses)))

    def __repr__(self):
        return f'{self.nr}{self.lenses}'


sequence = Sequence(INPUT_FILE)
print(f'Solution 1: {sequence.solve1()}')
print(f'Solution 2: {sequence.solve2()}')
