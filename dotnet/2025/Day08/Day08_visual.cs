using AdventOfCode;

public class Year2025_Day08_visual(string inputPath) : Solvable($"{inputPath}/input") {

    class Box(int id, int x, int y, int z, int circuit) {
        public int id = id;
        public int x = x, y = y, z = z;
        public int circuit = circuit;
    }

    public override (object, object) Solve() {
        List<Box> boxes = [.. _inputLines.Select((p, idx) => {
            var dims = p.Split(',').Select(int.Parse).ToArray();
            return new Box(idx, dims[0], dims[1], dims[2], idx);
        })];
        var circuits = boxes.ToDictionary(box => box.circuit, box => new HashSet<Box> { box });

        long dist(Box a, Box b) => (long)(a.x - b.x) * (a.x - b.x) + (long)(a.y - b.y) * (a.y - b.y) + (long)(a.z - b.z) * (a.z - b.z);
        var uniquePairs = boxes.SelectMany((a, i) => boxes.Skip(i + 1).Select(b => (a, b))).OrderBy(p => dist(p.a, p.b));

        long sol1 = 0, sol2 = 0;
        int cnt = 0, pairsToConnect = boxes.Count == 20 ? 10 : 1000;
        List<(Box, Box)> connections = [];
        foreach (var (boxA, boxB) in uniquePairs) {
            int circuita = boxA.circuit, circuitb = boxB.circuit;
            if (circuita != circuitb) {
                foreach (var box in circuits[circuitb]) {
                    box.circuit = circuita;
                    circuits[circuita].Add(box);
                }
                circuits.Remove(circuitb);
            }
            if (cnt < pairsToConnect) {
                connections.Add((boxA, boxB));
            }
            if (++cnt == pairsToConnect) {
                sol1 = circuits.Values.Select(c => c.Count).OrderByDescending(s => s).Take(3).Aggregate(1L, (acc, s) => acc * s);
            }
            if (circuits.Count == 1) {
                sol2 = ((long)boxA.x) * boxB.x;
                break;
            }
        }

        // Export to Cytoscape format
        ExportToCytoscape(boxes, connections, inputPath);

        return (sol1, sol2);
    }

    private static void ExportToCytoscape(List<Box> boxes, List<(Box, Box)> connections, string inputPath) {
        var outputPath = Path.Combine(inputPath, "cytoscape_network.cyjs");

        // Build Cytoscape Desktop JSON format (CyJSON)
        var nodeElements = boxes.Select(b => new Dictionary<string, object> {
            ["data"] = new Dictionary<string, object> {
                ["id"] = $"box_{b.id}",
                ["x"] = b.x,
                ["y"] = b.y,
                ["z"] = b.z
            },
            ["group"] = "nodes"
        }).ToList<object>();

        var edgeElements = connections.Select((c, i) => new Dictionary<string, object> {
            ["data"] = new Dictionary<string, object> {
                ["id"] = $"edge_{i}",
                ["source"] = $"box_{c.Item1.id}",
                ["target"] = $"box_{c.Item2.id}"
            },
            ["group"] = "edges"
        }).ToList<object>();

        var cyJson = new Dictionary<string, object> {
            ["format_version"] = "1.0",
            ["generated_by"] = "Me",
            ["target_cytoscapejs_version"] = "~2.1",
            ["data"] = new Dictionary<string, object> {
                ["name"] = "Day08 Network"
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
