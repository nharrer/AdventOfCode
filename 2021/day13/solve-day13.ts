import { readLines } from "../../import.ts";

type Point = [number, number];
type Fold = [string, number];

const INPUT_FILE = 'input.txt';

const dots: Array<Point> = [];
const folds: Array<Fold> = [];
const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    if (line.startsWith('fold')) {
        const parts = line.split(' along ')[1].split("=");
        folds.push([parts[0], +parts[1]]);
    } else if (line.includes(',')) {
        dots.push(<Point>line.split(',').map(x => +x));
    }
}

let round = 1;
for (const fold of folds) {
    if (fold[0] === 'y') {
        dots.filter(d => d[1] > fold[1]).forEach(d => d[1] = 2 * fold[1] - d[1]);
    } else {
        dots.filter(d => d[0] > fold[1]).forEach(d => d[0] = 2 * fold[1] - d[0]);
    }
    if (round++ === 1) {
        const unique = new Set(dots.map(d => d[0] + ';' + d[1]));  // unique dots
        console.log(`Part one: ${unique.size}`);
    }
}

console.log(`Part two:`);
const maxx = Math.max(...dots.map(d => d[0]));
const maxy = Math.max(...dots.map(d => d[1]));
for (let y = 0; y <= maxy; y++) {
    let line = '';
    for (let x = 0; x <= maxx; x++) {
        line += dots.filter(d => d[0] === x && d[1] === y).length > 0 ? '#' : ' ';
    }
    console.log(line);
}
