import { difference, intersection, isDisjoint } from "https://deno.land/x/set_operations@v1.1.0/mod.ts";
import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';
const FIELD_WIDTH = 7;
const ROCK_COUNT1 = 2022;
const ROCK_COUNT2 = 1000000000000;

type Move = -1 | 1;
type Shape = Array<Array<number>>;

const rock1 = [
    [1, 1, 1, 1]
];
const rock2 = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
];
const rock3 = [
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
];
const rock4 = [
    [1],
    [1],
    [1],
    [1],
];
const rock5 = [
    [1, 1],
    [1, 1],
];

class Rock {
    public width = 0;
    public height = 0;
    constructor(
        public shape: Shape,
        public hpos = 0,
        public vpos = 0
    ) {
        this.width = this.shape[0].length;
        this.height = this.shape.length;
    }
    public move(x: number, y: number) {
        this.hpos += x;
        this.vpos += y;
        if (this.hpos < 0) {
            this.hpos = 0;
        }
        if ((this.hpos + this.width - 1) >= FIELD_WIDTH) {
            this.hpos = FIELD_WIDTH - this.width;
        }
    }
    public clone(): Rock {
        return new Rock(this.shape, this.hpos, this.vpos);
    }
    public getOccupiedPositons(deltay = 0): Set<string> {
        const s: Set<string> = new Set();
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.shape[y][x] === 1) {
                    s.add(`${this.hpos + x},${this.height - y - 1 + this.vpos - deltay}`)
                }
            }
        }
        return s;
    }
    public doesCollideWith(r2: Rock): boolean {
        const c1 = this.getOccupiedPositons();
        const c2 = r2.getOccupiedPositons();
        return !isDisjoint(c1, c2);
    }
    public doesCollideWithAny(otherrocks: Array<Rock>): boolean {
        for (const r2 of otherrocks) {
            if (this.doesCollideWith(r2)) {
                return true;
            }
        }
        return false;
    }
}

const rocks: Array<Rock> = [
    new Rock(rock1),
    new Rock(rock2),
    new Rock(rock3),
    new Rock(rock4),
    new Rock(rock5),
]

const moves: Array<Move> = [];
const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    moves.push(...line.split('').map(c => c === '<' ? -1 : 1));
}

const shapes: Array<Shape> = rocks.map(r => r.shape);
const positionsInRow = new Set(Array.from(Array(FIELD_WIDTH).keys()));

let stack: Array<Rock> = [];
let stack_height = 0;
let mpos = 0;
let rpos = 0;

