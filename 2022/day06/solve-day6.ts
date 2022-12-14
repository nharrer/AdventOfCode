import { readLines } from "../../import.ts";

function detectPrefix(line: string, len: number) {
    const window = [];
    let i = 0;
    for (const c of line) {
        if (window.length === len) {
            const set = new Set(window);
            if (set.size === len) {
                return i;
            }
            window.shift();
        }
        window.push(c);
        i++;
    }
    return -1;
}

const file = await Deno.open('input.txt');
for await (const line of readLines(file)) {
    console.log(`Part 1: ${detectPrefix(line, 4)}`);
    console.log(`Part 2: ${detectPrefix(line, 14)}`);
}
