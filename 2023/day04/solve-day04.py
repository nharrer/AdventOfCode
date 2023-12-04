INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'


class Card:
    def __init__(self, nr, wnrs, nrs):
        self.nr = nr
        self.wnrs = wnrs
        self.nrs = nrs
        self.winners = 0
        self.copies = 1
        for wnr in wnrs:
            if wnr in nrs:
                self.winners += 1


def read(filename):
    with open(filename) as f:
        lines = f.readlines()
        lines = [line.strip() for line in lines]
        return lines


def readcards(filename):
    cards = []
    lines = read(filename)
    for line in lines:
        [cardstr, block] = line.split(': ')
        cardnr = int(cardstr.split()[1])
        [wnrs, nrs] = block.split(' | ')
        wnrs = list(map(lambda x: int(x), wnrs.split()))
        nrs = list(map(lambda x: int(x), nrs.split()))
        card = Card(cardnr, wnrs, nrs)
        cards.append(card)
    return cards


def solve1(cards):
    sum = 0
    for card in cards:
        if card.winners > 0:
            points = 2 ** (card.winners - 1)
            # print(f'Card {card.nr} wins {points} points')
            sum = sum + points
    return sum


def solve2(cards):
    sum = 0
    for i in range(0, len(cards)):
        card = cards[i]
        amount = card.copies
        j = i + 1 + card.winners
        j = min(j, len(cards))
        for k in range(i + 1, j):
            card2 = cards[k]
            card2.copies += amount
        sum = sum + card.copies
    return sum


cards = readcards(INPUT_FILE)

print(f'Solution 1: {solve1(cards)}')
print(f'Solution 2: {solve2(cards)}')
