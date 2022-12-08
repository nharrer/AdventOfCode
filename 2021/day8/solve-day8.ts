import { bufio } from "https://deno.land/x/aoc@0.0.1-alpha.11/deps.ts";
import { Superset } from "https://deno.land/x/supersets@1.1.3/mod.ts";

const INPUT_FILE = 'input.txt';

let sum1 = 0;
let sum2 = 0;
const file = await Deno.open(INPUT_FILE);
for await (const line of bufio.readLines(file)) {
    const [part1, part2] = line.split(' | ');
    const sdigits1 = part1.split(' ');
    const sdigits2 = part2.split(' ');

    const segments1 = sdigits1.map(x => new Superset(x.split('')));
    const s2 = segments1.filter(s => s.size === 2); // digits with 2 segments: 1
    const s3 = segments1.filter(s => s.size === 3); // digits with 3 segments: 7
    const s4 = segments1.filter(s => s.size === 4); // digits with 4 segments: 4
    const s5 = segments1.filter(s => s.size === 5); // digits with 5 segments: 2,3,4
    const s6 = segments1.filter(s => s.size === 6); // digits with 6 segments: 0,6,9
    const s7 = segments1.filter(s => s.size === 7); // digits with 7 segments: 8
    const d1 = s2[0];                                           // 2-segment-group: only 1
    const d7 = s3[0];                                           // 3-segment-group: only 7
    const d4 = s4[0];                                           // 4-segment-group: only 4
    const d8 = s7[0];                                           // 7-segment-group: only 8
    const d6 = s6.filter(x => (x.intersect(d1).size) !== 2)[0]; // 6-segment-group 0,6,9: 6 is the only one which isn't fully overlapped by 1
    const d9 = s6.filter(x => (x.intersect(d4).size) === 4)[0]; // 6-segment-group 0,6,9: 9 is the only one which is fully overlapped by 4
    const d2 = s5.filter(x => (x.intersect(d9).size) !== 5)[0]; // 5-segment-group 2,3,5: 2 is the only one which doesn't fully overlap 9
    const d3 = s5.filter(x => (x.intersect(d1).size) === 2)[0]; // 5-segment-group 2,3,5: 3 is the only one which is fully overlapped by 1
    const d5 = s5.filter(x => (x.intersect(d6).size) === 5)[0]; // 5-segment-group 2,3,5: 5 is the only one which fully overlaps 6
    const d0 = s6.filter(x => (x.intersect(d5).size) === 4)[0]; // 6-segment-group 0,6,9: 0 is the only one which isn't fully overlapped by 5
    const segments = [d0, d1, d2, d3, d4, d5, d6, d7, d8, d9];

    const segments2 = sdigits2
        .map(x => new Superset(x.split('')))                    // convert to sets
        .map(x => segments.filter(y => y.equals(x))[0]);        // find equal sets in segments array

    sum1 += segments2.filter(s => [d1, d4, d7, d8].includes(s)).length;
    sum2 += +segments2.map(s => segments.indexOf(s)).join('');  // convert digits to number and add up
}

console.log(`Part one: ${sum1}`);
console.log(`Part two: ${sum2}`);
