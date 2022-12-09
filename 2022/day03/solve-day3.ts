import { readLines } from "../../import.ts";

const asciiA = 'A'.charCodeAt(0);
const asciia = 'a'.charCodeAt(0);
let linenr = 0;
let group: Array<Array<number>> = [];
let sum1 = 0;
let sum2 = 0;

const file = await Deno.open('input.txt');
for await (const line of readLines(file)) {
    const array = line.split('').map(x => x.charCodeAt(0)).map(x => x < asciia ? x - asciiA + 27 : x - asciia + 1);

    const b = Object.assign([], array); // clone array
    const a = b.splice(0, b.length / 2);
    let dups: number[] = [];
    a.forEach(x => {
        b.forEach(y => {
            if (x === y) {
                if (!dups.includes(x)) {
                    dups.push(x);
                }
            }
        });
    });
    sum1 += dups[0];

    group.push(array);
    if (linenr % 3 == 2) {
        dups = [];
        group[0].forEach(x => {
            group[1].forEach(y => {
                group[2].forEach(z => {
                    if (x === y && y === z) {
                        if (!dups.includes(x)) {
                            dups.push(x);
                        }
                    }
                });
            });
        });
        group = [];
        sum2 += dups[0];
    }

    linenr++;
}

console.log(`Part one: ${sum1}`);
console.log(`Part one: ${sum2}`);
