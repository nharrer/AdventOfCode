import { bufio } from "https://deno.land/x/aoc@0.0.1-alpha.11/deps.ts";

const m: number[][] = [];
const file = await Deno.open('input.txt');
for await (const line of bufio.readLines(file)) {
    const row = line.split('').map(x => +x);
    m.push(row);
}

const size = m[0].length;
const marked = m.map(row => row.map(_ => 0));   // zero matrix
const scene = m.map(row => row.map(_ => 0));    // zero matrix

for (let i = 0; i < size; i++) {
    const row = m[i];
    const col = m.map(row => row[i]);
    let maxl = -1, maxr = -1, maxu = -1, maxd = -1;
    for (let j = 0; j < size; j++) {
        const p1 = j;
        const p2 = size - j - 1;
        if (row[p1] > maxl) {
            maxl = row[p1];
            marked[p1][i] = 1;
        }
        if (row[p2] > maxr) {
            maxr = row[p2];
            marked[p2][i] = 1;
        }
        if (col[p1] > maxu) {
            maxu = col[p1];
            marked[i][p1] = 1;
        }
        if (col[p2] > maxd) {
            maxd = col[p2];
            marked[i][p2] = 1;
        }

        const x = i, y = j;
        const v = m[y][x];
        let l = 0, r = 0, u = 0, d = 0;

        for (let k = x - 1; k >= 0; k--) {
            l++;
            if (m[y][k] >= v) {
                break;
            }
        }
        for (let k = x + 1; k < size; k++) {
            r++;
            if (m[y][k] >= v) {
                break;
            }
        }
        for (let k = y - 1; k >= 0; k--) {
            u++;
            if (m[k][x] >= v) {
                break;
            }
        }
        for (let k = y + 1; k < size; k++) {
            d++;
            if (m[k][x] >= v) {
                break;
            }
        }
        scene[y][x] = l * r * u * d;
    }
}

const solution1 = marked.flat().reduce((sum, n) => sum + n, 0);             // sum of matrix marked
const solution2 = scene.flat().reduce((max, n) => Math.max(max, n), 0);     // max of matrix scene

console.log(`Part one: ${solution1}`);
console.log(`Part two: ${solution2}`);
