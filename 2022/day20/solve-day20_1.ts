import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';
const DKEY = 811589153;
const MIXINGS = 10;

class Number {
    constructor(public value: number) {
    }
}

const move = (list: Array<Number>, n: Number): void => {
    if (n.value !== 0) {
        let pos = list.indexOf(n);
        // remove n from list
        list.splice(pos, 1);
        pos = pos + n.value;
        pos = pos % list.length;
        // insert n at new position
        list.splice(pos, 0, n);
    }
}

const decrypt = (numbers: Array<Number>): number => {
    const zero = numbers.filter(n => n.value === 0)[0];
    const indexZero = numbers.indexOf(zero);
    const jumps = [1000, 2000, 3000];
    let sum = 0;
    jumps.forEach(jump => {
        const index = (indexZero + jump) % numbers.length;
        sum += numbers[index].value;
    });
    return sum;
}

const solve = (numbers: Array<Number>, mixings = 1, dkey = 1): number => {
    numbers.forEach(n => n.value = n.value * dkey); // multiply by DKEY
    const work = [...numbers];
    for (let i = 0; i < mixings; i++) {
        numbers.forEach(n => {
            move(work, n);
        });
    }
    return decrypt(work);
}

const numbers: Array<Number> = [];
const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    numbers.push(new Number(+line));
}

console.log("Solution 1: ", solve(numbers));
console.log("Solution 2: ", solve(numbers, MIXINGS, DKEY));
