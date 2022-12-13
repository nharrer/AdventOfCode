import { DijkstraShortestPathSolver } from "https://deno.land/x/dijkstras_algorithm@1.0.6/dijkstra.ts";
import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

let width = 0;
let height = 0;
const field: number[][] = [];

const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    width = line.length;
    height++;
    field.push(line.split('').map(c => +c));
}

const startnode = 0;
const endnode = width * height - 1;

const solver = DijkstraShortestPathSolver.init(width * height);

for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        const node1 = y * width + x;
        for (const move of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const [x2, y2] = [x + move[0], y + move[1]];
            if (x2 >= 0 && x2 < width && y2 >= 0 && y2 < height) {
                const v2 = field[y2][x2];
                const node2 = y2 * width + x2;
                solver.addEdge(node1, node2, v2);
            }
        }
    }
}

const solution = solver.calculateFor(startnode).shortestPathTo(endnode);
solution.shift();
const solution1 = solution.map(node => field[Math.floor(node / width)][node % width]).reduce((s, v) => s + v, 0);

console.log(`Part one: ${solution1}`);
//console.log(`Part two: ${bestsolution2}`);
