import { bufio } from "https://deno.land/x/aoc@0.0.1-alpha.11/deps.ts";

let nr_inc1 = 0;
let nr_inc2 = 0;
let last1 = -1;
let last2 = -1;

const file = await Deno.open('input.txt');
const window: Array<number> = [];
for await(const line of bufio.readLines(file)) {
    const n1 = +line;
    if (last1 >= 0 && n1 > last1) {
        nr_inc1++;
    }
    last1 = n1;

    window.push(n1);
    if (window.length === 4) {
        window.shift();
    }
    if (window.length === 3) {
        const n2 = window.reduce((a, b) => a + b, 0);
        if (last2 >= 0 && n2 > last2) {
            nr_inc2++;
        }
        last2 = n2;
    }
}

console.log(`Part one: ${nr_inc1}`);
console.log(`Part two: ${nr_inc2}`);
