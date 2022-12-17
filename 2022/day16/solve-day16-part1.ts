import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

class Valve {
    constructor(
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

const valves: Map<string, Valve> = new Map();
const valvesSorted: Array<Valve> = [];

const printValveStates = (valvestates: Set<string>): string => {
    return Array.from(valvestates.values()).reduce((s, e) => s + ',' + `${e}`, '');
}

const residue = (valvesOpened: Set<string>, flowPerStep: number, stepsLeft: number): number => {
    let flow = 0;
    const notOpened = valvesSorted.filter(v => !valvesOpened.has(v.name));
    let toggle = true;
    while (stepsLeft > 0) {
        flow += flowPerStep;
        if (toggle) {   // valves can only be opened every 2nd step
            const newvalve = notOpened.shift();
            if (newvalve) {
                flowPerStep += newvalve.rate;
            }
        }
        toggle = !toggle;
        stepsLeft--;
    }
    return flow;
}

class Action {
    constructor(
        public type: 'Walk' | 'Open' | 'Wait',
        public valve: Valve
    ) {
    }
    public toString(): string {
        return `${this.type}: ${this.valve.name}`
    }
}

class State {
    constructor(
        public location: Valve,
        public action: Action
    ) {
    }
    public valvesOpened: Set<string> = new Set();
    public step = 0;        // states at the beginning of this state
    public flowPerStep = 0; // flow grows during this step
    public totalflow = 0;   // total flow at the beginning of this state

    public toString(): string {
        return 'Valves: ' + printValveStates(this.valvesOpened);
    }

    public clone(location: Valve, action: Action): State {
        const state2 = new State(location, action);
        state2.step = this.step + 1;
        state2.totalflow = this.totalflow + this.flowPerStep;
        state2.flowPerStep = this.flowPerStep;
        for (const vname of this.valvesOpened.values()) {
            state2.valvesOpened.add(vname);
        }
        return state2;
    }

    public doStep(): Array<State> {
        if (this.step > 30) {
            return [];
        }
        if (this.valvesOpened.size === valves.size) {
            const state2 = this.clone(this.location, new Action('Wait', this.location));
            return [state2];
        }

        const nextstates: Array<State> = [];
        if (this.action.type === 'Wait') {
            const state2 = this.clone(this.location, new Action('Wait', this.location));
            nextstates.push(state2);
        } else if (this.action.type === 'Open') {
            this.location.exits.forEach(v => {
                const state2 = this.clone(this.location, new Action('Walk', v));
                state2.flowPerStep += this.action.valve.rate;
                state2.valvesOpened.add(this.action.valve.name);
                nextstates.push(state2);
            });
        } else { // Walk
            if (!this.valvesOpened.has(this.action.valve.name)) {
                const state2 = this.clone(this.action.valve, new Action('Open', this.action.valve));
                nextstates.push(state2);
            }
            this.action.valve.exits.forEach(v => {
                const state2 = this.clone(this.action.valve, new Action('Walk', v));
                nextstates.push(state2);
            });
        }
        return nextstates;
    }
}

const re = new RegExp('^Valve (.+) has flow rate=(.+); tunnels? leads? to valves? (.+)$');

const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    const match = line.match(re);
    if (match) {
        const valve = new Valve(match[1], +match[2]);
        valve.exitsStr.push(...match[3].split(', '));
        valves.set(valve.name, valve);
    }
}
valves.forEach(v => {
    v.exits = v.exitsStr.map(v => <Valve>valves.get(v)).sort((a, b) => b.rate - a.rate);
})
valvesSorted.push(...Array.from(valves.values()).sort((a, b) => b.rate - a.rate));

let maxSol = Number.MIN_SAFE_INTEGER;
let maxPath: Array<State> = [];
let searched = 0;

const search = (currentState: State, path: Array<State>): void => {
    searched++;

    const res = residue(currentState.valvesOpened, currentState.flowPerStep, 31 - currentState.step);
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
const state1 = new State(start, new Action('Walk', start));
for (const v of valves.values()) {
    if (v.rate === 0) {
        state1.valvesOpened.add(v.name);
    }
}

const starttime = new Date().getTime();

search(state1, []);

console.log(`Part one: ${maxSol}`);
console.log(maxPath);
console.log(searched);
// 281140
// 326816
// real: 158.545.703, 389.857 = 6.5 Min

const elapsed = new Date().getTime() - starttime;
console.log(elapsed / 1000);


// console.log(`Part two: ${solution2}`);
