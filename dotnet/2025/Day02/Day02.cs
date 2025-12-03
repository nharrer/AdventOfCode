
using AdventOfCode;

public class Year2025_Day02(string inputPath) : Solvable($"{inputPath}/input") {
    public override (object, object) Solve() {
        var ranges = _inputLines[0].Split(',').Select(p => { var n = p.Split('-'); return (long.Parse(n[0]), long.Parse(n[1])); });
        long s1 = 0, s2 = 0;
        foreach (var rg in ranges) {
            var c = new HashSet<long>();
            for (long pos = 1, a = 1; a == 1; pos++) {
                long d = (long)Math.Pow(10, (int)Math.Log10(pos) + 1);
                long check = pos;
                bool first = true;
                a = 0;
                while (true) {
                    check = d * check + pos;
                    if (check > rg.Item2) {
                        break;
                    }
                    if (check >= rg.Item1 && check <= rg.Item2) {
                        if (first) { s1 += check; }
                        if (c.Add(check)) { s2 += check; }
                    }
                    a = 1;
                    first = false;
                }
            }
        }
        return (s1, s2);
    }
}
