
using AdventOfCode;

public class Year2025_Day03(string inputPath) : Solvable($"{inputPath}/input") {

    public override (object, object) Solve() {
        List<List<short>> d = _inputLines.Select(l => l.Trim().ToCharArray().Select(c => (short)(c - 48)).ToList()).ToList();
        return (MaxJoltage(d, 2), MaxJoltage(d, 12));
    }

    private static long MaxJoltage(List<List<short>> digitLines, int rounds) {
        long sum = 0;
        foreach (var digits in digitLines) {
            int pos = -1; long j = 0;
            for (int k = 0; k < rounds; k++) {
                short max = 0;
                for (int i = pos + 1; i < digits.Count - rounds + k + 1; i++) {
                    var x = digits[i];
                    if (x > max) {
                        max = x; pos = i;
                    }
                }
                j = j * 10 + max;
            }
            sum += j;
        }
        return sum;
    }
}
