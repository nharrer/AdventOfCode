import { bufio } from "https://deno.land/x/aoc@0.0.1-alpha.11/deps.ts";

const INPUT_FILE = 'input.txt';

const DAYS1 = 80;
const DAYS2 = 256;
const fishMap: Map<number, number> = new Map();

const file = await Deno.open(INPUT_FILE);
for await (const line of bufio.readLines(file)) {
    const states = line.split(',').map(x => +x);
    states.forEach(state => {
        fishMap.set(state, (fishMap.get(state) || 0) + 1);
    });
}

let solution1 = -1;
for (let day = 1; day <= DAYS2; day++) {
    const n0 = fishMap.get(0) || 0;
    for (let i = 1; i <= 8; i++) {
        fishMap.set(i - 1, fishMap.get(i) || 0);
    }
    fishMap.set(6, (fishMap.get(6) || 0) + n0);
    fishMap.set(8, n0);
    if (day === DAYS1) {
        solution1 = Array.from(fishMap.values()).reduce((sum, n) => n + sum, 0);
    }
}
const solution2 = Array.from(fishMap.values()).reduce((sum, n) => n + sum, 0);

console.log(`Part one: ${solution1}`);
console.log(`Part two: ${solution2}`);
