import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

const field: number[][] = [];
const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    const row = line.split('').map(x => +x);
    field.push(row);
}

const xsize = field[0].length;
const ysize = field.length;
const lowpoints: number[] = [];
const basins: number[] = [];

// recursively search for basin locations in the neighborhood of (x, y)
const calcbasin = (x: number, y: number, visited: Set<string>): number => {
    let sum = 0;
    const pos = `${x},${y}`;
    const v = field[y][x];
    if (v < 9 && !visited.has(pos)) {   // stop at 9 or if location has already been visited
        visited.add(pos);
        sum = 1;                        // each location counts 1
        if (x > 0) {
            sum += calcbasin(x - 1, y, visited);
        }
        if (x < (xsize - 1)) {
            sum += calcbasin(x + 1, y, visited);
        }
        if (y > 0) {
            sum += calcbasin(x, y - 1, visited);
        }
        if (y < (ysize - 1)) {
            sum += calcbasin(x, y + 1, visited);
        }
    }
    return sum;
}

for (let y = 0; y < ysize; y++) {
    for (let x = 0; x < xsize; x++) {
        const v = field[y][x];
        if ((x === 0 || v < field[y][x - 1]) && (x === (xsize - 1) || v < field[y][x + 1]) &&
            (y === 0 || v < field[y - 1][x]) && (y === (ysize - 1) || v < field[y + 1][x])) {
            lowpoints.push(v);
            basins.push(calcbasin(x, y, new Set<string>()));
        }
    }
}

const solution1 = lowpoints.map(v => v + 1).reduce((sum, n) => sum + n, 0);
const sorted = basins.sort((a, b) => b - a);
const solution2 = sorted[0] * sorted[1] * sorted[2];

console.log(`Part one: ${solution1}`);
console.log(`Part two: ${solution2}`);
