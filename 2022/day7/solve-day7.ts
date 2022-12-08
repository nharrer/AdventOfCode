import { bufio } from "https://deno.land/x/aoc@0.0.1-alpha.11/deps.ts";

const SIZE_OF_INTEREST = 100000;
const DISKSIZE = 70000000;
const NEEDED = 30000000;

let currentDir = [''];
const dirSize: Map<string, number> = new Map();

const file = await Deno.open('input.txt');
for await (const line of bufio.readLines(file)) {
    if (line.startsWith('$ ls')) {
        continue;
    } else if (line.startsWith('$ cd')) {
        const dir = line.substring(5);
        if (dir === '/') {
            currentDir = [''];
        } else if (dir === '..') {
            currentDir.pop();
        } else {
            currentDir.push(dir);
        }
    } else if (!line.startsWith('dir ')) {
        const [part1] = line.split(' ');
        const size = +part1;
        const cdir = [...currentDir];
        while (cdir.length > 0) {
            const dir = (cdir.length === 1 ? '/' : '') + cdir.join('/');
            let dirsize = dirSize.get(dir);
            dirsize = (dirsize || 0) + size;
            dirSize.set(dir, dirsize);
            cdir.pop();
        }
    }
}

const sum1 = Array.from(dirSize.entries()).reduce((sum, [dir, size]) => sum + (size <= SIZE_OF_INTEREST && dir !== '' ? size : 0), 0);
console.log(`Part one: ${sum1}`);

const spaceUsed = dirSize.get('/') || 0;
const spaceUnused = DISKSIZE - spaceUsed;
const toBeDeleted = NEEDED - spaceUnused;
const deleteDir = Array.from(dirSize.values()).filter(x => x >= toBeDeleted).sort((a, b) => a - b)[0];
console.log(`Part two: ${deleteDir}`);