const dispenserock = (): Rock => {
    const rock = rocks[rpos].clone();
    rpos = (rpos + 1) % rocks.length;
    rock.hpos = 2;
    rock.vpos = stack_height + 4;
    return rock;
}
const nextmove = (): Move => {
    const m = moves[mpos];
    mpos = (mpos + 1) % moves.length;
    return m;
}
const emptyPositionsInRow = (y: number): Set<number> => {
    const posfill: Set<number> = new Set(positionsInRow);
    for (let x = 0; x < FIELD_WIDTH; x++) {
        const pos = `${x},${y}`;
        for (const r of stack) {
            if (r.getOccupiedPositons().has(pos)) {
                posfill.delete(x);
                break;
            }
        }
    }
    return posfill;
}
const invert = (positions: Set<number>): Set<number> => {
    return difference(positionsInRow, positions);
}
const fillup = (posfill: Set<number>, used: Set<number>): void => {
    for (let i = 1; i < FIELD_WIDTH; i++) {
        if (!used.has(i)) {
            if (i > 0) {
                if (posfill.has(i - 1)) {
                    posfill.add(i);
                }
            }
        }
    }
    for (let i = FIELD_WIDTH - 2; i >= 0; i--) {
        if (!used.has(i)) {
            if (posfill.has(i + 1)) {
                posfill.add(i);
            }
        }
    }
}
const prune = (): void => {
    // We flood fill the empty region beginning at the top of the stack (y = stack_height)
    // and find the lowest point. Every rock below that point does not contribute to anything
    // and can be removed.
    // Note: My first idea was just to raycast from above and remove every rock which is
    // completely shadowed. But this didn't work, since new rocks can slip in sideways underneath.
    let y = stack_height;
    let lastfill = emptyPositionsInRow(y);
    let fill: Set<number> = new Set();
    while (--y > 0 && lastfill.size > 0) {
        const emptyPositions = emptyPositionsInRow(y);
        fill = intersection(lastfill, emptyPositions);
        fillup(fill, invert(emptyPositions));
        lastfill = fill;
    }
    stack = stack.filter(r => (r.vpos + r.height) >= y);
}
const createState = (): string => {
    // A state of the current rock, move position and all the pruned rocks in the stack.
    const coords = new Set<string>();
    stack.forEach(r => r.getOccupiedPositons(stack_height).forEach(p => coords.add(p)));
    return rpos + ':' + mpos + ':' + Array.from(coords.values()).sort().join(':');
}
const dump = (rock: Rock | null = null): void => {
    console.log(`----- height = ${stack_height}, rcount=${rcount} -----`);
    const field2 = [...stack];
    let h = stack_height;
    if (rock) {
        field2.push(rock);
        h = Math.max(rock.vpos + rock.height - 1, stack_height);
    }
    for (let y = h; y >= 1; y--) {
        const row = [0, 0, 0, 0, 0, 0, 0];
        for (const r of field2) {
            const y1 = r.vpos;
            const y2 = r.vpos + r.height - 1;
            if (y1 <= y && y <= y2) {
                const rrow = r.shape[r.height - (y - y1) - 1];
                let x = r.hpos;
                for (const c of rrow) {
                    if (c === 1) {
                        row[x] = r === rock ? 10 : shapes.indexOf(r.shape) + 1;
                    }
                    x++;
                }
            }
        }
        console.log(String(y).padStart(4, '0'), '|' + row.map(x => x === 0 ? '.' : (x === 10 ? '@' : String.fromCharCode(48 + x))).join('') + '|');
    }
    console.log('0000', '+-------+');
}

let solution1 = -1;
let rcount = 0;
let rock = dispenserock();
let patterns: Map<string, [number, number]> | null = new Map();
while (rcount < ROCK_COUNT2) {
    const move = nextmove();
    rock.move(move, 0);
    if (rock.doesCollideWithAny(stack)) {
        rock.move(-move, 0);
    }
    rock.move(0, -1);
    if (rock.doesCollideWithAny(stack) || rock.vpos === 0) {
        rock.move(0, 1);
        stack.push(rock);
        stack_height = Math.max(stack_height, rock.vpos + rock.height - 1);
        prune();
        rcount++;
        // dump(rock);

        if (rcount === ROCK_COUNT1) {
            solution1 = stack_height;
        }

        if (patterns) {
            // We check if the exact same pattern of rocks (after pruning) including the current kind
            // of rock and wind position has happened before. In that case we can repeat the sub-stack
            // until we are just below the ROCK_COUNT2 line.
            const pattern = createState();
            const found = patterns.get(pattern)
            if (found && solution1 !== -1) {
                const [oheight, orcount] = found;
                console.log(`Found identical pattern at height=${oheight}, rcount=${orcount} and height=${stack_height}, rcount=${rcount}.`);
                const delta_height = stack_height - oheight;
                const delta_rcount = rcount - orcount;
                const repeat = Math.floor((ROCK_COUNT2 - rcount) / delta_rcount);
                const addheight = repeat * delta_height;
                stack.forEach(r => {
                    r.vpos += addheight;
                });
                rcount += repeat * delta_rcount;
                stack_height += addheight;
                patterns = null; // no more pattern checking needed
            } else {
                patterns.set(pattern, [stack_height, rcount]);
            }
        }

        rock = dispenserock();
    }
}

console.log(`Part one: ${solution1}`);
console.log(`Part one: ${stack_height}`);
