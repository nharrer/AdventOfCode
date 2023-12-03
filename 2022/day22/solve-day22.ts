import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

enum Dir { RIGHT = 0, DOWN = 1, LEFT = 2, UP = 3 }
enum Rot { RIGHT = 1, LEFT = -1 }
enum MoveType { FORWARD = 0, ROTATE = 1 }

class Tile {
    constructor(
        public x: number,
        public y: number,
        public isWall = false
    ) { }
    // new tile if moving in direction
    public newtile: Map<Dir, Tile> = new Map();
    // new dir if moving in direction
    public newdir: Map<Dir, Dir> = new Map();
}

class Move {
    constructor(
        public type: MoveType
    ) { }
    public value?: number;
    public rot?: Rot;
}

class Direction {
    constructor(
        public dir: Dir,
        public delta: [number, number]
    ) { }
}

const directions = [
    new Direction(Dir.RIGHT, [1, 0]),
    new Direction(Dir.DOWN, [0, 1]),
    new Direction(Dir.LEFT, [-1, 0]),
    new Direction(Dir.UP, [0, -1])
];

const key = (x: number, y: number) => `${x},${y}`;

const mod = (n: number, m: number) => {
    n = n % m;
    if (n < 0) {    // also consider negative numbers
        n += m;
    }
    return n;
};

const addnum = (moves: Array<Move>, numbuf: string): string => {
    if (numbuf !== '') {
        const move = new Move(MoveType.FORWARD);
        move.value = parseInt(numbuf);
        moves.push(move);
    }
    return '';
}

const readfile = async (): Promise<[Map<string, Tile>, Array<Move>, Tile]> => {
    const tiles: Map<string, Tile> = new Map();
    const moves: Array<Move> = [];
    let startTile: Tile | undefined;

    let xmax = 0;
    let ymax = 0;

    let y = 0;
    let tilesFinished = false;

    const file = await Deno.open(INPUT_FILE);
    for await (const line of readLines(file)) {
        if (line === '') {
            tilesFinished = true;
            continue;
        }
        if (!tilesFinished) {
            let x = 0;
            for (const c of line) {
                if (c !== ' ') {
                    const tile = new Tile(x, y, c === '#');
                    tiles.set(key(x, y), tile);
                    if (startTile === undefined) {
                        startTile = tile;
                    }
                }
                x++;
                xmax = Math.max(xmax, x);
            }
            y++;
            ymax = y;
        } else {
            let numbuf = '';
            for (const c of line) {
                // check for number
                if (c >= '0' && c <= '9') {
                    numbuf += c;
                } else {
                    numbuf = addnum(moves, numbuf);
                    const move = new Move(MoveType.ROTATE);
                    if (c === 'L') {
                        move.rot = Rot.LEFT
                    } else {
                        move.rot = Rot.RIGHT;
                    }
                    moves.push(move);
                }
            }
            addnum(moves, numbuf);
        }
    }

    // initialize newtile and newdir in each tile
    for (const tile of tiles.values()) {
        directions.forEach(direction => {
            const x = tile.x;
            const y = tile.y;
            const dx = direction.delta[0];
            const dy = direction.delta[1];
            let found = false;
            let x2 = x;
            let y2 = y;
            do {
                x2 = mod(x2 + dx, xmax);
                y2 = mod(y2 + dy, ymax);
                const next = tiles.get(key(x2, y2));
                if (next) {
                    found = true;
                    tile.newtile.set(direction.dir, next);
                    tile.newdir.set(direction.dir, direction.dir);
                }
            } while (!found);
        });
    }

    return [tiles, moves, startTile!];
}

const [tiles, moves, startTile] = await readfile();

// ------- Solution 1 -------

const walk = (): number => {
    let pos: Tile = startTile!;
    let dir = Dir.RIGHT;
    moves.forEach(move => {
        if (move.type === MoveType.FORWARD) {
            for (let i = 0; i < move.value!; i++) {
                const pos2 = pos.newtile.get(dir)!;
                const dir2 = pos.newdir.get(dir)!;
                if (!pos2.isWall) {
                    pos = pos2;
                    dir = dir2;
                }
            }
        } else {
            dir = mod(dir + move.rot!, 4);
        }
    });

    const row = pos.y + 1;
    const col = pos.x + 1;
    return 1000 * row + 4 * col + dir;
}

console.log(`Solution 1: ${walk()}`);

// ------- Solution 2 -------

// Fix the boundaries accourding to a cube.
// I am sure there is a better, more general way to do this, but I am too lazy to think about it.
// NOTE: This probably only works for my input.

