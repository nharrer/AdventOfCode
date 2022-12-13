import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

const incmap = (map: Map<string, number>, key: string, inc: number) => map.set(key, (map.get(key) || 0) + inc);

let last = 'X';
const pairs: Map<string, number> = new Map();
const rules: Map<string, string> = new Map();
const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    if (line.includes('->')) {
        const [key, value] = line.split(' -> ');
        rules.set(key, value);
    } else if (line.length > 0) {
        for (let i = 0; i < (line.length - 1); i++) {
            const key = line[i] + line[i + 1];
            incmap(pairs, key, 1);
        }
        last = line[line.length - 1];
    }
}

const process = (pairmap: Map<string, number>): void => {
    const entries = Array.from(pairmap.entries());
    pairmap.clear();
    entries.forEach(([pair, cnt]) => {
        const e = rules.get(pair) || '';
        incmap(pairmap, pair[0] + e, cnt);
        incmap(pairmap, e + pair[1], cnt);
    });
}

const printsolution = (part: string): void => {
    // Count only the first character of each pair, because the second character is already the first character of another pair.
    const countmap: Map<string, number> = new Map();
    Array.from(pairs.entries()).forEach(([pair, n]) => incmap(countmap, pair[0], n));
    incmap(countmap, last, 1); // The last character of the whole polymer is still missing. We need to count it seperately.
    const counts = Array.from(countmap.values()).sort((a, b) => b - a);
    const solutions = counts[0] - counts[counts.length - 1];
    console.log(`Part ${part}: ${solutions}`);
}

for (let i = 1; i <= 40; i++) {
    process(pairs);
    if (i === 10) { printsolution('one'); }
    if (i === 40) { printsolution('two'); }
}
