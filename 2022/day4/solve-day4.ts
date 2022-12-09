import { readLines } from "../../import.ts";

const file = await Deno.open('input.txt');
let cnt1 = 0, cnt2 = 0;
for await(const l of readLines(file)) {
    const [a, b, c, d] = l.replace(',', '-').split('-').map(x => +x);
    cnt1 += (a <= c && b >= d) || (c <= a && d >= b) ? 1 : 0;
    cnt2 += (a <= d && b >= c) ? 1 : 0;
}
console.log(`Part one: ${cnt1}`);
console.log(`Part two: ${cnt2}`);
