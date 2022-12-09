import { readLines } from "../../import.ts";

let sum = 0;
let calArray = [];
const regex = new RegExp('^[0-9]+$');

const file = await Deno.open('input.txt');
for await(const line of readLines(file)) {
    if (!regex.test(line)) {
        calArray.push(sum);
        sum = 0;
    } else {
        sum += +line;
    }
}
calArray.push(sum);
calArray = calArray.sort((a, b) => a < b ? 1 : -1);

console.log(`Part one: ${calArray[0]}`);
console.log(`Part two: ${calArray[0]+calArray[1]+calArray[2]}`);
