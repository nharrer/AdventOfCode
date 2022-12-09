import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';
const KNOTS = 10;

const moves = new Map<string, number[]>([
    ['L', [-1, 0]],                 // movement in x, y caused by direction
    ['R', [1, 0]],
    ['U', [0, 1]],
    ['D', [0, -1]]
]);
const pos: number[][] = [];         // position of each knot: 0=head, last=tail
for (let i = 0; i < KNOTS; i++) {   // initialize all knots with [0, 0]
    pos[i] = [0, 0];
}
const solutions: Array<Set<string>> = [new Set(), new Set()];

const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    const [dir, ssteps] = line.split(' ');

    let steps = +ssteps;
    while (steps > 0) {
        const [stepx, stepy] = moves.get(dir) || [0, 0];
        pos[0] = [pos[0][0] + stepx, pos[0][1] + stepy];    // move head

        for (let i = 1; i < KNOTS; i++) {
            const xd = pos[i - 1][0] - pos[i][0];
            const yd = pos[i - 1][1] - pos[i][1];
            if (Math.abs(xd) > 1 || Math.abs(yd) > 1) {     // only follow up, if any distance in either direction is more than 1
                pos[i] = [pos[i][0] + Math.sign(xd), pos[i][1] + Math.sign(yd)];
            }
        }

        solutions[0].add(`${pos[1]}`);
        solutions[1].add(`${pos[KNOTS - 1]}`);

        steps--;
    }
}

console.log(`Part one: ${solutions[0].size}`);
console.log(`Part two: ${solutions[1].size}`);
