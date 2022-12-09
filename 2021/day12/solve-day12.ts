import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

class Cave {
    constructor(public readonly name: string) {
        this.isBigCave = name[0].toUpperCase() === name[0];
    }
    public isBigCave = false;
    public exits: Array<Cave> = [];
    public toString(): string {
        return this.name;
    }
}

const file = await Deno.open(INPUT_FILE);
const map: Map<string, Cave> = new Map();

for await (const line of readLines(file)) {
    const [nameFrom, nameTo] = line.split('-');

    let caveFrom = map.get(nameFrom);
    if (!caveFrom) {
        caveFrom = new Cave(nameFrom);
        map.set(caveFrom.name, caveFrom);
    }

    let caveTo = map.get(nameTo);
    if (!caveTo) {
        caveTo = new Cave(nameTo);
        map.set(caveTo.name, caveTo);
    }

    caveFrom.exits.push(caveTo);
    caveTo.exits.push(caveFrom);
}

const startCave = <Cave>map.get('start');
const endCave = <Cave>map.get('end');
const solutions1: Array<Array<Cave>> = [];
const solutions2: Array<Array<Cave>> = [];

const search = (cave: Cave, allAtMost: number, oneAtMost: number, solutions: Array<Array<Cave>>, path: Array<Cave> = []): void => {
    const path2 = [...path];
    if (cave === endCave) {
        path2.push(cave);
        solutions.push(path2);
        return;
    } else if (cave === startCave && path.includes(startCave)) {
        return;
    } else if (!cave.isBigCave) {
        const map: Map<Cave, number> = new Map();
        map.set(cave, 1);
        path.forEach(c => {
            if (c !== startCave && !c.isBigCave) {
                const cnt = map.get(c) || 0;
                map.set(c, cnt + 1);
            }
        });
        const cond1 = Array.from(map.entries()).filter(x => {
            return x[1] > allAtMost;
        });
        const cond2 = Array.from(map.entries()).filter(x => {
            return x[1] > oneAtMost;
        });
        if (cond1.length > 1 || cond2.length > 0) {
            return;
        }
    }

    path2.push(cave);
    cave.exits.forEach(c => {
        search(c, allAtMost, oneAtMost, solutions, path2);
    });
}

search(startCave, 1, 1, solutions1);
search(startCave, 1, 2, solutions2);

console.log(`Part one: ${solutions1.length}`);
console.log(`Part two: ${solutions2.length}`);
