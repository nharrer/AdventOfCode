import { DijkstraShortestPathSolver } from "https://deno.land/x/dijkstras_algorithm@1.0.6/dijkstra.ts";
import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

const STEPS = 26;

class Valve {
    constructor(
        public id: number,
        public name: string,
        public rate: number
    ) {
    }
    public exitsStr: Array<string> = [];
    public exits: Array<Valve> = [];
    public toString(): string {
        return `${this.name}`;
    }
}

class Action {
    constructor(
        public type: 'Walk' | 'Open' | 'Wait',
        public valve: Valve
    ) {
    }
    public toString(): string {
        if (this.type === 'Walk') {
            return `Goto ${this.valve.name}`;
        } else if (this.type === 'Open') {
            return `Open ${this.valve.name}`;
        } else {
            return `Wait`;
        }
    }
}

class Player {
    constructor(
        public location: Valve,
        public action: Action
    ) {
    }
    public toString(): string {
        return `[At ${this.location.name}, ${this.action}]`;
    }
}

class State {
    constructor(
        public player: [Player, Player]
    ) {
    }
    public valvesOpened: Set<string> = new Set();
    public step = 0;        // states at the beginning of this state
    public flowPerStep = 0; // flow grows during this step
    public totalflow = 0;   // total flow at the beginning of this state

    public printValveStates(): string {
        return Array.from(this.valvesOpened.values()).reduce((s, e) => s + (s.length === 0 ? '' : ',')+ `${e}`, '');
    }

    public toString(): string {
        return `Step ${this.step}, P1: ${this.player[0]}, P2: ${this.player[1]}, Total-Flow ${this.totalflow}, Rate: ${this.flowPerStep}, Valves open: ${this.printValveStates()}`;
    }

    public clone(which: 0 | 1, location: Valve, action: Action, openValve: Valve | null = null): State {
        const nextplayer: [Player, Player] = [... this.player];
        nextplayer[which] = new Player(location, action);
        const state2 = new State(nextplayer);
        state2.step = this.step;
        state2.totalflow = this.totalflow;
        state2.flowPerStep = this.flowPerStep;
        if (openValve) {
            state2.flowPerStep += openValve.rate;
            state2.valvesOpened.add(openValve.name);
        }
        for (const vname of this.valvesOpened.values()) {
            state2.valvesOpened.add(vname);
        }
        return state2;
    }

    public doStep(): Array<State> {
        this.step++;
        this.totalflow += this.flowPerStep;

        if (this.step > STEPS) {
            return [];
        }
        if (this.valvesOpened.size === valves.size) {
            const state2 = this
                .clone(0, this.player[0].location, new Action('Wait', this.player[0].location))
                .clone(1, this.player[1].location, new Action('Wait', this.player[1].location));
            return [state2];
        }

        // build combination of all moves for both players
        const nextstates: Array<State> = [];
        const nextstates1 = this.doStepPlayer(0);
        for (const nextstate1 of nextstates1) {
            nextstates.push(...nextstate1.doStepPlayer(1));
        }

        return nextstates;
    }

    public chooseBestExit(at: Valve): Array<Valve> {
        const valvesToOpen = valvesSorted.filter(v => v !== at && !this.valvesOpened.has(v.name));
        if (valvesToOpen.length > 0) {
            const id = solver.calculateFor(at.id).shortestPathTo(valvesToOpen[0].id)[1];
            return at.exits.sort(v => v.id == id ? -1 : 1);
        }
        return at.exits;
    }

