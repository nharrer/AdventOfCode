using AdventOfCode;

public class Year2025_Day12(string inputPath) : Solvable($"{inputPath}/input") {

    public override (object, object) Solve() {
        var parts = _input.Split(LineFeed + LineFeed);
        var presents = parts.Take(parts.Length - 1).Select(x => string.Concat(x.Split(LineFeed).Skip(1)).Count(c => c == '#')).ToArray();

        int solvableCount = 0;
        foreach (var line in parts.Last().Split(LineFeed)) {
            var p = line.Split(": ");
            var s = p[0].Split("x");
            int numCells = int.Parse(s[0]) * int.Parse(s[1]);
            var numbers = p[1].Split(" ").Select(int.Parse).ToList();
            int totalCellsCovered = numbers.SelectMany((cnt, id) => Enumerable.Repeat(presents[id], cnt)).Sum();
            bool solvable = totalCellsCovered <= numCells;
            solvableCount += solvable ? 1 : 0;
            Console.WriteLine($"  Grid cells: {numCells}, Cells to cover: {totalCellsCovered,4}: {(solvable ? "POSSIBLE" : "IMPOSSIBLE")}");
        }

        return (solvableCount, 0);
    }
}
