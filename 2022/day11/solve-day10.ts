import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

class Monkey {
    constructor(public name: number) {
    }

    public items: Array<number> = [];
    public devisible = -1;
    public throwToMonkeyIfTrueValue = -1;
    public throwToMonkeyIfFalseValue = -1;
    public throwToMonkeyIfTrue: Monkey | undefined = undefined;
    public throwToMonkeyIfFalse: Monkey | undefined = undefined;
    public operation = '*';
    public param1: null | number = null;
    public param2: null | number = null;
    public inspections = 0;
    public devideBy = 0;
    public turn(): void {
        while (this.items.length > 0) {
            this.inspections++;
            let item = <number>this.items.shift();
            const val1 = this.param1 ?? item;
            const val2 = this.param2 ?? item;
            item = this.operation === '*' ? val1 * val2 : val1 + val2;
            item = item % greatestCommonMultiple; // this is the magic
            item = Math.floor(item / this.devideBy);
            if (item % this.devisible === 0) {
                (<Monkey>this.throwToMonkeyIfTrue).items.push(item);
            } else {
                (<Monkey>this.throwToMonkeyIfFalse).items.push(item);
            }
        }
    }
    public clone(): Monkey {
        const clone = Object.assign(new Monkey(this.name), this);
        clone.items = [... this.items];
        return clone;
    }
    public init(devide: number, monkeys: Array<Monkey>): void {
        this.devideBy = devide;
        this.throwToMonkeyIfTrue = monkeys.filter(m => m.name === this.throwToMonkeyIfTrueValue)[0];
        this.throwToMonkeyIfFalse = monkeys.filter(m => m.name === this.throwToMonkeyIfFalseValue)[0]
    }
}

const monkeys: Array<Monkey> = [];
let monkey = new Monkey(-1);
const reOperation = new RegExp('^(.+)([*+])(.+)$');

const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    let inp = line.trim().toLowerCase().replaceAll(' ', '');
    if (inp.startsWith('monkey')) {
        inp = inp.substring(0, inp.length - 1);
        monkey = new Monkey(+inp.split('monkey')[1]);
        monkeys.push(monkey);
    } else if (inp.startsWith('starting')) {
        const [_, items] = inp.split(':');
        monkey.items.push(...items.split(',').map(i => +i));
    } else if (inp.startsWith('operation')) {
        const [_, op] = inp.split('=');
        const match = reOperation.exec(op);
        if (match) {
            monkey.param1 = isNaN(+match[1]) ? null : +match[1];
            monkey.operation = match[2];
            monkey.param2 = isNaN(+match[3]) ? null : +match[3];
        }
    } else if (inp.startsWith('test')) {
        const parts = inp.split('divisibleby');
        monkey.devisible = +parts[1];
    } else if (inp.startsWith('iftrue')) {
        monkey.throwToMonkeyIfTrueValue = +inp.split('monkey')[1];
    } else if (inp.startsWith('iffalse')) {
        monkey.throwToMonkeyIfFalseValue = +inp.split('monkey')[1];
    }
}

const greatestCommonMultiple = monkeys.reduce((d, m) => d *= m.devisible, 1);
const monkeys1 = monkeys.map(m => m.clone());
const monkeys2 = monkeys.map(m => m.clone());
monkeys1.forEach(monkey => monkey.init(3, monkeys1));
monkeys2.forEach(monkey => monkey.init(1, monkeys2));

for (let round = 1; round <= 10000; round++) {
    if (round <= 20) {
        monkeys1.forEach(monkey => monkey.turn());
    }
    monkeys2.forEach(monkey => monkey.turn());
}

monkeys1.sort((a, b) => b.inspections - a.inspections);
monkeys2.sort((a, b) => b.inspections - a.inspections);
const solution1 = monkeys1[0].inspections * monkeys1[1].inspections;
const solution2 = monkeys2[0].inspections * monkeys2[1].inspections;
console.log(`Part one: ${solution1}`);
console.log(`Part two: ${solution2}`);