// A
let x1 = 50;
let y1 = 0;
for (y1 = 0; y1 <= 49; y1++) {
    const tile1 = tiles.get(key(x1, y1))!;
    const x2 = 0;
    const y2 = 149 - y1;
    const tile2 = tiles.get(key(x2, y2))!;
    tile1.newtile.set(Dir.LEFT, tile2);
    tile2.newtile.set(Dir.LEFT, tile1);
    tile1.newdir.set(Dir.LEFT, Dir.RIGHT);
    tile2.newdir.set(Dir.LEFT, Dir.RIGHT);
    // console.log(`${tile1.x},${tile1.y} <-> ${tile2.x},${tile2.y}`);
}

// B
x1 = 50;
for (y1 = 50; y1 <= 99; y1++) {
    const tile1 = tiles.get(key(x1, y1))!;
    const x2 = (y1 - 50);
    const y2 = 100;
    const tile2 = tiles.get(key(x2, y2))!;
    tile1.newtile.set(Dir.LEFT, tile2);
    tile2.newtile.set(Dir.UP, tile1);
    tile1.newdir.set(Dir.LEFT, Dir.DOWN);
    tile2.newdir.set(Dir.UP, Dir.RIGHT);
    // console.log(`${tile1.x},${tile1.y} <-> ${tile2.x},${tile2.y}`);
}

// C
y1 = 0;
for (x1 = 50; x1 <= 99; x1++) {
    const tile1 = tiles.get(key(x1, y1))!;
    const x2 = 0;
    const y2 = 100 + x1;
    const tile2 = tiles.get(key(x2, y2))!;
    tile1.newtile.set(Dir.UP, tile2);
    tile2.newtile.set(Dir.LEFT, tile1);
    tile1.newdir.set(Dir.UP, Dir.RIGHT);
    tile2.newdir.set(Dir.LEFT, Dir.DOWN);
    // console.log(`${tile1.x},${tile1.y} <-> ${tile2.x},${tile2.y}`);
}

// D
y1 = 0;
for (x1 = 100; x1 <= 149; x1++) {
    const tile1 = tiles.get(key(x1, y1))!;
    const x2 = x1 - 100;
    const y2 = 199;
    const tile2 = tiles.get(key(x2, y2))!;
    tile1.newtile.set(Dir.UP, tile2);
    tile2.newtile.set(Dir.DOWN, tile1);
    tile1.newdir.set(Dir.UP, Dir.UP);
    tile2.newdir.set(Dir.DOWN, Dir.DOWN);
    // console.log(`${tile1.x},${tile1.y} <-> ${tile2.x},${tile2.y}`);
}

// E
x1 = 149;
for (y1 = 0; y1 <= 49; y1++) {
    const tile1 = tiles.get(key(x1, y1))!;
    const x2 = 99;
    const y2 = 149 - y1;
    const tile2 = tiles.get(key(x2, y2))!;
    tile1.newtile.set(Dir.RIGHT, tile2);
    tile2.newtile.set(Dir.RIGHT, tile1);
    tile1.newdir.set(Dir.RIGHT, Dir.LEFT);
    tile2.newdir.set(Dir.RIGHT, Dir.LEFT);
    // console.log(`${tile1.x},${tile1.y} <-> ${tile2.x},${tile2.y}`);
}

// F
y1 = 49;
for (x1 = 100; x1 <= 149; x1++) {
    const tile1 = tiles.get(key(x1, y1))!;
    const x2 = 99;
    const y2 = (x1 - 100) + 50;
    const tile2 = tiles.get(key(x2, y2))!;
    tile1.newtile.set(Dir.DOWN, tile2);
    tile2.newtile.set(Dir.RIGHT, tile1);
    tile1.newdir.set(Dir.DOWN, Dir.LEFT);
    tile2.newdir.set(Dir.RIGHT, Dir.UP);
    // console.log(`${tile1.x},${tile1.y} <-> ${tile2.x},${tile2.y}`);
}

// G
y1 = 149;
for (x1 = 50; x1 <= 99; x1++) {
    const tile1 = tiles.get(key(x1, y1))!;
    const x2 = 49;
    const y2 = (x1 - 50) + 150;
    const tile2 = tiles.get(key(x2, y2))!;
    tile1.newtile.set(Dir.DOWN, tile2);
    tile2.newtile.set(Dir.RIGHT, tile1);
    tile1.newdir.set(Dir.DOWN, Dir.LEFT);
    tile2.newdir.set(Dir.RIGHT, Dir.UP);
    // console.log(`${tile1.x},${tile1.y} <-> ${tile2.x},${tile2.y}`);
}

console.log(`Solution 2: ${walk()}`);
