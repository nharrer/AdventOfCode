import { DijkstraShortestPathSolver } from "https://deno.land/x/dijkstras_algorithm@1.0.6/dijkstra.ts";
import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

const cave1: number[][] = [];
const cave2: number[][] = [];

const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    cave1.push(line.split('').map(c => +c));
}

for (let j = 0; j < 5; j++) {
    for (const row1 of cave1) {
        const row2: number[] = [];
        for (let i = 0; i < 5; i++) {
            row2.push(...row1.map(v => (v + i + j - 1) % 9 + 1));
        }
        cave2.push(row2);
    }
}

const solve = (part: string, field: number[][]) => {
    const width = field[0].length;
    const height = field.length;
    const solver = DijkstraShortestPathSolver.init(width * height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const node1 = y * width + x;
            for (const move of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                const [x2, y2] = [x + move[0], y + move[1]];
                if (x2 >= 0 && x2 < width && y2 >= 0 && y2 < height) {
                    const node2 = y2 * width + x2;
                    solver.addEdge(node1, node2, field[y2][x2]);
                }
            }
        }
    }

    const solution = solver.calculateFor(0).shortestPathTo(width * height - 1);
    solution.shift(); // ignore startnode
    const solution1 = solution.map(node => field[Math.floor(node / width)][node % width]).reduce((s, v) => s + v, 0);
    console.log(`Part ${part}: ${solution1}`);
}

solve('one', cave1);
solve('one', cave2);
