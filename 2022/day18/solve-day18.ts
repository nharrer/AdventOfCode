import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

class Cube {
    constructor(
        public x: number,
        public y: number,
        public z: number,
    ) {
    }
    public filler = false;
    public neighbors: Array<[Cube | null, Cube | null]> = [[null, null], [null, null], [null, null]];
    public get openfaces(): number {
        return this.neighbors.reduce((sum, n) => sum + (n[0] === null ? 1 : 0) + (n[1] === null ? 1 : 0), 0);
    }
}

const cubes: Map<string, Cube> = new Map();

const getCoords = (x: number, y: number, z: number): string => `${x},${y},${z}`;

const connect = (cube: Cube): void => {
    const [x, y, z] = [cube.x, cube.y, cube.z];
    for (const dimension of [0, 1, 2]) {
        for (const dir of [-1, 1]) {
            const dd = [dimension === 0 ? 1 : 0, dimension === 1 ? 1 : 0, dimension === 2 ? 1 : 0];
            const cube2 = cubes.get(getCoords(x + dir * dd[0], y + dir * dd[1], z + dir * dd[2]));
            if (cube2) {
                if (dir < 0) {
                    cube2.neighbors[dimension][1] = cube;
                    cube.neighbors[dimension][0] = cube2;
                } else {
                    cube2.neighbors[dimension][0] = cube;
                    cube.neighbors[dimension][1] = cube2;
                }
            }
        }
    }
}

const fill = (): void => {
    const queue: Array<[number, number, number]> = [[xmin, ymin, zmin]];
    while (queue.length > 0) {
        const [x, y, z] = <[number, number, number]>queue.shift();
        if ((xmin <= x && x <= xmax) &&
            (ymin <= y && y <= ymax) &&
            (zmin <= z && z <= zmax)) {
            const coords = getCoords(x, y, z);
            if (!cubes.get(coords)) {
                const cf = new Cube(x, y, z);
                cf.filler = true;
                connect(cf);
                cubes.set(coords, cf);
                for (const dir of [-1, 1]) {
                    queue.push([x + dir, y, z]);
                    queue.push([x, y + dir, z]);
                    queue.push([x, y, z + dir]);
                }
            }
        }
    }
}

let xmin = Number.MAX_SAFE_INTEGER;
let xmax = Number.MIN_SAFE_INTEGER;
let ymin = Number.MAX_SAFE_INTEGER;
let ymax = Number.MIN_SAFE_INTEGER;
let zmin = Number.MAX_SAFE_INTEGER;
let zmax = Number.MIN_SAFE_INTEGER;
const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    const [x, y, z] = line.split(',').map(p => +p);
    const coords = getCoords(x, y, z);
    const cube = new Cube(x, y, z);
    connect(cube);
    cubes.set(coords, cube);
    xmin = Math.min(x, xmin);
    xmax = Math.max(x, xmax);
    ymin = Math.min(y, ymin);
    ymax = Math.max(y, ymax);
    zmin = Math.min(z, zmin);
    zmax = Math.max(z, zmax);
}
xmax += 1; xmin -= 1;
ymax += 1; ymin -= 1;
zmax += 1; zmin -= 1;

const dumpMinecraft = async (): Promise<void> => {
    // deno-lint-ignore no-explicit-any
    const objects: Array<any> = [];
    cubes.forEach(cube => {
        let istop = true;
        for (let z = cube.z + 1; z <= zmax; z++) {
            if (cubes.get(getCoords(cube.x, cube.y, z))) {
                istop = false;
                break;
            }
        }

        const coords = [(cube.x - 11) * 16, (cube.z - 11) * 16, (cube.y - 11) * 16];
        let model = 'dirt';
        if (istop) {
            model = 'grass_block';
        } else if (Math.random() < 0.05) {
            model = 'iron_ore';
        } else if (Math.random() < (0.005 * (20 - cube.z))) {
            model = 'gold_ore';
        } else {
            if (cube.z < 10) {
                model = 'cobblestone';
            } else if (cube.z < 15) {
                model = 'stone';
            }
        }

        objects.push({
            type: 'block',
            model: model,
            offset: coords
        });
    });

    const filename = './minecraft.js';
    await Deno.writeTextFile(filename, 'var objects = ' + JSON.stringify(objects) + ';');
}

const solution1 = Array.from(cubes.values()).filter(c => !c.filler).reduce((sum, c): number => sum + c.openfaces, 0);
await dumpMinecraft();

fill();
const solution2 = solution1 - Array.from(cubes.values()).filter(c => !c.filler).reduce((sum, c): number => sum + c.openfaces, 0);

console.log(`Part one: ${solution1}`);
console.log(`Part two: ${solution2}`);
