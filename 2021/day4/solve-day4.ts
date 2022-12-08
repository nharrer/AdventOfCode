import { bufio } from "https://deno.land/x/aoc@0.0.1-alpha.11/deps.ts";

const INPUT_FILE = 'input.txt';

class Board {
    private fields: Array<Array<[number, boolean]>> = [];
    public ignore = false;

    public addRow(row: Array<number>): void {
        this.fields.push(row.map(x => [x, false]));
    }

    public mark(number: number): void {
        this.fields.flat(1).forEach(field => {
            if (field[0] === number) {
                field[1] = true;
            }
        })
    }

    public isBingo(): boolean {
        for (let i = 0; i < this.fields[0].length; i++) {
            if (this.fields[i].filter(p => p[1] === false).length === 0) {
                return true; // row i is bingo
            }
            const column = this.fields.map(row => row[i]);
            if (column.filter(p => p[1] === false).length === 0) {
                return true; // column i is bingo
            }
        }
        return false;
    }

    public sumUnmarked(): number {
        return this.fields.flat(1).reduce((sum, field) => sum + (!field[1] ? field[0] : 0), 0);
    }
}

const draws: Array<number> = [];
const boards: Array<Board> = [];
let currentBoard: Board | null = null;

const file = await Deno.open(INPUT_FILE);
for await (const line of bufio.readLines(file)) {
    if (line.includes(',')) {
        draws.push(... line.split(',').map(x => +x));
    } else if (line.trim() === '') {
        currentBoard = null;
    } else {
        if (currentBoard === null) {
            currentBoard = new Board();
            boards.push(currentBoard);
        }
        currentBoard.addRow(line.split(' ').filter(x => x !== '').map(x => +x));
    }
}

let solution1 = -1;
let solution2 = -1;
for (const draw of draws) {
    for (const board of boards) {
        if (!board.ignore) {
            board.mark(draw);
            if (board.isBingo()) {
                if (solution1 === -1) {
                    solution1 = draw * board.sumUnmarked();
                }
                solution2 = draw * board.sumUnmarked();
                board.ignore = true;
            }
        }
    }
}

console.log(`Part one: ${solution1}`);
console.log(`Part two: ${solution2}`);
