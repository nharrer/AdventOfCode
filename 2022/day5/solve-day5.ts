import { bufio } from "https://deno.land/x/aoc@0.0.1-alpha.11/deps.ts";

const regexMoves = new RegExp('^move ([0-9]+) from ([0-9]+) to ([0-9]+)$');
const stacks1: Array<Array<string>> = [];
const stacks2: Array<Array<string>> = [];

const file = await Deno.open('input.txt');
for await (const line of bufio.readLines(file)) {
    if (line.includes('[')) {
        let a = line.split('');
        let s = 0;
        while (a.length > 0) {
            if (stacks1.length === s) {
                stacks1.push([]);   // add another stack
                stacks2.push([]);
            }
            const b = a.splice(3);
            const crate = a[1];
            if (crate !== ' ') {
                stacks1[s].unshift(crate);
                stacks2[s].unshift(crate);
            }
            a = b.slice(1);
            s++;
        }
    } else {
        const match = regexMoves.exec(line);
        if (match) {
            let x = +match[1];
            const y = +match[2];
            const z = +match[3];
            // move x from y to z
            const mover9000: Array<string> = [];
            const mover9001: Array<string> = [];
            while (x-- > 0) {
                mover9000.push(<string> stacks1[y-1].pop());
                mover9001.unshift(<string> stacks2[y-1].pop());
            }
            stacks1[z-1] = stacks1[z-1].concat(mover9000);
            stacks2[z-1] = stacks2[z-1].concat(mover9001);
        }
    }
}

const solution1 = stacks1.reduce((a, b) => a + b.pop(), '');
const solution2 = stacks2.reduce((a, b) => a + b.pop(), '');

console.log(`Part one: ${solution1}`);
console.log(`Part two: ${solution2}`);
