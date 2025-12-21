const INPUT_FILE = 'input.txt';

class Cuboid {
    constructor(
        public on: boolean,
        public xMin: number, public xMax: number,
        public yMin: number, public yMax: number,
        public zMin: number, public zMax: number) {
    }

    volume(): number {
        return (this.xMax - this.xMin + 1) * (this.yMax - this.yMin + 1) * (this.zMax - this.zMin + 1);
    }

    overlaps(other: Cuboid): boolean {
        return !(
            this.xMax < other.xMin || this.xMin > other.xMax ||
            this.yMax < other.yMin || this.yMin > other.yMax ||
            this.zMax < other.zMin || this.zMin > other.zMax
        );
    }

    intersection(other: Cuboid): Cuboid | null {
        if (!this.overlaps(other)) {
            return null;
        }
        return new Cuboid(this.on,
            Math.max(this.xMin, other.xMin), Math.min(this.xMax, other.xMax),
            Math.max(this.yMin, other.yMin), Math.min(this.yMax, other.yMax),
            Math.max(this.zMin, other.zMin), Math.min(this.zMax, other.zMax)
        );
    }

    partition(other: Cuboid): Cuboid[] {
        if (!this.overlaps(other)) {
            return [this];
        }
        const cmp = (n1: number, n2: number) => n1 - n2;
        const xCuts = [this.xMin, this.xMax + 1, other.xMin, other.xMax + 1].sort(cmp);
        const yCuts = [this.yMin, this.yMax + 1, other.yMin, other.yMax + 1].sort(cmp);
        const zCuts = [this.zMin, this.zMax + 1, other.zMin, other.zMax + 1].sort(cmp);
        const segments: Cuboid[] = [];
        for (let xi = 0; xi < xCuts.length - 1; xi++) {
            for (let yi = 0; yi < yCuts.length - 1; yi++) {
                for (let zi = 0; zi < zCuts.length - 1; zi++) {
                    const seg = new Cuboid(this.on, xCuts[xi], xCuts[xi + 1] - 1, yCuts[yi], yCuts[yi + 1] - 1, zCuts[zi], zCuts[zi + 1] - 1);
                    if (this.overlaps(seg)) {
                        segments.push(seg);
                    }
                }
            }
        }
        return segments;
    }
}

const lines = (await Deno.readTextFile(INPUT_FILE)).trim().split('\n');
const cubiods = lines.map((line) => {
    const [onOff, coords] = line.split(' ');
    const nums = coords.match(/-?\d+/g)!.map(Number);
    return new Cuboid(onOff === 'on', nums[0], nums[1], nums[2], nums[3], nums[4], nums[5]);
});

let regions: Cuboid[] = [];
for (const c of cubiods) {
    // partition existing regions and only keep the parts that are outside of c
    const newRegions: Cuboid[] = [];
    for (const f of regions) {
        for (const seg of f.partition(c)) {
            if (!c.overlaps(seg)) {
                newRegions.push(seg);
            }
        }
    }
    if (c.on) {
        newRegions.push(c); // and keep c itself only if it's "on"
    }
    regions = newRegions;
}

const initRegion = new Cuboid(true, -50, 50, -50, 50, -50, 50);
const part1 = regions.map((r) => r.intersection(initRegion)?.volume() ?? 0).reduce((a, b) => a + b, 0);
const part2 = regions.map((r) => r.volume()).reduce((a, b) => a + b, 0);
console.log(`Part one: ${part1}`);
console.log(`Part two: ${part2}`);
