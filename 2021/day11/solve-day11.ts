import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';
const STEPS = 100;
const SIZE = 10;

class Octopus {
    public neighbors: Array<Octopus> = [];

    constructor(public level: number) { }

    public increase(): void {
        this.level++;
        if (this.level == 10) {
            this.neighbors.forEach(on => {
                on.increase();
            });
        }
    }

    public reset(): number {
        if (this.level > 9) {
            this.level = 0;
            return 1;
        }
        return 0;
    }
}

const field: Array<Array<Octopus>> = [];
const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    const levels = line.split('').map(x => +x);
    const row = levels.map(l => new Octopus(l));
    field.push(row);
}

// initialize neighbors for each octopus
for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
        const o = field[y][x];
        for (let xx = x - 1; xx <= (x + 1); xx++) {
            if (xx >= 0 && xx < SIZE) {
                for (let yy = y - 1; yy <= (y + 1); yy++) {
                    if (yy >= 0 && yy < SIZE && (xx !== x || yy !== y)) {
                        o.neighbors.push(field[yy][xx]);
                    }
                }
            }
        }
    }
}

// a flat list of octopuses for convenience
const all: Array<Octopus> = field.reduce((all: Array<Octopus>, row: Array<Octopus>) => { all.push(...row); return all; }, []);
let solution1 = 0;
let solution2 = -1;
let step = 1;
do {
    all.forEach(o => o.increase());
    const flashes = all.reduce((sum, o) => sum + o.reset(), 0);
    if (step <= STEPS) {
        solution1 += flashes;
    }
    const levelsum = all.reduce((sum, o) => sum + o.level, 0);
    if (levelsum === 0) {
        solution2 = step;
    }
    step++;
} while(solution2 < 0);

console.log(`Part one: ${solution1}`);
console.log(`Part two: ${solution2}`);
