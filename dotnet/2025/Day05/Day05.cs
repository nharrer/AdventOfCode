using AdventOfCode;
public class Year2025_Day05(string inputPath) : Solvable($"{inputPath}/input") {
    public override (object, object) Solve() {
        var parts = _input.Split(LineFeed + LineFeed);
        var rangeSet = parts[0].Split(LineFeed).Select(l => l.Split('-')).Select(p => (long.Parse(p[0]), long.Parse(p[1]))).ToList();
        var ids = parts[1].Split(LineFeed).Select(long.Parse).ToList();
        for (int i = 0; i < rangeSet.Count; i++) {
            for (int j = rangeSet.Count - 1; j > i; j--) {
                var (ri1, ri2) = rangeSet[i]; var (rj1, rj2) = rangeSet[j];
                if (ri1 <= rj2 && ri2 >= rj1) {
                    rangeSet[i] = (Math.Min(ri1, rj1), Math.Max(ri2, rj2));
                    rangeSet.RemoveAt(j);
                    j = rangeSet.Count;
                }
            }
        }
        long cnt1 = ids.Sum(id => rangeSet.Count(r => id >= r.Item1 && id <= r.Item2));
        long cnt2 = rangeSet.Sum(r => r.Item2 - r.Item1 + 1);
        return (cnt1, cnt2);
    }
}
