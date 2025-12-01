using AdventOfCode;

public class Year2025_Day01(string inputPath) : Solvable($"{inputPath}/input") {
    public override (object, object) Solve() {
        var turns = _inputLines.Select(line => (line[0], line[1..])).Select(parts => parts.Item1 == 'L' ? -int.Parse(parts.Item2) : int.Parse(parts.Item2));
        var countZero1 = 0;
        var countZero2 = 0;
        var pos = 50;
        foreach (var turn in turns) {
            var newpos = pos + turn;
            countZero2 += Math.Abs(newpos) / 100;   // Count full turns
            if (pos != 0 && newpos <= 0) {          // Count crossing zero
                countZero2++;
            }
            pos = ((newpos % 100) + 100) % 100;
            if (pos == 0) {
                countZero1++;
            }
        }

        return (countZero1, countZero2);
    }
}
