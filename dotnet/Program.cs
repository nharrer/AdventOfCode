using System.Runtime.CompilerServices;

try {
    string GetProjectFilePath([CallerFilePath] string? filePath = null) => filePath ?? string.Empty;

    string projectDir = Path.GetDirectoryName(GetProjectFilePath()) ?? string.Empty;

    // Parse command line arguments
    var cmdArgs = Environment.GetCommandLineArgs().Skip(1).ToArray();
    int year = 0, day = 0;
    string? variant = "";
    for (int i = 0; i < cmdArgs.Length; i++) {
        if (cmdArgs[i] == "--year" && i + 1 < cmdArgs.Length && int.TryParse(cmdArgs[i + 1], out var y)) {
            year = y;
        }
        if (cmdArgs[i] == "--day" && i + 1 < cmdArgs.Length && int.TryParse(cmdArgs[i + 1], out var d)) {
            day = d;
        }
        if (cmdArgs[i] == "--variant" && i + 1 < cmdArgs.Length) {
            variant = cmdArgs[i + 1];
            if (variant == "default") {
                variant = "";
            } else {
                variant = "_" + variant;
            }
        }
    }

    if (year == 0 || day == 0) {
        Console.WriteLine("Usage: --year <year> --day <day>");
        return;
    }

    // Build type name: Year<year>_Day<day> (global namespace)
    string fullTypeName = $"Year{year}_Day{day:00}{variant}"; // No namespace

    // Find type in global namespace
    var type = Type.GetType(fullTypeName);
    if (type == null) {
        // Try to find type in all loaded assemblies
        type = AppDomain.CurrentDomain.GetAssemblies()
            .SelectMany(a => a.GetTypes())
            .FirstOrDefault(t => t.Name == fullTypeName);
        if (type == null) {
            Console.WriteLine($"Type not found: {fullTypeName}");
            return;
        }
    }

    // Ensure type derives from Solvable
    var solvableType = typeof(AdventOfCode.Solvable);
    if (!solvableType.IsAssignableFrom(type)) {
        Console.WriteLine($"Type {fullTypeName} does not derive from Solvable");
        return;
    }

    // Find constructor (assume it takes a string inputPath)
    string inputPath = $"{projectDir}/{year}/Day{day:00}/";
    var ctor = type.GetConstructor(new[] { typeof(string) });
    if (ctor == null) {
        Console.WriteLine($"Constructor not found for {fullTypeName}(string inputPath)");
        return;
    }

    // Create instance and cast to Solvable
    var instance = ctor.Invoke(new object[] { inputPath }) as AdventOfCode.Solvable;
    if (instance == null) {
        Console.WriteLine($"Failed to create instance of {fullTypeName} as Solvable");
        return;
    }

    // Call Solve() directly
    Console.WriteLine($"Solving Year {year} Day {day}{(variant.Length > 0 ? $" (variant: {variant})" : "")}...\n");

    instance.Read();

    var sw = System.Diagnostics.Stopwatch.StartNew();
    var (part1, part2) = instance.Solve();
    sw.Stop();

    instance.PrintSolutions(part1, part2);
    Console.WriteLine($"\nDuration: {sw.Elapsed.TotalSeconds:F6} seconds");
} catch (Exception ex) {
    Console.WriteLine($"Error: {ex.Message}");
}
