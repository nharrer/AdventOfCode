using AdventOfCode;
using Google.OrTools.LinearSolver;  // > dotnet add package Google.OrTools

public class Year2025_Day10(string inputPath) : Solvable($"{inputPath}/input") {

    class Machine(int goal, List<Button> buttons, List<int> joltages) {
        public int goal = goal;
        public List<Button> buttons = buttons;
        public List<int> joltages = joltages;
    }

    class Button(List<int> values) {
        public List<int> values = values;
        public int bitmask = values.Sum(n => 1 << n);
    }

    public override (object, object) Solve() {
        var machines = _inputLines.Select(line => line.Split(" ")).Select(static parts => {
            var lights = parts[0][1..^1].Select(c => c == '#').ToList();
            int lightsValue = lights.AsEnumerable().Reverse().Aggregate(0, (acc, b) => (acc << 1) | (b ? 1 : 0));
            var buttons = parts.Skip(1).Take(parts.Length - 2).Select(p => new Button(p[1..^1].Split(',').Select(int.Parse).ToList())).ToList();
            var joltages = parts.Last()[1..^1].Split(',').Select(int.Parse).ToList();
            return new Machine(lightsValue, buttons, joltages);
        }).ToList();
        return (machines.Sum(SolveLights), machines.Sum(SolveJoltages));
    }

    private int SolveLights(Machine machine) {
        int minPresses = int.MaxValue;
        for (int mask = 1; mask < (1 << machine.buttons.Count); mask++) {
            int value = 0, presses = 0;
            for (int i = 0; i < machine.buttons.Count; i++) {
                if ((mask & (1 << i)) != 0) {
                    value ^= machine.buttons[i].bitmask;
                    presses++;
                }
            }
            if (value == machine.goal && presses < minPresses) {
                minPresses = presses;
            }
        }
        return minPresses;
    }

    private int SolveJoltages(Machine machine) {
        var solver = Solver.CreateSolver("SCIP");
        var buttons = machine.buttons.Select((_, i) => solver.MakeIntVar(0, double.PositiveInfinity, $"b{i}")).ToArray();
        for (int d = 0; d < machine.joltages.Count; d++) {
            var constraint = solver.MakeConstraint(machine.joltages[d], machine.joltages[d], $"joltage_{d}");
            for (int i = 0; i < machine.buttons.Count; i++) {
                constraint.SetCoefficient(buttons[i], machine.buttons[i].values.Contains(d) ? 1 : 0);
            }
        }
        var objective = solver.Objective();
        for (int i = 0; i < machine.buttons.Count; i++) {
            objective.SetCoefficient(buttons[i], 1);
        }
        objective.SetMinimization();
        solver.Solve();
        return (int)buttons.Sum(b => b.SolutionValue());
    }
}

// For example: Buttons: (0,1,3,4,5), (0,4,5), (1,2,3,4), (0,1,2)
//              Joltages: {132, 30, 23, 13, 121, 115}
// Then this linear system needs to be solved:
//        b0  b1  b2  b3
// d=0:   1   1   0   1   = 132   (buttons 0,1,3 have 0 in their list)
// d=1:   1   0   1   1   = 30    (buttons 0,2,3 have 1 in their list)
// d=2:   0   0   1   1   = 23    (buttons 2,3 have 2 in their list)
// d=3:   1   0   1   0   = 13    (buttons 0,2 have 3 in their list)
// d=4:   1   1   1   0   = 121   (buttons 0,1,2 have 4 in their list)
// d=5:   1   1   0   0   = 115   (buttons 0,1 have 5 in their list)
