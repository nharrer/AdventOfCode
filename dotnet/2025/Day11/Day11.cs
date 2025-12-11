using AdventOfCode;

public class Year2025_Day11(string inputPath) : Solvable($"{inputPath}/input") {

    public override (object, object) Solve() {
        var devices = _inputLines.Select(line => line.Split([':', ' '], StringSplitOptions.RemoveEmptyEntries))
                                 .ToDictionary(parts => parts[0], parts => parts.Skip(1).ToList());
        devices["out"] = [];
        var cnt1 = CountAllPaths(devices, "you", "out");
        var cnt2 = CountAllPaths(devices, "svr", "fft") * CountAllPaths(devices, "fft", "dac") * CountAllPaths(devices, "dac", "out")
                 + CountAllPaths(devices, "svr", "dac") * CountAllPaths(devices, "dac", "fft") * CountAllPaths(devices, "fft", "out");
        return (cnt1, cnt2);
    }

    private long CountAllPaths(Dictionary<string, List<string>> devices, string start, string end) => CountPaths(devices, start, end, []);

    private long CountPaths(Dictionary<string, List<string>> devices, string current, string end, Dictionary<string, long> memo) {
        if (current == end) {
            return 1;
        }
        if (memo.TryGetValue(current, out long cached)) {
            return cached;
        }
        return memo[current] = devices[current].Sum(next => CountPaths(devices, next, end, memo));
    }
}
