using AdventOfCode;
using System.Runtime.ExceptionServices;
public class Year2025_Day07_color(string inputPath) : Solvable($"{inputPath}/input") {
    public override (object, object) Solve() {
        var grid = _inputLines.Select(p => p.ToArray()).ToArray();
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

        DumpGrid(grid, beamGrid);

        return (cnt1, cnt2);
    }

    private void DumpGrid(char[][] grid, long[,] beamGrid) {
        long maxBeamValue = beamGrid.Cast<long>().Max();
        for (int y = 0; y < grid.Length; y++) {
            for (int x = 0; x < grid[y].Length; x++) {
                char c;
                int r, g, b;
                long beamValue = beamGrid[y, x];
                if (y > 0 && beamValue > 0) {
                    c = '|';
                    (r, b) = (0, 0);
                    g = (int)(127 + 128 * (Math.Log(beamValue + 1) / Math.Log(maxBeamValue + 1)));
                } else {
                    c = grid[y][x];
                    if (c == '^') {
                        var rand = new Random(y * grid[0].Length + x);
                        r = 64 + rand.Next(128+64);
                        g = 64 + rand.Next(128+64);
                        b = 64 + rand.Next(128+64);
                    } else {
                        (r, g, b) = c switch {
                            'S' => (255, 255, 255),
                            _ => (128, 128, 255)
                        };
                    }
                }
                Console.Write($"\x1b[38;2;{r};{g};{b}m{c}\x1b[0m");
            }
            Console.WriteLine();
        }
        Console.WriteLine();
    }
}
