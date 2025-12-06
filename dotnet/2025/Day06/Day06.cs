using AdventOfCode;
using System.Text.RegularExpressions;

public partial class Year2025_Day06(string inputPath) : Solvable($"{inputPath}/input") {
    public override (object, object) Solve() {
        var lines = _inputLinesRaw.Where(l => l.Length > 0).ToArray();
        var values = lines.SkipLast(1).Select(l => Regex.Split(l.Trim(), @"\s+").Select(int.Parse).ToArray()).ToArray();
        var operators = Regex.Split(lines.Last().Trim(), @"\s+");
        var matrix = lines.SkipLast(1).Select(l => l.ToCharArray()).ToArray();
        var transposed = Enumerable.Range(0, matrix[0].Length).Select(c => new string([.. matrix.Select(r => r[c])]).Trim()).ToArray();

        Func<string, long, long, long> apply = (op, a, b) => op == "+" ? a + b : a * b;
        long sum1 = operators.Select((op, i) => values.Aggregate(op == "+" ? 0L : 1L, (res, line) => apply(op, res, line[i]))).Sum();
        long sum2 = transposed.Aggregate((sum: 0L, res: 0L, i: 0), (acc, s) => s.Length > 0
                ? (acc.sum, apply(operators[acc.i], acc.res, int.Parse(s)), acc.i)
                : (acc.sum + acc.res, operators[++acc.i] == "+" ? 0 : 1, acc.i)
            , acc => acc.sum + acc.res);
        return (sum1, sum2);
    }
}
