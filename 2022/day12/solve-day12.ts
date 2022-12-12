import { DijkstraShortestPathSolver } from "https://deno.land/x/dijkstras_algorithm@1.0.6/dijkstra.ts";
import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

let width = 0;
let height = 0;
let startnode = 0;
let endnode = 0;
const field: number[][] = [];

const file = await Deno.open(INPUT_FILE);
for await (let line of readLines(file)) {
    width = line.length;
    const spos = line.indexOf('S');
    if (spos >= 0) {
        startnode = height * width + spos;
        line = line.replace('S', 'a');
    }
    const epos = line.indexOf('E');
    if (epos >= 0) {
        endnode = height * width + epos;
        line = line.replace('E', 'z');
    }
    height++;
    field.push(line.split('').map(c => c.charCodeAt(0) - 97));
}

const solver = DijkstraShortestPathSolver.init(width * height);

const startnodes2: Array<number> = [];  // startnodes for part 2
for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        const h = field[y][x];
        const node = y * width + x;
        if (h === 0) {
            startnodes2.push(node);
        }
        for (const move of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const [x2, y2] = [x + move[0], y + move[1]];
            if (x2 >= 0 && x2 < width && y2 >= 0 && y2 < height) {
                const h2 = field[y2][x2];
                const node2 = y2 * width + x2;
                if ((h2 - h) <= 1) {
                    solver.addEdge(node, node2, 1);
                }
            }
        }
    }
}

const solution = solver.calculateFor(startnode).shortestPathTo(endnode);

let bestsolution2 = Number.MAX_SAFE_INTEGER;
startnodes2.forEach(node => {
    try {
        const solution2 = solver.calculateFor(node).shortestPathTo(endnode);
        bestsolution2 = Math.min(bestsolution2, solution2.length - 1);
    } catch (_) { /* ignore nodes without a path to E */ }
});

console.log(`Part one: ${solution.length - 1}`);
console.log(`Part two: ${bestsolution2}`);
