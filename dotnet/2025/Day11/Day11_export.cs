using AdventOfCode;

public class Year2025_Day11_export(string inputPath) : Solvable($"{inputPath}/input") {

    public override (object, object) Solve() {
        var devices = _inputLines.Select(line => line.Split([':', ' '], StringSplitOptions.RemoveEmptyEntries))
                                 .ToDictionary(parts => parts[0], parts => parts.Skip(1).ToList());
        devices["out"] = [];

        ExportToCytoscape(devices, inputPath);

        var cnt1 = CountPaths(devices, "you", "out", []);
        var cnt2 = CountPaths(devices, "svr", "fft", []) * CountPaths(devices, "fft", "dac", []) * CountPaths(devices, "dac", "out", [])
                 + CountPaths(devices, "svr", "dac", []) * CountPaths(devices, "dac", "fft", []) * CountPaths(devices, "fft", "out", []);
        return (cnt1, cnt2);
    }

    private long CountPaths(Dictionary<string, List<string>> devices, string current, string end, Dictionary<string, long> memo) {
        if (current == end) {
            return 1;
        }
        if (memo.TryGetValue(current, out long cached)) {
            return cached;
        }
        return memo[current] = devices[current].Sum(next => CountPaths(devices, next, end, memo));
    }

    private static void ExportToCytoscape(Dictionary<string, List<string>> devices, string inputPath) {
        var outputPath = Path.Combine(inputPath, "devices.cyjs");

        // Build Cytoscape Desktop JSON format (CyJSON)
        var nodeElements = devices.Select(d => new Dictionary<string, object> {
            ["data"] = new Dictionary<string, object> {
                ["id"] = $"{d.Key}",
                ["color"] = d.Key switch {
                    "you" => "you",
                    "svr" => "svr",
                    "fft" => "fft",
                    "dac" => "dac",
                    "out" => "out",
                    _ => ""
                }
            },
            ["group"] = "nodes"
        }).ToList<object>();

        var edgeElements = devices.SelectMany(d => d.Value.Select(o => new Dictionary<string, object> {
            ["data"] = new Dictionary<string, object> {
                ["id"] = $"edge_{d.Key}_to_{o}",
                ["source"] = d.Key,
                ["target"] = o
            },
            ["group"] = "edges"
        })).ToList<object>();

        var cyJson = new Dictionary<string, object> {
            ["format_version"] = "1.0",
            ["generated_by"] = "Me",
            ["target_cytoscapejs_version"] = "~2.1",
            ["data"] = new Dictionary<string, object> {
                ["name"] = "Day11 Network"
            },
            ["elements"] = new Dictionary<string, object> {
                ["nodes"] = nodeElements,
                ["edges"] = edgeElements
            }
        };

        var options = new System.Text.Json.JsonSerializerOptions { WriteIndented = true };
        var json = System.Text.Json.JsonSerializer.Serialize(cyJson, options);
        File.WriteAllText(outputPath, json);

        Console.WriteLine($"Cytoscape network exported to: {outputPath}");
    }
}
