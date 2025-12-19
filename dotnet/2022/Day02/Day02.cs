using AdventOfCode;

public class Year2022_Day02(string inputPath) : Solvable($"{inputPath}/input") {
    // Note: 0 = Rock, 1 = Paper, 2 = Scissors
    public override (object, object) Solve() {
        var pairs = _inputLines.Select(line => line.Split(' ')).Select(parts => (parts[0][0] - 'A', parts[1][0] - 'X'));
        var part1 = pairs.Sum(p => Score(p.Item1, p.Item2));
        var part2 = pairs.Sum(p => Score(p.Item1, ChooseMove(p.Item1, p.Item2)));
        return (part1, part2);
    }

    protected static int Score(int opponent, int me) {
        if (me == opponent) return me + 1 + 3;              // draw
        if ((opponent + 1) % 3 == me) return me + 1 + 6;    // win
        return me + 1 + 0;                                  // lose
    }

    protected static int ChooseMove(int opponent, int outcome) {
        // lose 0: Choose the previous symbol: +2 = (0 + 2) % 3
        // draw 1: Choose the same symbol:     +0 = (1 + 2) % 3
        // win  2: Choose the next symbol:     +1 = (2 + 2) % 3
        return (opponent + outcome + 2) % 3;
    }
}
