import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

class Sensor {
    constructor(
        public x: number,
        public y: number,
        public bx: number,
        public by: number,
    ) {
        this.md = Math.abs(x - bx) + Math.abs(y - by);
    }
    public md: number;
    public range(y: number): [number, number] | null {
        const yd = Math.abs(this.y - y);
        const min = this.x - (this.md - yd);
        const max = this.x + (this.md - yd);
        if (min <= max) {
            return [min, max];
        }
        return null;
    }
}

const re = new RegExp('Sensor at x=(.+), y=(.+): closest beacon is at x=(.+), y=(.+)$');

const sensors: Array<Sensor> = [];
const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    const match = line.match(re);
    if (match) {
        sensors.push(new Sensor(+match[1], +match[2], +match[3], +match[4]));
    }
}

const mergeIntervals = (ranges: Array<[number, number]>): Array<[number, number]> => {
    ranges.sort((b, a) => b[0] - a[0]);
    const result: Array<[number, number]> = [];
    let prev: [number, number] = [-1, -1];
    ranges.forEach(r => {
        if (result.length === 0) {
            result.push(r);
            prev = r;
        } else {
            if (r[0] <= prev[1]) {
                prev[1] = Math.max(prev[1], r[1]);
            } else {
                result.push(r);
                prev = r;
            }
        }
    })
    return result;
}

const mergedRanges = (y: number): Array<[number, number]> => {
    let ranges: Array<[number, number]> = [];
    sensors.forEach(s => {
        const r = s.range(y);
        if (r) {
            ranges.push(r);
        }
    });
    ranges = mergeIntervals(ranges);
    return ranges;
}

let solution1 = -1;
const yy = 2000000;
const ranges = mergedRanges(yy);
const min = Math.min(...ranges.map(r => r[0]));
const max = Math.max(...ranges.map(r => r[1]));
for (let x = min; x <= max; x++) {
    if (ranges.some((r => x >= r[0] && x <= r[1]))) {
        if (sensors.filter(s => s.bx === x && s.by === yy).length === 0) {  // ignore other beacons
            solution1++;
        }
    }
}

let solution2 = -1;
const cr = 4000000;
for (let y = 0; y <= cr && solution2 < 0; y++) {
    const ranges = mergedRanges(y);
    if (ranges.length > 1) {
        solution2 = (ranges[1][0] - 1) * 4000000 + y;
        break;
    }
}

console.log(`Part one: ${solution1}`);
console.log(`Part two: ${solution2}`);
