import { readLines } from "../../import.ts";

const arrayToNumber = (a: Array<number>): number => {
    let i = 0;
    return a.reverse().reduce((v, d) => v + d * 2 ** i++, 0);
}

const mostCommonBitAt = (codes: Array<Array<number>>, position: number): number => {
    let count1 = 0;
    let lines = 0;
    codes.forEach(code => {
        count1 += code[position];
        lines++;
    });
    return count1 >= (lines - count1) ? 1 : 0;
}

const codes: Array<Array<number>> = [];
const file = await Deno.open('input.txt');
for await (const line of readLines(file)) {
    const p = line.split('');
    const code = p.map(x => +x);
    codes.push(code);
}
const digits = codes[0].length;
const positions = Array.from(Array(digits).keys());

const gamma = arrayToNumber(positions.map(pos => mostCommonBitAt(codes, pos)));
const epsilon = gamma ^ (2 ** digits - 1);  // invert with [digits] bits

let oxygenCodes = [...codes];
let co2Codes = [...codes];
positions.forEach(pos => {
    const oxfilter = mostCommonBitAt(oxygenCodes, pos);
    if (oxygenCodes.length > 1) {
        oxygenCodes = oxygenCodes.filter(v => v[pos] == oxfilter);
    }
    const co2filter = mostCommonBitAt(co2Codes, pos) ^ 1;
    if (co2Codes.length > 1) {
        co2Codes = co2Codes.filter(v => v[pos] === co2filter);
    }
});
const oxygen = arrayToNumber(oxygenCodes[0]);
const co2 = arrayToNumber(co2Codes[0]);

console.log(`Part one: ${gamma * epsilon}`);
console.log(`Part two: ${oxygen * co2}`);
