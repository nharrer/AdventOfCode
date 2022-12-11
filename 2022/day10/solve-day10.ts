import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

let x = 1;
let cycle = 1;
let solution1 = 0;
let currentline = '';
const screen: string[] = [];

function execute(instr: () => void = () => 0): void {
    const signal = cycle * x;
    if ((cycle - 20) % 40 === 0) {
        solution1 += signal;
    }

    const hpos = (cycle - 1) % 40;
    const pixel = (x >= (hpos - 1)) && (x <= (hpos + 1)) ? '#' : ' ';
    currentline += pixel;

    if (currentline.length === 40) {
        screen.push(currentline);
        currentline = '';
    }

    instr();
    cycle++;
}

const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    const [cmd, arg] = line.split(' ');
    execute();  // first cycle never does anything
    if (cmd === 'addx') {
        execute(() => x += +arg);
    }
}

console.log(`Part one: ${solution1}`);
console.log('Part two:');
screen.forEach(p => console.log(p));
