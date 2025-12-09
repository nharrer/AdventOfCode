using AdventOfCode;

public class Year2025_Day09(string inputPath) : Solvable($"{inputPath}/input") {

    class Point(int x, int y) {
        public int x = x, y = y, rx = x, ry = y;
    }

    public override (object, object) Solve() {
        var tiles = _inputLines.Select(p => p.Split(',').Select(int.Parse).ToArray()).Select(c => new Point(c[0], c[1])).ToList();
        var lines = tiles.Select((t1, i) => {
            var t2 = tiles[(i + 1) % tiles.Count];
            return (t1.x == t2.x ? t1.y > t2.y : t1.x > t2.x) ? (t2, t1) : (t1, t2);
        }).ToList();

        // compress field
        var xValues = tiles.Select(t => t.x).Distinct().OrderBy(x => x).ToList();
        var yValues = tiles.Select(t => t.y).Distinct().OrderBy(y => y).ToList();
        tiles.ForEach(t => (t.rx, t.ry) = (xValues.IndexOf(t.x) * 2, yValues.IndexOf(t.y) * 2));

        var (maxX, maxY) = (lines.Max(l => Math.Max(l.Item1.rx, l.Item2.rx)), lines.Max(l => Math.Max(l.Item1.ry, l.Item2.ry)));
        int[,] grid = new int[maxX + 1, maxY + 1];
        for (int y = 0; y <= maxY; y++) {
            for (int x = 0; x <= maxX; x++) {
                grid[x, y] = lines.Any(l => l.Item1.rx <= x && l.Item2.rx >= x && l.Item1.ry <= y && l.Item2.ry >= y) ? 1 : 0;
            }
        }

        // flood fill grid
        var start = (maxX < 100 ? 2 : maxX / 2, maxX < 100 ? 1 : maxY / 4);
        Queue<(int x, int y)> toVisit = new([start]);
        while (toVisit.Count > 0) {
            var (x, y) = toVisit.Dequeue();
            if (x >= 0 && x <= maxX && y >= 0 && y <= maxY && grid[x, y] == 0) {
                grid[x, y] = 1;
                new[] { (x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1) }.ToList().ForEach(p => toVisit.Enqueue(p));
            }
        }

        // brute force the hell out of it
        long maxArea1 = 0, maxArea2 = 0;
        for (int i = 0; i < tiles.Count; i++) {
            for (int j = i + 1; j < tiles.Count; j++) {
                var (tileA, tileB) = (tiles[i], tiles[j]);
                var area = (long)(Math.Abs(tileA.x - tileB.x) + 1) * (Math.Abs(tileA.y - tileB.y) + 1);
                maxArea1 = Math.Max(maxArea1, area);
                if (area > maxArea2) {
                    var (x1, y1) = (Math.Min(tileA.rx, tileB.rx), Math.Min(tileA.ry, tileB.ry));
                    var (x2, y2) = (Math.Max(tileA.rx, tileB.rx), Math.Max(tileA.ry, tileB.ry));
                    bool allFilled = true;
                    for (int y = y1; y <= y2 && allFilled; y++) {
                        for (int x = x1; x <= x2 && allFilled; x++) {
                            allFilled = grid[x, y] != 0;
                        }
                    }
                    if (allFilled) {
                        maxArea2 = area;
                    }
                }
            }
        }
        return (maxArea1, maxArea2);
    }
}