    public doStepPlayer(which: 0 | 1): Array<State> {
        const player = this.player[which];
        const nextstates: Array<State> = [];
        if (player.action.type === 'Wait') {
            const nextstate = this.clone(which, player.location, new Action('Wait', player.location));
            nextstates.push(nextstate);
        } else if (player.action.type === 'Open') {
            this.chooseBestExit(player.location).forEach(v => {
                const nextstate = this.clone(which, player.location, new Action('Walk', v), player.action.valve);
                nextstates.push(nextstate);
            });
        } else { // Walk
            if (!this.valvesOpened.has(player.action.valve.name)) {
                const other = (which + 1) % 2;
                if (this.player[other].action.type != 'Open' || this.player[other].action.valve != player.action.valve) {
                    const nextstate = this.clone(which, player.action.valve, new Action('Open', player.action.valve));
                    nextstates.push(nextstate);
                }
            }
            this.chooseBestExit(player.action.valve).forEach(v => {
                const nextstate = this.clone(which, player.action.valve, new Action('Walk', v));
                nextstates.push(nextstate);
            });
        }
        return nextstates;
    }

    public maxFlowRemaining(): number {
        let flowPerStep = this.flowPerStep;
        let stepsLeft = STEPS - this.step + 1
        const notOpened = valvesSorted.filter(v => !this.valvesOpened.has(v.name));
        let toggle = true;
        let flow = 0;
        while (stepsLeft > 0) {
            flow += flowPerStep;
            if (toggle) {   // valves can only be opened every 2nd step
                // we open two valves (one for each player)
                for (let i = 0; i < 2; i++) {
                    const newvalve = notOpened.shift();
                    flowPerStep += (newvalve?.rate ?? 0);
                }
            }
            toggle = !toggle;
            stepsLeft--;
        }
        return flow;
    }
}

const valves: Map<string, Valve> = new Map();

const re = new RegExp('^Valve (.+) has flow rate=(.+); tunnels? leads? to valves? (.+)$');

const file = await Deno.open(INPUT_FILE);
let id = 0;
for await (const line of readLines(file)) {
    const match = line.match(re);
    if (match) {
        const valve = new Valve(id++, match[1], +match[2]);
        valve.exitsStr.push(...match[3].split(', '));
        valves.set(valve.name, valve);
    }
}
valves.forEach(v => {
    v.exits = v.exitsStr.map(v => <Valve>valves.get(v)).sort((a, b) => b.rate - a.rate);
})
const valvesSorted = Array.from(valves.values()).sort((a, b) => b.rate - a.rate);

const solver = DijkstraShortestPathSolver.init(valves.size);
valves.forEach(v1 => {
    v1.exits.forEach(v2 => {
        solver.addEdge(v1.id, v2.id, 1);
    });
})

let maxSol = Number.MIN_SAFE_INTEGER;
let maxPath: Array<State> = [];
let searched = 0;

const search = (currentState: State, path: Array<State>): void => {
    searched++;

    // console.log(currentState.toString(), currentState);

    const res = currentState.maxFlowRemaining();
    if ((currentState.totalflow + res) < maxSol) {
        return;
    }
    const nextstates = currentState.doStep();
    if (nextstates.length === 0) {
        if (currentState.totalflow > maxSol) {
            maxSol = currentState.totalflow;
            maxPath = path;
        }
    }
    nextstates.forEach(s => {
        const p2 = [...path];
        p2.push(currentState);
        search(s, p2);
    });
}

const start = <Valve>valves.get('AA');
const state1 = new State([
    new Player(start, new Action('Walk', start)),
    new Player(start, new Action('Walk', start))
]);
for (const v of valves.values()) {
    if (v.rate === 0) {
        // valves with rate == 0 are considered open right from the get go
        state1.valvesOpened.add(v.name);
    }
}

const starttime = new Date().getTime();

search(state1, []);

console.log(`Part one: ${maxSol}`);
// maxPath.forEach(s => console.log(s.toString(), s));
console.log(maxPath);
console.log(searched);
// 281140
// 326816
// real: 158.545.703, 389.857 = 6.5 Min

// Part 2:
// 3814985 / 9.871s -- Exits just as they are
// 1142463 / 2.209s -- Exit with path shortest path to highest not opended valve first
// 1188980 / 2.347s -- Exit with path shortest path to highest not opended valve first
const elapsed = new Date().getTime() - starttime;
console.log(elapsed / 1000);


// console.log(`Part two: ${solution2}`);
