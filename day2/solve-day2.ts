import { bufio } from "https://deno.land/x/aoc@0.0.1-alpha.11/deps.ts";

const asciiA = 'A'.charCodeAt(0);
const asciiX = 'X'.charCodeAt(0);
let sum1 = 0;
let sum2 = 0;

const file = await Deno.open('input.txt');
for await (const line of bufio.readLines(file)) {
    const a = line.charCodeAt(0) - asciiA + 1;
    const b = line.charCodeAt(2) - asciiX + 1;

    // Note: 1 = Rock, 2 = Paper, 3 = Scissors
    //       1 = Loose, 2 = Draw, 3 = Win

    let c: number;
    if (b == 1) {
        c = (a - 1 + 2) % 3 + 1;    // I need to loose: Choose the previous symbol
    } else if (b == 2) {
        c = a;                      // I need a draw: Choose the same symbol
    } else {
        c = (a - 1 + 1) % 3 + 1;    // I need to win : Choose the next symbol
    }

    sum1 += calcScore(a, b);
    sum2 += calcScore(a, c);
}

function calcScore(a: number, b: number) {
    let sum = b;
    if (a === b) {
        sum += 3; // Draw
    } else if (a === 1 && b === 2 || a === 2 && b === 3 || a === 3 && b === 1) {
        sum += 6;
    }
    return sum;
}

console.log(`Part one: ${sum1}`);
console.log(`Part one: ${sum2}`);
