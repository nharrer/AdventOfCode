import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

const score1 = new Map([
    [')', 3],
    [']', 57],
    ['}', 1197],
    ['>', 25137]
]);
const score2 = new Map([
    [')', 1],
    [']', 2],
    ['}', 3],
    ['>', 4]
]);
const match = new Map([
    ['(', ')'],
    ['[', ']'],
    ['{', '}'],
    ['<', '>']
]);
const openSymbols = new Set(Array.from(match.keys()));
const illegal: Array<string> = [];
const missing: Array<number> = [];

const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    const symbols = line.split('');
    const stack: Array<string> = [];
    let corrupt = false;
    for (const s of symbols) {
        if (openSymbols.has(s)) {
            stack.push(match.get(s) || '');
        } else {
            if (stack.length > 0) {
                const expected = stack.pop() || '';
                if (expected != s) {
                    illegal.push(s);
                    corrupt = true;
                    break;
                }
            }
        }
    }

    if (!corrupt) {
        let missingsum = 0;
        while (stack.length > 0) {
            missingsum *= 5;
            const s = stack.pop();
            missingsum += score2.get(s || '') || 0;
        }
        if (missingsum > 0) {
            missing.push(missingsum);
        }
    }
}

const missingSorted = missing.sort((a, b) => b - a);
const solution1 = illegal.map(x => score1.get(x) || 0).reduce((sum, n) => sum + n, 0);
const solution2 = missingSorted[(missingSorted.length - 1) / 2];

console.log(`Part one: ${solution1}`);
console.log(`Part two: ${solution2}`);
