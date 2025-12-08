using AdventOfCode;

public class Year2025_Day08(string inputPath) : Solvable($"{inputPath}/input") {

    class Box(int x, int y, int z, int circuit) {
        public int x = x, y = y, z = z;
        public int circuit = circuit;
    }

    public override (object, object) Solve() {
        List<Box> boxes = [.. _inputLines.Select((p, idx) => {
            var dims = p.Split(',').Select(int.Parse).ToArray();
            return new Box(dims[0], dims[1], dims[2], idx);
        })];
        var circuits = boxes.ToDictionary(box => box.circuit, box => new HashSet<Box> { box });

        long dist(Box a, Box b) => (long)(a.x - b.x) * (a.x - b.x) + (long)(a.y - b.y) * (a.y - b.y) + (long)(a.z - b.z) * (a.z - b.z);
        var uniquePairs = boxes.SelectMany((a, i) => boxes.Skip(i + 1).Select(b => (a, b))).OrderBy(p => dist(p.a, p.b));

        long sol1 = 0, sol2 = 0;
        int cnt = 0, pairsToConnect = boxes.Count == 20 ? 10 : 1000;
        foreach (var (boxA, boxB) in uniquePairs) {
            int circuita = boxA.circuit, circuitb = boxB.circuit;
            if (circuita != circuitb) {
                foreach (var box in circuits[circuitb]) {
                    box.circuit = circuita;
                    circuits[circuita].Add(box);
                }
                circuits.Remove(circuitb);
            }
            if (++cnt == pairsToConnect) {
                sol1 = circuits.Values.Select(c => c.Count).OrderByDescending(s => s).Take(3).Aggregate(1L, (acc, s) => acc * s);
            }
            if (circuits.Count == 1) {
                sol2 = ((long)boxA.x) * boxB.x;
                break;
            }
        }

        return (sol1, sol2);
    }
}
