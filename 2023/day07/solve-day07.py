from enum import Enum
from copy import copy

INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'


class HandType(Enum):
    FiveOfKind = 7
    FourOfKind = 6
    FullHouse = 5
    ThreeOfKind = 4
    TwoPairs = 3
    OnePair = 2
    HighCard = 1

    def __str__(self):
        return f'{self.name}'

    def __repr__(self):
        return str(self)


class Card:
    def __init__(self, name, value, isJoker=False):
        self.name = name
        self.value = value
        self.isJoker = isJoker

    def __str__(self):
        return f'{self.name}[{self.value}]'

    def __repr__(self):
        return str(self)

    def __eq__(self, other: object) -> bool:
        return self.value == other.value

    def __lt__(self, other):
        return self.value < other.value

    def __gt__(self, other):
        return self.value > other.value


class Hand:
    def __init__(self, cards, bid):
        self.cards = self.replace_joker(cards)
        self.bid = bid
        self.suit = self.classify()
        self.value = self.suit.value

    def replace_joker(self, cards):
        jokerplaces = []
        indices = list(map(lambda c: allcards.index(c), cards))
        for place in range(0, len(cards)):
            if cards[place].isJoker:
                jokerplaces.append(place)
                indices[place] = 0

        if len(jokerplaces) == 0:
            # there are no jokers -> return as is
            return cards

        if len(jokerplaces) == len(cards):
            # a little speedup: if there are all jokers -> return Five of A
            aces = list(map(lambda c: self.replacejoker(c, allcards[0]), cards))
            return aces

        # go through all possible joker permutations
        best = None
        maxindex = len(allcards) - 2  # use all cards without joker
        while True:
            newcards = [self.replacejoker(cards[i], allcards[cardidx]) for i, cardidx in enumerate(indices)]
            newhand = Hand(newcards, 0)
            if best is None or newhand > best:
                best = newhand

            carry = 1
            for idx in jokerplaces:
                x = indices[idx]
                x = x + carry
                carry = 0
                if x > maxindex:
                    x = 0
                    carry = 1
                indices[idx] = x
            if carry == 1:
                break
        return best.cards

    def classify(self):
        countmap = {}
        for card in self.cards:
            countmap[card.name] = countmap.get(card.name, 0) + 1

        counts = list(countmap.values())
        if 5 in counts:
            return HandType.FiveOfKind
        elif 4 in counts:
            return HandType.FourOfKind
        elif 3 in counts and 2 in counts:
            return HandType.FullHouse
        elif 3 in counts:
            return HandType.ThreeOfKind
        elif counts.count(2) == 2:
            return HandType.TwoPairs
        elif 2 in counts:
            return HandType.OnePair
        else:
            return HandType.HighCard

    def replacejoker(self, card, newcard):
        if card.isJoker:
            # replaces the card, but with the value of the joker
            card2 = copy(newcard)
            card2.value = card.value
            return card2
        return card

    def __str__(self):
        cstr = [str(card) for card in self.cards]
        cstr = ' '.join(cstr)
        return f'H({cstr}: {self.suit}[{self.value}])'

    def __repr__(self):
        return str(self)

    def __eq__(self, other: object) -> bool:
        if self.value == other.value:
            for i in range(0, len(self.cards)):
                if self.cards[i] != other.cards[i]:
                    return False
            return True

    def __lt__(self, other):
        if self.value == other.value:
            for i in range(0, len(self.cards)):
                if self.cards[i] != other.cards[i]:
                    return self.cards[i] < other.cards[i]
            return False
        return self.value < other.value

    def __gt__(self, other):
        return (not self.__eq__(other)) and (not self.__lt__(other))


def readfile(filename):
    with open(filename) as f:
        lines = f.readlines()
        lines = [line.strip() for line in lines]
        return lines


def readhands(lines):
    hands = []
    for line in lines:
        parts = line.split()
        cards = list(map(lambda c: next((card for card in allcards if card.name == c), None), list(parts[0])))
        value = int(parts[1])
        hands.append(Hand(cards, value))
    return hands


def solve(hands):
    hands2 = sorted(hands)
    sum = 0
    for rank in range(0, len(hands2)):
        hand = hands2[rank]
        sum = sum + hand.bid * (rank + 1)
    return sum


allcards = [
    Card('A', 14),
    Card('K', 13),
    Card('Q', 12),
    Card('T', 10),
    Card('9', 9),
    Card('8', 8),
    Card('7', 7),
    Card('6', 6),
    Card('5', 5),
    Card('4', 4),
    Card('3', 3),
    Card('2', 2),
    Card('J', 11, isJoker=False),  # in part 1, this is not a joker
]

lines = readfile(INPUT_FILE)
hands = readhands(lines)
print(f'Solution 1: {solve(hands)}')

j_card = allcards[-1]
j_card.isJoker = True
j_card.value = 1
hands = readhands(lines)
print(f'Solution 2: {solve(hands)}')
