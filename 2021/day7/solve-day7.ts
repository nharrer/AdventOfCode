import { bufio } from "https://deno.land/x/aoc@0.0.1-alpha.11/deps.ts";

const INPUT_FILE = 'input.txt';

const subs: Array<number> = [];
const file = await Deno.open(INPUT_FILE);
for await (const line of bufio.readLines(file)) {
    subs.push(...line.split(',').map(x => +x));
}

const min = Math.min(...subs);
const max = Math.max(...subs);

let minFuel1 = Number.MAX_SAFE_INTEGER;
let minFuel2 = Number.MAX_SAFE_INTEGER;
for (let pos = min; pos <= max; pos++) {
    const distances = subs.map(spos => Math.abs(spos - pos));
    const fuel1 = distances.reduce((sum, f) => sum + f, 0);
    minFuel1 = Math.min(minFuel1, fuel1);
    // sum of 1 + 2 + ... + f = f*(f+1)/2 (Gauss rulez)
    const fuel2 = distances.reduce((sum, f) => sum + (f * (f + 1) / 2), 0);
    minFuel2 = Math.min(minFuel2, fuel2);
}

console.log(`Part one: ${minFuel1}`);
console.log(`Part two: ${minFuel2}`);
