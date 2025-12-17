import { readLines } from '../../import.ts';

const INPUT_FILE = 'input.txt';

abstract class Node {

    parent: Pair | null = null;

    static parse(str: string): Node {
        if (!str.startsWith('[')) {
            return new Value(+str);
        }
        for (let i = 0, level = 0; i < str.length; i++) {
            const c = str.charAt(i);
            if (c === '[') {
                level++;
            } else if (c === ']') {
                level--;
            } else if (c === ',' && level === 1) {
                return new Pair(Node.parse(str.slice(1, i)), Node.parse(str.slice(i + 1, str.length - 1)));
            }
        }
        throw new Error('Invalid input');
    }

    dump(): string {
        if (this instanceof Value) {
            return this.value.toString();
        }
        if (this instanceof Pair) {
            return `[${this.left.dump()},${this.right.dump()}]`;
        }
        throw new Error('Unknown node type');
    }

    magnitude(): number {
        if (this instanceof Value) {
            return this.value;
        }
        if (this instanceof Pair) {
            return 3 * this.left.magnitude() + 2 * this.right.magnitude();
        }
        throw new Error('Unknown node type');
    }

    test(expected: string): void {
        const actual = this.dump();
        console[expected === actual ? 'log' : 'error'](expected === actual ? `Success: ${expected}` : `Error: expected ${expected} but got ${actual}`);
    }

    add(other: Node): Node {
        return new Pair(this, other).reduce();
    }

    explode(): Node {
        this.explodeCheck();
        return this;
    }

    reduce(): Node {
        while (this.explodeCheck() || this.split()) { /* keep reducing */ }
        return this;
    }

    private explodeCheck(): boolean {
        const pair = this.findFirstLevel4(0);
        if (!pair) {
            return false;
        }
        if (!(pair.left instanceof Value && pair.right instanceof Value)) {
            throw new Error('Invalid pair found while exploding');
        }
        const leafs = this.buildLeafArray();
        const index = leafs.indexOf(pair.left);
        if (index > 0) {
            leafs[index - 1].value += pair.left.value;
        }
        if (index + 2 < leafs.length) {
            leafs[index + 2].value += pair.right.value;
        }
        pair.parent!.replaceChild(pair, new Value(0));
        return true;
    }

    private split(): boolean {
        if (this instanceof Value) {
            if (this.value >= 10) {
                const replacement = new Pair(new Value(Math.floor(this.value / 2)), new Value(Math.ceil(this.value / 2)));
                if (this.parent) {
                    this.parent.replaceChild(this, replacement);
                }
                return true;
            }
        }
        if (this instanceof Pair) {
            return this.left.split() || this.right.split();
        }
        return false;
    }

    private buildLeafArray(arr: Value[] = []): Value[] {
        if (this instanceof Value) {
            arr.push(this);
            return arr;
        }
        if (this instanceof Pair) {
            this.left.buildLeafArray(arr);
            this.right.buildLeafArray(arr);
        }
        return arr;
    }

    private findFirstLevel4(level: number): Pair | null {
        if (this instanceof Pair) {
            if (level === 4) {
                return this;
            }
            return this.left.findFirstLevel4(level + 1) ?? this.right.findFirstLevel4(level + 1);
        }
        return null;
    }
}

class Value extends Node {
    constructor(public value: number) {
        super();
    }
}

class Pair extends Node {
    constructor(public left: Node, public right: Node) {
        super();
        this.left.parent = this;
        this.right.parent = this;
    }

    replaceChild(oldChild: Node, newChild: Node): void {
        if (this.left === oldChild) {
            this.left = newChild;
        } else if (this.right === oldChild) {
            this.right = newChild;
        } else {
            throw new Error('Attempted to replace a non-child node');
        }
        newChild.parent = this;
        oldChild.parent = null;
    }
}

Node.parse('[[[[[9,8],1],2],3],4]').explode().test('[[[[0,9],2],3],4]');
Node.parse('[7,[6,[5,[4,[3,2]]]]]').explode().test('[7,[6,[5,[7,0]]]]');
Node.parse('[[6,[5,[4,[3,2]]]],1]').explode().test('[[6,[5,[7,0]]],3]');
Node.parse('[[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]').explode().test('[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]');
Node.parse('[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]').explode().test('[[3,[2,[8,0]]],[9,[5,[7,0]]]]');
Node.parse('[[[[4,3],4],4],[7,[[8,4],9]]]').add(Node.parse('[1,1]')).test('[[[[0,7],4],[[7,8],[6,0]]],[8,1]]');
Node.parse('[1,1]').add(Node.parse('[2,2]')).add(Node.parse('[3,3]')).add(Node.parse('[4,4]')).test('[[[[1,1],[2,2]],[3,3]],[4,4]]');
Node.parse('[1,1]').add(Node.parse('[2,2]')).add(Node.parse('[3,3]')).add(Node.parse('[4,4]')).add(Node.parse('[5,5]')).test('[[[[3,0],[5,3]],[4,4]],[5,5]]');
Node.parse('[1,1]').add(Node.parse('[2,2]')).add(Node.parse('[3,3]')).add(Node.parse('[4,4]')).add(Node.parse('[5,5]')).add(Node.parse('[6,6]')).test('[[[[5,0],[7,4]],[5,5]],[6,6]]');

const lines: string[] = [];
for await (const line of readLines(await Deno.open(INPUT_FILE))) {
    lines.push(line);
}

const part1 = lines.map(Node.parse).reduce((a, b) => a.add(b));

let part2 = 0;
for (let i = 0; i < lines.length; i++) {
    for (let j = 0; j < lines.length; j++) {
        if (i !== j) {
            part2 = Math.max(part2, Node.parse(lines[i]).add(Node.parse(lines[j])).magnitude());
        }
    }
}

console.log(`Part one: ${part1.magnitude()}`);
console.log(`Part two: ${part2}`);
