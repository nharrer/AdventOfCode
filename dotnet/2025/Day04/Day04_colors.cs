using AdventOfCode;

public class Year2025_Day04_color(string inputPath) : Solvable($"{inputPath}/input") {

    public override (object, object) Solve() {
        var grid = _inputLines.Select(p => p.ToArray()).ToArray();
        int cnt1 = LiftIt(grid, grid[0].Length, grid.Length, 1, false);
        int cnt2 = LiftIt(grid, grid[0].Length, grid.Length, null, true);
        return (cnt1, cnt2);
    }

    private int LiftIt(char[][] grid, int width, int height, int? maxrounds, bool remove) {
        (int, int)[] dirs = { (-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1) };
        int cnt = 0, round = 1;
        for (bool removed = true; removed && (maxrounds == null || round <= maxrounds); round++) {
            removed = false;
            for (int y = 0; y < height; y++) {
                for (int x = 0; x < width; x++) {
                    if (grid[y][x] == '@') {
                        var nrolls = 0;
                        foreach (var (dx, dy) in dirs) {
                            nrolls += (uint)(x + dx) < width && (uint)(y + dy) < height && grid[y + dy][x + dx] == '@' ? 1 : 0;
                        }
                        if (nrolls < 4) {
                            if (remove) { grid[y][x] = 'x'; removed = true; }
                            cnt++;
                        }
                    }
                }
            }
        }
        DumpGrid(grid);
        return cnt;
    }

    private void DumpGrid(char[][] grid) {
        int width = grid[0].Length;
        int height = grid.Length;
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                char c = grid[y][x];
                string color = c switch {
                    '@' => "\u001b[31m", // Red
                    'x' => "\u001b[32m", // Green
                    _ => "\u001b[0m"   // Reset
                };
                Console.Write($"{color}{c}\u001b[0m");
            }
            Console.WriteLine();
        }
        Console.WriteLine();
    }
}
