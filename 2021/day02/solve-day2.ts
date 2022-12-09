import { readLines } from "../../import.ts";

const re = new RegExp('^(\\w+) (\\d+)$');

let depth1 = 0;
let position1 = 0;
let depth2 = 0;
let position2 = 0;
let aim2 = 0;

const file = await Deno.open('input.txt');
for await (const line of readLines(file)) {
    const match = line.match(re);
    if (match) {
        const dir = match[1];
        const step = +match[2];

        if (dir === 'forward') {
            position1 += step;
            position2 += step;
            depth2 += aim2 * step;
        } else if (dir === 'up') {
            depth1 -= step;
            aim2 -= step;
        } else if (dir === 'down') {
            depth1 += step;
            aim2 += step;
        }
    }
}

console.log(`Part one: ${depth1 * position1}`);
console.log(`Part two: ${depth2 * position2}`);
