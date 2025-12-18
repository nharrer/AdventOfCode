import { readLines } from "../../import.ts";

const INPUT_FILE = 'input.txt';

type Bit = 0 | 1;
type Stream = Array<Bit>;

enum Type {
    Sum = 0,
    Product = 1,
    Minimum = 2,
    Maximum = 3,
    GreaterThen = 5,
    LessThen = 6,
    Equal = 7,
    Literal = 4
}

// removes first n bits for stream s
const shiftn = (s: Stream, n: number): Stream => {
    const ret: Stream = [];
    for (let i = 0; i < n; i++) {
        ret.push(s.shift() || 0);
    }
    return ret;
}

const numberToBits = (byte: number, n = 4): Array<Bit> => {
    const bits: Array<Bit> = [];
    for (let e = 0; e < n; e++) {
        bits.unshift(<Bit>(byte % 2));
        byte = byte >> 1;
    }
    return bits;
}

const bitsToNumber = (s: Stream, n: number): number => {
    const bits = shiftn(s, n);
    let e = 0;
    let value = 0;
    while (bits.length > 0) {
        const bit = bits.pop() || 0;
        value += bit * 2 ** e++;
    }
    return value;
}

class Packet {
    constructor(
        public version: number,
        public type: Type
    ) {
    }
    public sumVersion(): number {
        return this.version;
    }
    public getValue(): number {
        throw new Error('getValue() not implemented');
    }
    public static parse(s: Stream): Packet {
        const version = bitsToNumber(s, 3);
        const type = bitsToNumber(s, 3);
        if (type === Type.Literal) {
            return Literal.fromStream(s, version, type);
        } else {
            return Operator.fromStream(s, version, type);
        }
    }
}

class Literal extends Packet {
    constructor(
        public override version: number,
        public override type: Type,
        public value = 0
    ) {
        super(version, type);
    }
    public override getValue(): number {
        return this.value;
    }

    public static fromStream(s: Stream, version: number, type: Type): Literal {
        const bits: Stream = [];
        let last = true;
        do {
            last = shiftn(s, 1)[0] === 0;
            bits.push(...shiftn(s, 4));
        } while (!last);
        return new Literal(version, type, bitsToNumber(bits, bits.length));
    }
}

class Operator extends Packet {
    constructor(
        public override version: number,
        public override type: Type,
        public packets: Array<Packet> = []
    ) {
        super(version, type);
    }
    public override sumVersion(): number {
        return this.version + this.packets.reduce((sum, p) => sum + p.sumVersion(), 0);
    }
    public override getValue(): number {
        if (this.type === Type.Sum) {
            return this.packets.reduce((result, p) => result + p.getValue(), 0);
        } else if (this.type === Type.Product) {
            return this.packets.reduce((result, p) => result * p.getValue(), 1);
        } else if (this.type === Type.Minimum) {
            return this.packets.reduce((result, p) => Math.min(result, p.getValue()), Number.MAX_SAFE_INTEGER);
        } else if (this.type === Type.Maximum) {
            return this.packets.reduce((result, p) => Math.max(result, p.getValue()), Number.MIN_SAFE_INTEGER);
        } else if (this.type === Type.GreaterThen) {
            return this.packets[0].getValue() > this.packets[1].getValue() ? 1 : 0;
        } else if (this.type === Type.LessThen) {
            return this.packets[0].getValue() < this.packets[1].getValue() ? 1 : 0;
        } else if (this.type === Type.Equal) {
            return this.packets[0].getValue() === this.packets[1].getValue() ? 1 : 0;
        }
        throw new Error(`Invalid packet type: ${this.type}`);
    }

    public static fromStream(s: Stream, version: number, type: Type): Operator {
        const packets: Array<Packet> = [];
        const lenType = shiftn(s, 1)[0];
        if (lenType === 0) {
            const length = bitsToNumber(s, 15);
            const subStream = shiftn(s, length);
            while (subStream.length >= 6) {
                packets.push(Packet.parse(subStream));
            }
        } else {
            let packetCount = bitsToNumber(s, 11);
            while (packetCount-- > 0) {
                const packet = Packet.parse(s);
                packets.push(packet);
            }
        }
        return new Operator(version, type, packets);
    }
}

const stream: Array<Bit> = [];
const file = await Deno.open(INPUT_FILE);
for await (const line of readLines(file)) {
    const chars = line.split('');
    const nibbles = chars.map(c => c.charCodeAt(0)).map(x => x >= 65 ? x - 65 + 10 : x - 48);
    nibbles.forEach(b => stream.push(...numberToBits(b)));
}

const packet = Packet.parse(stream);
const solution1 = packet.sumVersion();
const solution2 = packet.getValue();

console.log(`Part one: ${solution1}`);
console.log(`Part two: ${solution2}`);
