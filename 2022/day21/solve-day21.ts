import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

abstract class Monkey {
    constructor(public name: string) { }
    public abstract calculate(): number;
    public abstract hasHuman(human: Monkey): boolean;
}

class MonkeyNumber extends Monkey {
    constructor(
        public name: string,
        public value: number
    ) {
        super(name);
    }

    public calculate(): number {
        return this.value;
    }

    public hasHuman(human: Monkey): boolean {
        return this === human;
    }
}

class MonkeyCalc extends Monkey {
    constructor(
        public name: string,
        public monkeyname1: string,
        public monkeyname2: string,
        public opName: string
    ) {
        super(name);
    }

    public monkey1!: Monkey;
    public monkey2!: Monkey;

    public calculate(): number {
        if (this.opName === '+') {
            return this.monkey1.calculate() + this.monkey2.calculate();
        } else if (this.opName === '-') {
            return this.monkey1.calculate() - this.monkey2.calculate();
        } else if (this.opName === '*') {
            return this.monkey1.calculate() * this.monkey2.calculate();
        } else {
            return this.monkey1.calculate() / this.monkey2.calculate();
        }
    }

    public hasHuman(human: Monkey): boolean {
        if (this == human) {
            return true;
        }
        return this.monkey1.hasHuman(human) || this.monkey2.hasHuman(human);
    }
}

const solve2 = (current: Monkey, root: Monkey, humn: Monkey, result: number | undefined): number => {
    if (current === humn) {
        return result!; // we found the solution
    }
    if (current instanceof MonkeyNumber) {
        return current.value;
    }
    // We check on which side the human is. Then we calculate the value of the other side.
    // Based on then value we can calculate the value on the human side. And we go deeper recursively.
    const monkeyCalc = current as MonkeyCalc;
    const humanIsLeft = monkeyCalc.monkey1.hasHuman(humn);
    const value1 = humanIsLeft ? monkeyCalc.monkey2.calculate() : monkeyCalc.monkey1.calculate();
    let value2: number;
    if (monkeyCalc === root) {
        value2 = value1;
    } else if (monkeyCalc.opName === '+') {
        value2 = result! - value1;
    } else if (monkeyCalc.opName === '*') {
        value2 = result! / value1;
    } else if (monkeyCalc.opName === '-') {
        if (humanIsLeft) {
            value2 = value1 + result!;
        } else {
            value2 = value1 - result!;
        }
    } else if (monkeyCalc.opName === '/') {
        if (humanIsLeft) {
            value2 = value1 * result!;
        } else {
            value2 = value1 / result!;
        }
    }
    return solve2(humanIsLeft ? monkeyCalc.monkey1 : monkeyCalc.monkey2, root, humn, value2!);
}

const monkeys: Map<string, Monkey> = new Map();
const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    const parts1 = line.split(': ');
    const name = parts1[0];
    const parts2 = parts1[1].split(' ');
    if (parts2.length === 1) {
        monkeys.set(name, new MonkeyNumber(name, +parts2[0]));
    } else {
        const monkey1 = parts2[0];
        const op = parts2[1];
        const monkey2 = parts2[2];
        monkeys.set(name, new MonkeyCalc(name, monkey1, monkey2, op));
    }
}

// update references
for (const m of monkeys.values()) {
    if (m instanceof MonkeyCalc) {
        m.monkey1 = monkeys.get(m.monkeyname1)!;
        m.monkey2 = monkeys.get(m.monkeyname2)!;
    }
}

const root = monkeys.get('root')!;
const humn = monkeys.get('humn')!;
console.log("Solution 1: ", root.calculate());
console.log("Solution 2: ", solve2(root, root, humn, undefined));
