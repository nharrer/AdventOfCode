import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

const parts = (await readLines(await Deno.open(INPUT_FILE)).next()).value.split(/[ ,]+/);
const [x0, x1] = parts[2].split('=')[1].split('..').map(Number);
const [y0, y1] = parts[3].split('=')[1].split('..').map(Number);

let ymaxAsll = 0;
let found = 0;
for (let vx = 1; vx <= x1; vx++) {
    for (let vy = y0; vy <= -y0; vy++) {
        let x = 0, y = 0, vxc = vx, vyc = vy, ymax = 0;
        while (x <= x1 && y >= y0) {
            x += vxc;
            y += vyc;
            ymax = Math.max(ymax, y);
            vxc = Math.max(0, vxc - 1);
            vyc--;
            if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {
                found++;
                ymaxAll = Math.max(ymaxAll, ymax);
                break;
            }
        }
    }
}

console.log(`Part one: ${ymaxAll}`);
console.log(`Part two: ${found}`);
