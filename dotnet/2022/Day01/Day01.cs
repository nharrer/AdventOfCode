using AdventOfCode;

public class Year2022_Day01(string inputPath) : Solvable($"{inputPath}/input") {
    public override (object, object) Solve() {
        var blocks = _input.Split(LineFeed + LineFeed, StringSplitOptions.TrimEntries);
        var sums = blocks.Select(block => block.Split(LineFeed).Select(int.Parse).Sum()).OrderByDescending(s => s).ToList();
        var part1 = sums.First();
        var part2 = sums.Take(3).Sum();
        return (part1, part2);
    }
}
