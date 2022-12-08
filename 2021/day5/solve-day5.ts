import { bufio } from "https://deno.land/x/aoc@0.0.1-alpha.11/deps.ts";

const INPUT_FILE = 'input.txt';

const addPoint = (x: number, y: number, map: Map<string, number>) => {
    const point = [x, y].toString();
    const cnt = map.get(point) || 0;
    map.set(point, cnt + 1);
}

const re = new RegExp('^(\\d+),(\\d+) -> (\\d+),(\\d+)$');
const points1: Map<string, number> = new Map();
const points2: Map<string, number> = new Map();

const file = await Deno.open(INPUT_FILE);
for await (const line of bufio.readLines(file)) {
    const match = line.match(re);
    if (match) {
        const x1 = +match[1];
        const y1 = +match[2];
        const x2 = +match[3];
        const y2 = +match[4];
        const stepx = Math.sign(x2 - x1);
        const stepy = Math.sign(y2 - y1);
        let x = x1, y = y1;
        do {
            if (stepx === 0 || stepy === 0) {
                addPoint(x, y, points1);
            }
            addPoint(x, y, points2);
            x += stepx;
            y += stepy;
        } while ((x - stepx) !== x2 || (y - stepy)  !== y2);
    }
}

const sol1 = Array.from(points1.values()).filter(p => p >= 2).length;
const sol2 = Array.from(points2.values()).filter(p => p >= 2).length;

console.log(`Part one: ${sol1}`);
console.log(`Part two: ${sol2}`);
