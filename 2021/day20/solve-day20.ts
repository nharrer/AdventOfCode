const INPUT_FILE = 'input.txt';

class Grid {
    cells: string[][] = [];
    algorithm = '';
    width = 0;
    height = 0
    step = 0;

    count = (): number => this.cells.flat().filter(ch => ch === '#').length;

    outside = (): string => this.step % 2 === 0 ? '.' : this.algorithm[0];

    enlarge(): void {
        const outside = this.outside(), emptyRow = Array(this.width + 2).fill(outside);
        this.cells = [[...emptyRow], ...this.cells.map(row => [outside, ...row, outside]), [...emptyRow]];
        this.width += 2; this.height += 2;
    }

    enhance(): void {
        this.enlarge();
        const outside = this.outside();
        const output = this.cells.map(row => [...row]);
        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c < this.width; c++) {
                const neighbors = [-1, 0, 1].flatMap(dr => [-1, 0, 1].map(dc => {
                    const nr = r + dr, nc = c + dc;
                    return nr < 0 || nr >= this.height || nc < 0 || nc >= this.width ? outside : this.cells[nr][nc];
                }));
                output[r][c] = this.algorithm[parseInt(neighbors.map(ch => ch === '#' ? '1' : '0').join(''), 2)];
            }
        }
        this.cells = output;
        this.step++;
    }
}

const [code, , ...cellLines] = (await Deno.readTextFile(INPUT_FILE)).split('\n');
const grid = new Grid();
grid.algorithm = code;
grid.cells = cellLines.map(line => line.split(''));
[grid.width, grid.height] = [grid.cells[0].length, grid.cells.length];

for (let i = 0; i < 50; i++) {
    grid.enhance();
    if (i === 1) {
        console.log(`Part one: ${grid.count()}`);
    }
}
console.log(`Part two: ${grid.count()}`);
