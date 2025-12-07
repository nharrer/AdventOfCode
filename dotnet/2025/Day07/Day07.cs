using AdventOfCode;

public class Year2025_Day07(string inputPath) : Solvable($"{inputPath}/input") {
    public override (object, object) Solve() {
        var grid = _inputLines.Where((_, i) => i % 2 == 0).Select(p => p.ToArray()).ToArray();
        var beamGrid = new long[grid.Length, grid[0].Length];
        long cnt1 = 0;
        beamGrid[0, Array.IndexOf(grid[0], 'S')] = 1;
        for (int y = 1; y < grid.Length; y++) {
            for (int x = 0; x < grid[y].Length; x++) {
                var b = beamGrid[y - 1, x];
                if (grid[y][x] == '^') {
                    beamGrid[y, x - 1] += b;
                    beamGrid[y, x + 1] += b;
                    cnt1 += b > 0 ? 1 : 0;
                } else {
                    beamGrid[y, x] += b;
                }
            }
        }
        long cnt2 = Enumerable.Range(0, grid[0].Length).Sum(x => beamGrid[grid.Length - 1, x]);
        return (cnt1, cnt2);
    }
}
