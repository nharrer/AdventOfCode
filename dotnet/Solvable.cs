namespace AdventOfCode {

    public abstract class Solvable {


        protected string LineFeed => Environment.NewLine;

        private readonly string _inputPath;

        protected string _input = "";
        protected string[] _inputLines = [];

        protected Solvable(string inputPath) {
            _inputPath = inputPath;
        }

        public void Read() {
            if (!File.Exists(_inputPath)) {
                throw new FileNotFoundException($"Input file not found: {_inputPath}");
            }
            _input = File.ReadAllText(_inputPath).Trim();
            _inputLines = _input.Split(new[] { "\r\n", "\n" }, StringSplitOptions.None);
        }

        public void PrintSolutions(object part1, object part2) {
            Console.WriteLine($"Part 1: {part1}");
            Console.WriteLine($"Part 2: {part2}");
        }

        public abstract (object, object) Solve();
    }
}
