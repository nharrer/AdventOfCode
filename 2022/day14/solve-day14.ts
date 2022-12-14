import { readLines } from "../../import.ts";
import { renderpng } from "./render.ts";

const INPUT_FILE = 'input.txt';

class Obj {
    constructor(
        public x: number,
        public y: number,
        public type: string
    ) {
    }
    public get coords() { return (this.x + ',' + this.y); }
}

const solve = async (part: string, hasfloor = false, drawit = false): Promise<void> => {
    const origin = [500, 0];

    const cave: Map<string, Obj> = new Map();
    const file = await Deno.open(INPUT_FILE);
    for await (const line of readLines(file)) {
        const parts = line.split(' -> ').map(p => p.split(',').map(c => +c));
        for (let i = 0; i < (parts.length - 1); i++) {
            let [x1, y1] = parts[i];
            let [x2, y2] = parts[i + 1];
            [x1, x2] = [Math.min(x1, x2), Math.max(x1, x2)];
            [y1, y2] = [Math.min(y1, y2), Math.max(y1, y2)];
            for (let x = x1; x <= x2; x++) {
                for (let y = y1; y <= y2; y++) {
                    const o = new Obj(x, y, '#');
                    cave.set(o.coords, o);
                }
            }
        }
    }

    const miny = origin[1];
    const maxy = Math.max(...Array.from(cave.values()).map(o => o.y)) + (hasfloor ? 2 : 0);

    const objAt = (x: number, y: number): Obj | null => {
        return cave.get(x + ',' + y) || null;
    }

    const draw = (): void => {
        const zeroPad = (num: number, places: number) => String(num).padStart(places, '0')

        // render as ascii
        const a = Array.from(cave.values());
        const minx = Math.min(...a.map(o => o.x)) - 1;
        const maxx = Math.max(...a.map(o => o.x)) + 1;
        for (let y = miny; y <= maxy; y++) {
            let line = '';
            for (let x = minx; x <= maxx; x++) {
                line += hasfloor && y == maxy ? 'F' : objAt(x, y)?.type ?? '.';
            }
            console.log(`${zeroPad(y, 3)}: ${line}`);
        }

        // render as png
        renderpng(`solution_${part}.png`, maxx - minx + 1, maxy + 1, hasfloor, a.map(o => ({ x: o.x - minx, y: o.y - miny, type: o.type })));
    }

    let finished = false;
    do {
        const sand = new Obj(origin[0], origin[1], 'o');
        let resting = false;
        do {
            const y2 = sand.y + 1;
            for (const xd of [0, -1, 1, 2]) {
                if (xd === 2) {
                    resting = true;
                    if (sand.y === origin[1]) {
                        finished = true;
                    }
                    cave.set(sand.coords, sand);
                } else {
                    const x2 = sand.x + xd;
                    if (objAt(x2, y2) === null && (!hasfloor || y2 < maxy)) {
                        sand.x = x2;
                        sand.y = y2;
                        break;
                    }
                }
            }
            if (sand.y > maxy) {
                finished = true;
            }
        } while (!finished && !resting);
    } while (!finished);

    console.log(`Part ${part}: ${Array.from(cave.values()).filter(o => o.type === 'o').length}`);

    if (drawit) {
        draw();
        console.log();
    }
}

await solve('one', false, true);
await solve('two', true, true);
