import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

type Signal = number | Array<Signal>;

const compareSignal = (s1: Signal, s2: Signal): number => { // returns: -1: s1 < s2; 1: s1 > s2, 0: equal
    if (typeof s1 === 'number' && typeof s2 === 'number') {
        return Math.sign(s1 - s2);
    }
    const sa1 = typeof s1 === 'number' ? [s1] : s1;
    const sa2 = typeof s2 === 'number' ? [s2] : s2;
    for (let idx = 0; idx < Math.max(sa1.length, sa2.length); idx++) {
        if (idx === sa1.length) {
            return -1;
        } else if (idx === sa2.length) {
            return 1;
        }
        const r = compareSignal(sa1[idx], sa2[idx]);
        if (r !== 0) {
            return r;
        }
    }
    return 0;
}

const signals: Array<Signal> = [];
const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    if (line.length > 0) {
        signals.push(JSON.parse(line) as Signal)
    }
}

let solution1 = 0;
for (let idx = 0; idx < signals.length;) {
    if (compareSignal(signals[idx++], signals[idx++]) < 0) {
        solution1 += idx / 2;
    }
}

const divider1 = [[2]];
const divider2 = [[6]];
signals.push(...[divider1, divider2]);
signals.sort((a, b) => compareSignal(a, b));
const solution2 = (signals.indexOf(divider1) + 1) * (signals.indexOf(divider2) + 1);

console.log(`Part one: ${solution1}`);
console.log(`Part two: ${solution2}`);
