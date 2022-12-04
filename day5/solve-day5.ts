import { bufio } from "https://deno.land/x/aoc@0.0.1-alpha.11/deps.ts";

let sum1 = 0;
let sum2 = 0
const file = await Deno.open('input.txt');
for await(const line of bufio.readLines(file)) {
    // TODO: Waiting for puzzle to be released
}

console.log(`Part one: ${sum1}`);
console.log(`Part two: ${sum2}`);
