const INPUT_FILE = 'input.txt';

class Coords {
    key: string;

    constructor(public x: number, public y: number, public z: number) {
        this.key = `${x},${y},${z}`;
    }

    allRotations(): Coords[] {
        const { x, y, z } = this;
        return [
            new Coords(x, y, z), new Coords(x, -z, y), new Coords(x, -y, -z), new Coords(x, z, -y),
            new Coords(-x, y, -z), new Coords(-x, -z, -y), new Coords(-x, -y, z), new Coords(-x, z, y),
            new Coords(y, z, x), new Coords(y, -x, z), new Coords(y, -z, -x), new Coords(y, x, -z),
            new Coords(-y, z, -x), new Coords(-y, -x, -z), new Coords(-y, -z, x), new Coords(-y, x, z),
            new Coords(z, x, y), new Coords(z, -y, x), new Coords(z, -x, -y), new Coords(z, y, -x),
            new Coords(-z, x, -y), new Coords(-z, -y, -x), new Coords(-z, -x, y), new Coords(-z, y, x),
        ];
    }

    manhattan(b: Coords): number {
        return Math.abs(this.x - b.x) + Math.abs(this.y - b.y) + Math.abs(this.z - b.z);
    }

    toString(): string {
        return this.key;
    }
}

class Scanner {
    beacons: Coords[] = [];
    translated: Coords = new Coords(0, 0, 0);
    private _keySet: Set<string> | null = null;

    constructor(public name: string) {}

    keys(): Set<string> {
        if (!this._keySet) {
            this._keySet = new Set(this.beacons.map(b => b.key));
        }
        return this._keySet;
    }

    allRotations(): Scanner[] {
        const scanners = Array.from({ length: 24 }, () => new Scanner(this.name));
        for (const b of this.beacons) {
            b.allRotations().forEach((r, i) => scanners[i].beacons.push(r));
        }
        return scanners;
    }

    matcheTranslateWithRotations(other: Scanner): Scanner | null {
        for (const rotated of other.allRotations()) {
            const translated = this.matcheTranslate(rotated);
            if (translated) {
                return translated;
            }
        }
        return null;
    }

    matcheTranslate(other: Scanner): Scanner | null {
        const locatSet = this.keys();
        for (const a of this.beacons) {
            for (const b of other.beacons) {
                const [dx, dy, dz] = [a.x - b.x, a.y - b.y, a.z - b.z];
                let count = 0;
                for (let oi = 0; oi < other.beacons.length; oi++) {
                    const ob = other.beacons[oi];
                    if (locatSet.has(`${ob.x + dx},${ob.y + dy},${ob.z + dz}`)) {
                        count++;
                    }
                    if (count + (other.beacons.length - oi - 1) < 12) {
                        break; // early exit if not enough left to reach 12
                    }
                }
                if (count >= 12) {
                    other.beacons = other.beacons.map(ob => new Coords(ob.x + dx, ob.y + dy, ob.z + dz));
                    other.translated = new Coords(dx, dy, dz);
                    return other;
                }
            }
        }
        return null;
    }

    toString(): string {
        return `Scanner ${this.name}\n  Translated: (${this.translated})\n` + this.beacons.map(b => `  ${b}`).join('\n');
    }
}

const scanners = (await Deno.readTextFile(INPUT_FILE)).split('\n\n').map((section, i) => {
    const scanner = new Scanner(`${i}`);
    section.trim().split('\n').slice(1).forEach(line => {
        const [x, y, z] = line.split(',').map(Number);
        scanner.beacons.push(new Coords(x, y, z));
    });
    return scanner;
});

const done: Scanner[] = [scanners[0]];
const todo = new Set(scanners.slice(1));
while (todo.size > 0) {
    for (const d of done) {
        for (const t of [...todo]) {
            const merged = d.matcheTranslateWithRotations(t);
            if (merged) {
                console.log(`Matched Scanner ${d.name} with Scanner ${t.name}`);
                done.push(merged);
                todo.delete(t);
            }
        }
    }
}

const part1 = new Set(done.flatMap(d => d.beacons.map(b => b.toString()))).size;
let part2 = 0;
for (let i = 0; i < done.length; i++) {
    for (let j = i + 1; j < done.length; j++) {
        part2 = Math.max(part2, done[i].translated.manhattan(done[j].translated));
    }
}

console.log(`Part one: ${part1}`);
console.log(`Part two: ${part2}`);
