using AdventOfCode;
using System.Collections.Frozen;

public class Year2021_Day19(string inputPath) : Solvable($"{inputPath}/input") {
    readonly record struct Coords(int X, int Y, int Z) {
        private static readonly Func<Coords, Coords>[] RotationFuncs = [
            c => new(c.X, c.Y, c.Z), c => new(c.X, -c.Z, c.Y), c => new(c.X, -c.Y, -c.Z), c => new(c.X, c.Z, -c.Y),
            c => new(-c.X, c.Y, -c.Z), c => new(-c.X, -c.Z, -c.Y), c => new(-c.X, -c.Y, c.Z), c => new(-c.X, c.Z, c.Y),
            c => new(c.Y, c.Z, c.X), c => new(c.Y, -c.X, c.Z), c => new(c.Y, -c.Z, -c.X), c => new(c.Y, c.X, -c.Z),
            c => new(-c.Y, c.Z, -c.X), c => new(-c.Y, -c.X, -c.Z), c => new(-c.Y, -c.Z, c.X), c => new(-c.Y, c.X, c.Z),
            c => new(c.Z, c.X, c.Y), c => new(c.Z, -c.Y, c.X), c => new(c.Z, -c.X, -c.Y), c => new(c.Z, c.Y, -c.X),
            c => new(-c.Z, c.X, -c.Y), c => new(-c.Z, -c.Y, -c.X), c => new(-c.Z, -c.X, c.Y), c => new(-c.Z, c.Y, c.X),
        ];
        public Coords Rotate(int rotation) => RotationFuncs[rotation](this);
        public Coords Translate(int dx, int dy, int dz) => new(X + dx, Y + dy, Z + dz);
        public int Manhattan(Coords b) => Math.Abs(X - b.X) + Math.Abs(Y - b.Y) + Math.Abs(Z - b.Z);
    }

    class Scanner(string name) {
        public string Name { get; } = name;
        public Coords[] Beacons { get; set; } = [];
        public Coords Translated { get; set; } = new(0, 0, 0);
        private FrozenSet<Coords>? _keySet;
        public FrozenSet<Coords> Keys() => _keySet ??= Beacons.ToFrozenSet();
        public Coords[] GetRotatedBeacons(int rotation) => Beacons.Select(b => b.Rotate(rotation)).ToArray();

        public Scanner? MatchTranslateWithRotations(Scanner other) {
            (Scanner? result, int rotation) match = (null, -1);
            Parallel.For(0, 24, (rot, state) => {
                var translated = MatchTranslate(other.GetRotatedBeacons(rot), other.Name);
                if (translated != null) {
                    lock (this) {
                        if (match.result == null) {
                            match = (translated, rot);
                        }
                    }
                    state.Stop();
                }
            });
            return match.result ?? null;
        }

        private Scanner? MatchTranslate(Coords[] otherBeacons, string otherName) {
            var localSet = Keys();
            foreach (var a in Beacons) {
                foreach (var b in otherBeacons) {
                    int dx = a.X - b.X, dy = a.Y - b.Y, dz = a.Z - b.Z;
                    int count = otherBeacons.Count(ob => localSet.Contains(ob.Translate(dx, dy, dz)));
                    if (count >= 12) {
                        return new Scanner(otherName) {
                            Beacons = otherBeacons.Select(ob => ob.Translate(dx, dy, dz)).ToArray(),
                            Translated = new Coords(dx, dy, dz)
                        };
                    }
                }
            }
            return null;
        }
    }

    public override (object, object) Solve() {
        var scanners = _inputRaw.Split("\n\n").Select((section, i) => new Scanner($"{i}") {
            Beacons = [.. section.Trim().Split('\n').Skip(1).Select(line => {
                var p = line.Split(',').Select(int.Parse).ToArray();
                return new Coords(p[0], p[1], p[2]);
            })]
        }).ToList();
        var done = new List<Scanner> { scanners[0] };
        var todo = new HashSet<Scanner>(scanners.Skip(1));
        while (todo.Count > 0) {
            foreach (var d in done.ToArray()) {
                foreach (var t in todo.ToArray()) {
                    var match = d.MatchTranslateWithRotations(t);
                    if (match != null) {
                        Console.WriteLine($"Matched Scanner {d.Name} with Scanner {t.Name}");
                        done.Add(match);
                        todo.Remove(t);
                    }
                }
            }
        }
        var part1 = done.SelectMany(d => d.Beacons).ToFrozenSet().Count;
        var part2 = done.SelectMany(a => done.Select(b => a.Translated.Manhattan(b.Translated))).Max();
        return (part1, part2);
    }
}
