import { readLines } from "../../import.ts";

const INPUT_FILE = 'input0.txt';
const STEPS = 24;
const RESCOUNT = 4;

enum Resource {
    ORE = 0,
    CLAY = 1,
    OBSIDIAN = 2,
    GEODE = 3
}

class Robot {
    constructor(
        public generates: Resource,
        public cost = [0, 0, 0, 0]
    ) {
    }
}

class Blueprint {
    public robots = [
        new Robot(Resource.ORE),
        new Robot(Resource.CLAY),
        new Robot(Resource.OBSIDIAN),
        new Robot(Resource.GEODE)
    ]
    public mostresources = [0, 0, 0];
    constructor(
        public id: number
    ) {
    }
    public init(): void {
        for (let i = 0; i < this.robots.length; i++) {
            const robot = this.robots[i];
            for (let j = 0; j < Resource.GEODE; j++) {
                this.mostresources[j] = Math.max(this.mostresources[j], robot.cost[j]);
            }
        }
    }
}

class State {
    public stepsleft = STEPS;
    public robots = [
        1, 0, 0, 0
    ];
    public resources = [
        0, 0, 0, 0
    ];

    public buildrobot = -1;   // not part of the state
    public dontBuild = [    // not part of the state
        0, 0, 0, 0
    ];

    public toString(): string {
        return `Minute: ${STEPS - this.stepsleft} (${this.stepsleft}), Robots: ${this.robots}, Resources: ${this.resources}, Built: ${this.buildrobot}`;
    }

    public id(): string {
        return this.robots.join(';') + '|' + this.resources.join(';') + '|' + this.stepsleft;
    }

    public clone(): State {
        const state2 = new State();
        state2.robots = Object.assign([], this.robots);
        state2.resources = Object.assign([], this.resources);
        state2.stepsleft = this.stepsleft;
        return state2;
    }

    public work(): void {
        this.stepsleft -= 1;
        for (let i = 0; i < RESCOUNT; i++) {
            // robots collect resources
            this.resources[i] += this.robots[i];
        }
        if (this.buildrobot >= 0) {
            // building a robot decreases the resources
            const cost = blueprint.robots[this.buildrobot].cost;
            for (let i = 0; i < RESCOUNT; i++) {
                this.resources[i] -= cost[i];
            }
            // and add the new robot
            this.robots[this.buildrobot]++;
        }
    }

    public canBuildRobot(robot: number): boolean {
        const cost = blueprint.robots[robot].cost;
        for (let ires = 0; ires < RESCOUNT; ires++) {
            if (this.resources[ires] < cost[ires]) {
                // We don't have enough resources to build the robot.
                return false;
            }
        }

        // if (robot !== Resource.GEODE) {
        //     // At most this much of the resource can be used up in the remaining steps.
        //     const canbeused = blueprint.mostresources[robot] * this.stepsleft;
        //     // If we already have that much, it doesn't make sense to build a roboter of that kind.
        //     const have = this.resources[robot];
        //     if (have >= canbeused) {
        //         return false;
        //     }
        // }

        // // If the current step is to do nothing, but we could have built the robot
        // // already, then it doesn't make sense to do so now.
        // if (this.buildrobot === -1 && this.dontBuild[robot] > 0) {
        //     return false;
        // }

        return true;
    }

    public next(): Array<State> {
        let states: Array<State> = [];

        // One possible next state is always to build nothing.
        const stateDoNothing = this.clone();

        for (let irob = 0; irob < RESCOUNT; irob++) {
            if (this.canBuildRobot(irob)) {
                const state2 = this.clone();
                state2.buildrobot = irob;
                states.push(state2);

                // Remember in the build-nothing-state what could have been built.
                stateDoNothing.dontBuild[irob] = 1;
            }
        }

        // It improves performance a lot when we add the build-nothing-step to the end.
        states.push(stateDoNothing);

        // // If we can build a geode robot, do so as soon as possible and ignore everything else.
        // const filterGeode = states.filter(s => s.buildrobot === Resource.GEODE);
        // if (filterGeode.length > 0) {
        //     states = filterGeode;
        // }

        states.forEach(state => state.work());
        return states;
    }
}


let blueprint = new Blueprint(0);
const blueprints: Array<Blueprint> = [];
const re = new RegExp('^ Each (.+) robot costs (\\d+) (.+?)( and (\\d+) (.+))?$');
const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    const parts = line.split('.');
    if (parts[0].includes(':')) {
        const [bp, p0] = parts[0].split(':');
        parts[0] = p0;
        const nr = +bp.split('Blueprint ')[1];
        blueprint = new Blueprint(nr);
        blueprints.push(blueprint);
    }
    parts.forEach(part => {
        const match = part.match(re);
        const cost = [0, 0, 0, 0];
        if (match) {
            const resRobotName = match[1].toUpperCase() as keyof typeof Resource;
            const generates = Resource[resRobotName];
            let i = 2;
            while (i < match.length) {
                if (match[i]) {
                    const resCostName = match[i + 1].toUpperCase() as keyof typeof Resource;
                    const resCost = Resource[resCostName];
                    cost[resCost] = +match[i];
                }
                i += 3;
            }
            blueprint.robots[generates].cost = cost;
        }
    });
}
blueprints.forEach(b => b.init());

blueprint = blueprints[1];
console.log(`Most recources needed: ${blueprint.mostresources}`);

let maxgeodes = Number.MIN_SAFE_INTEGER;
const solutions: Map<string, [State, number]> = new Map();
let s = 0;
const search = (state: State, path: Array<State> = []): [State, number] => {
    path.push(state);

    const key = state.id();
    if (solutions.has(key)) {
        return <[State, number]>solutions.get(key);
    }

    const geocount = state.resources[Resource.GEODE];
    const stepsleft = state.stepsleft;
    const maxpossible = geocount + ((stepsleft ** 2 + stepsleft) / 2);
    if (maxpossible < maxgeodes) {
        return [state, maxpossible];
    }

    s++;
    if (stepsleft === 0) {
        if (geocount > maxgeodes) {
            path.forEach(s => {
                console.log('  ' + s.toString());
            })
            console.log(`Best ${geocount}: ` + state.toString());
            maxgeodes = geocount;
        }
        return [state, geocount];
    } else {
        const results: Array<[State, number]> = [];
        const states = state.next();
        states.forEach(s => {
            const result = search(s, [...path]);
            results.push(result);
            solutions.set(s.id(), result);
        });
        results.sort((a, b) => b[1] - a[1]);
        return results[0];
    }
}

const state0 = new State();
search(state0);

console.log(`Done: ${s}`);

//console.log(`Part one: ${maxgeodes}`);
//console.log(`Part two: ${solution2}`);
