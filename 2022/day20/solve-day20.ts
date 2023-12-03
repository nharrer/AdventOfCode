import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

class Number {
    constructor(public value: number, public prev?: Number, public next?: Number) {
    }

    toString(): string {
        return this.value.toString();
    }
}

function move(start: Number): void {
    let steps = start.value;
    if (steps === 0) {
        return;
    }
    const dir = Math.sign(steps);
    // remove current
    start.prev!.next = start.next;
    start.next!.prev = start.prev;
    // printNumbers(start.next!);
    if (dir < 1)    {
        steps --;
    }
    let current = start;
    while (steps !== 0) {
        if (steps > 0) {
            current = current.next!;
        } else {
            current = current.prev!;
        }
        steps -= dir;
    }
    const next = current.next!;
    current.next = start;
    next.prev = start;
    start.prev = current;
    start.next = next;
}

function printNumbers(start: Number): void {
    let current = start;
    let s = '';
    do {
        s += current.toString() + ' ';
        current = current.next!;
    } while (current !== start);
    console.log(s);
}

const numbers: Array<Number> = [];
const file = await Deno.open(INPUT_FILE);
let prev: Number | undefined = undefined;
for await (const line of readLines(file)) {
    const n: Number = new Number(+line, prev, undefined);
    if (prev) {
        prev.next = n;
    }
    prev = n;
    numbers.push(n);
}
const first = numbers[0];
const last = numbers[numbers.length - 1];
first.prev = last;
last.next = first;
const zero = numbers.filter(n => n.value === 0)[0];

//printNumbers(first);
numbers.forEach(n => {
    move(n);
});
//printNumbers(first);


let sum = 0;
let current = zero;
for (let i = 0; i < 1000; i++) {
    current  = current.next!;
}
sum += current.value;
current = zero;
for (let i = 0; i < 2000; i++) {
    current  = current.next!;
}
sum += current.value;
current = zero;
for (let i = 0; i < 3000; i++) {
    current  = current.next!;
}
sum += current.value;

console.log(sum);
