export class Processor {
    public program: Instruction[] = [];

    public input: number[] = [];

    public logging = false;

    public ip = 0;

    public registers: Record<string, number> = { w: 0, x: 0, y: 0, z: 0 };

    constructor(public instructions: string[]) {
        for (const line of instructions) {
            const parts = line.split(' ');
            let instr: Instruction;
            switch (parts[0]) {
                case 'inp':
                    instr = new Inp(parts[1]);
                    break;
                case 'add':
                    instr = new Add(parts[1], parts[2]);
                    break;
                case 'mul':
                    instr = new Mul(parts[1], parts[2]);
                    break;
                case 'div':
                    instr = new Div(parts[1], parts[2]);
                    break;
                case 'mod':
                    instr = new Mod(parts[1], parts[2]);
                    break;
                case 'eql':
                    instr = new Eql(parts[1], parts[2]);
                    break;
                default:
                    throw new Error(`Unknown instruction: ${parts[0]}`);
            }
            this.program.push(instr);
        }
    }

    public reset(): void {
        this.registers = { w: 0, x: 0, y: 0, z: 0 };
        this.input = [];
        this.ip = 0;
    }

    public executeProgram(input: number[]): void {
        // clone input
        this.input = input.slice();
        for (const instr of this.program) {
            instr.execute(this);
            if (this.logging) {
                console.log(`${pad(this.ip, 2)}: ${this.dumpRegisters()}  ${instr.toString()}`);
            }
            if (instr.name === 'inp') {
                this.ip = 0;
            }
            this.ip++;
        }
    }

    public dumpRegisters(): string {
        return `${JSON.stringify(this.registers).replaceAll(/[{}"]/g, '').replaceAll(',', ', ')}`;
    }

    public printProgram(): void {
        for (const instr of this.program) {
            instr.print();
        }
    }
}

abstract class Instruction {

    constructor(public readonly name: string, public readonly op1: string, public readonly op2?: string) {
    }

    public getOperand1(processor: Processor): number {
        const val = processor.registers[this.op1];
        if (isNaN(val)) {
            throw new Error(`Invalid operand: ${this.op1}`);
        }
        return val;
    }

    public getOperand2(processor: Processor): number {
        let val = +this.op2!;
        if (isNaN(val)) {
            val = processor.registers[this.op2!];
            if (isNaN(val)) {
                throw new Error(`Invalid operand: ${this.op2}`);
            }
        }
        return val;
    }

    public abstract execute(processor: Processor): void;

    public toString(): string {
        return `${this.name} ${this.op1} ${this.op2 ?? ''}`.trim();
    }

    public print(): void {
        console.log(this.toString());
    }

    public equal(other: Instruction): boolean {
        return this.name === other.name && this.op1 === other.op1 && this.op2 === other.op2;
    }
}

class Inp extends Instruction {

    constructor(op: string) {
        super('inp', op);
    }

    public execute(processor: Processor): void {
        if (processor.input.length === 0) {
            throw new Error('No more input available');
        }
        const inputValue = processor.input.shift();
        processor.registers[this.op1] = inputValue!;
    }
}

class Add extends Instruction {

    constructor(op1: string, op2: string) {
        super('add', op1, op2);
    }

    public execute(processor: Processor): void {
        const val1 = this.getOperand1(processor);
        const val2 = this.getOperand2(processor);
        processor.registers[this.op1] = val1 + val2;
    }
}

class Mul extends Instruction {

    constructor(op1: string, op2: string) {
        super('mul', op1, op2);
    }

    public execute(processor: Processor): void {
        const val1 = this.getOperand1(processor);
        const val2 = this.getOperand2(processor);
        processor.registers[this.op1] = val1 * val2;
    }
}

class Div extends Instruction {

    constructor(op1: string, op2: string) {
        super('div', op1, op2);
    }

    public execute(processor: Processor): void {
        const val1 = this.getOperand1(processor);
        const val2 = this.getOperand2(processor);
        let val = val1 / val2;
        // round towards zero
        if (val < 0) {
            val = Math.ceil(val);
        } else {
            val = Math.floor(val);
        }
        processor.registers[this.op1] = val;
    }
}

class Mod extends Instruction {

    constructor(op1: string, op2: string) {
        super('mod', op1, op2);
    }

    public execute(processor: Processor): void {
        const val1 = this.getOperand1(processor);
        const val2 = this.getOperand2(processor);
        processor.registers[this.op1] = val1 % val2;
    }
}

class Eql extends Instruction {

    constructor(op1: string, op2: string) {
        super('eql', op1, op2);
    }

    public execute(processor: Processor): void {
        const val1 = this.getOperand1(processor);
        const val2 = this.getOperand2(processor);
        const val = val1 === val2 ? 1 : 0;
        processor.registers[this.op1] = val;
    }
}

const pad = (num: number, size: number): string => {
    let s = num.toString();
    while (s.length < size) {
        s = '0' + s;
    }
    return s;
}

