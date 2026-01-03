import { PriorityQueue } from "../../import.ts";

const INPUT_FILE = 'input.txt';

type StateCost = { state: string[]; cost: number };

class Field {
    public room_size: number;
    public locations: string[];

    private static readonly HALLWAY_SIZE = 11;
    private static readonly COST_PER_TYPE: Record<string, number> = { A: 1, B: 10, C: 100, D: 1000 };

    constructor(lines: string[], public goal: string) {
        this.room_size = lines.length;
        this.locations = '.'.repeat(Field.HALLWAY_SIZE + 4 * this.room_size).split('');
        for (let place = 0; place < lines.length; place++) {
            lines[place].replace(/[ #]/g, '').split('').forEach((c, room) => {
                this.locations[Field.HALLWAY_SIZE + room * this.room_size + place] = c;
            });
        }
    }

    public print() {
        console.log('#############');
        console.log(`#${this.locations.slice(0, Field.HALLWAY_SIZE).join('')}#`);
        for (let place = 0; place < this.room_size; place++) {
            const slots = [0, 1, 2, 3].map(room => this.locations[Field.HALLWAY_SIZE + room * this.room_size + place]).join('#');
            console.log((place === 0) ? `###${slots}###` : `  #${slots}#`);
        }
        console.log('  #########');
    }

    public search(): number | null {
        const visited = new Map<string, number>();
        const queue = new PriorityQueue<StateCost>({ gt: (a, b) => a.cost < b.cost });
        queue.push({ state: this.locations, cost: 0 });

        while (queue.length > 0) {
            const current = queue.pop()!; // gets the node with the lowest cost (Dijkstra)
            const key = current.state.join('');
            if (!visited.has(key) || visited.get(key)! > current.cost) {
                visited.set(key, current.cost);

                if (key === this.goal) {
                    return current.cost; // yieppee, found it
                }

                for (const { state: nextstring, cost: moveCost } of this.moves(current.state)) {
                    queue.push({ state: nextstring, cost: current.cost + moveCost });
                }
            }
        }
        return null;
    }

    private moves(state: string[]): Array<StateCost> {
        return state.flatMap((c, i) => c !== '.' ? this.movesForFigure(state, c, i) : []);
    }

    private movesForFigure(state: string[], type: string, index: number): Array<StateCost> {
        const results: Array<StateCost> = [];
        const [room, place] = this.determineRoomAndPlace(index) ?? [null, null];
        if (room === null) {
            // we are in the hallway, try move to a room
            this.tryMoveToRoom(state, type, index, -1, -1, results);
        } else {
            // we are in a room, check if we can move at all
            for (let i = 0; i < place; i++) {
                if (state[index - place + i] !== '.') {
                    return results; // no moves possible, blocked
                }
            }

            // check if we already in the correct room
            const targetRoom = type.charCodeAt(0) - 'A'.charCodeAt(0);
            if (room === targetRoom) {
                let allCorrect = true;
                for (let i = 0; i < this.room_size - place - 1; i++) {
                    if (state[index + i + 1] !== type) {
                        allCorrect = false;
                        break;
                    }
                }
                if (allCorrect) {
                    return results; // we are in the right place and are not blocking others -> done
                }
            }

            // move straight to destination room if possible
            if (this.tryMoveToRoom(state, type, index, room, place, results)) {
                return results;
            }

            // otherwise move to all possible hallway positions
            const fromHallwayIndex = 2 + room * 2;
            for (let toHallwayIndex = 0; toHallwayIndex < Field.HALLWAY_SIZE; toHallwayIndex++) {
                if (![2, 4, 6, 8].includes(toHallwayIndex) && state[toHallwayIndex] === '.') {
                    if (this.isPathClear(state, fromHallwayIndex, toHallwayIndex)) {
                        const newState = state.slice();
                        newState[index] = '.';
                        newState[toHallwayIndex] = type;
                        const dist = Math.abs(toHallwayIndex - fromHallwayIndex) + place + 1;
                        results.push({ state: newState, cost: Field.COST_PER_TYPE[type] * dist });
                    }
                }
            }
        }
        return results;
    }

    private tryMoveToRoom(state: string[], type: string, fromIndex: number, room: number, place: number, results: Array<StateCost>): boolean {
        const targetRoom = type.charCodeAt(0) - 'A'.charCodeAt(0);
        let targetIndex: number = -1;
        for (let p = this.room_size - 1; p >= 0; p--) {
            const idx = Field.HALLWAY_SIZE + targetRoom * this.room_size + p;
            if (state[idx] === '.') {
                targetIndex = idx;
                break;
            } else if (state[idx] !== type) {
                return false; // can't enter, still another type inside
            }
        }
        if (targetIndex === -1) {
            return false; // no space in target room
        }
        const toHallwayIndex = 2 + targetRoom * 2;
        const [fromHallwayIndex, stepsToHallway] = room === -1 ? [fromIndex, 0] : [2 + room * 2, place + 1];
        if (!this.isPathClear(state, fromHallwayIndex, toHallwayIndex)) {
            return false; // path blocked
        }
        const newState = state.slice(); // move to target room
        newState[fromIndex] = '.';
        newState[targetIndex] = type;
        const stepsToRoom = (targetIndex - Field.HALLWAY_SIZE) % this.room_size + 1;
        const dist = Math.abs(toHallwayIndex - fromHallwayIndex) + stepsToHallway + stepsToRoom;
        results.push({ state: newState, cost: Field.COST_PER_TYPE[type] * dist });
        return true;
    }

    private isPathClear(state: string[], from: number, to: number): boolean {
        const step = to > from ? 1 : -1;
        for (let i = from + step; i !== to; i += step) {
            if (state[i] !== '.') {
                return false;
            }
        }
        return true;
    }

    private determineRoomAndPlace(idx: number): [number, number] | [null, null] {
        if (idx >= Field.HALLWAY_SIZE) {
            const room = Math.floor((idx - Field.HALLWAY_SIZE) / this.room_size);
            const place = (idx - Field.HALLWAY_SIZE) % this.room_size;
            return [room, place];
        }
        return [null, null];
    }
}

const lines = (await Deno.readTextFile(INPUT_FILE)).trim().split('\n');
const field1 = new Field([lines[2], lines[3]], '...........AABBCCDD');
const field2 = new Field([lines[2], '  #D#C#B#A#', '  #D#B#A#C#', lines[3]], '...........AAAABBBBCCCCDDDD');

const t0 = performance.now();
console.log(`Part one: ${field1.search()}`);
console.log(`Part two: ${field2.search()}`);
console.log(`Time elapsed: ${Math.round(performance.now() - t0)} ms`);
