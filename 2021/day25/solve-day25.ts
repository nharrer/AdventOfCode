const INPUT_FILE = 'input.txt';

const field: string[][] = (await Deno.readTextFile(INPUT_FILE))
    .trim()
    .split('\n')
    .map((line) => line.split(''));

const width = field[0].length;
const height = field.length;

function step(field: string[][], left: boolean): boolean {
    const moves: [number, number, number, number][] = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = field[y][x];
            if (left && cell === '>') {
                const nextX = (x + 1) % width;
                if (field[y][nextX] === '.') {
                    moves.push([x, y, nextX, y]);
                }
            } else if (!left && cell === 'v') {
                const nextY = (y + 1) % height;
                if (field[nextY][x] === '.') {
                    moves.push([x, y, x, nextY]);
                }
            }
        }
    }
    for (const [fromX, fromY, toX, toY] of moves) {
        field[toY][toX] = field[fromY][fromX];
        field[fromY][fromX] = '.';
    }
    return moves.length > 0;
}

function printField(field: string[][], step?: number) {
    if (step !== undefined) {
        console.log(`After step ${step}:`);
    }
    console.log(field.map((line) => line.join('')).join('\n'));
    console.log('');
}

const t0 = performance.now();

// printField(field);
let stepCount = 0;
while (true) {
    const movedRight = step(field, true);
    const movedDown = step(field, false);
    stepCount++;
    // printField(field, stepCount);
    if (!movedRight && !movedDown) {
        console.log('No moves left, stopping.');
        break;
    }
}

console.log(`Part one: ${stepCount}`);
console.log(`Part two: ${0}`);
console.log(`Time elapsed: ${Math.round(performance.now() - t0)} ms`);
