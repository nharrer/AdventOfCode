import { Processor } from './processor.ts';

const INPUT_FILE = 'input.txt';

const lines = (await Deno.readTextFile(INPUT_FILE)).trim().split('\n');

const processor = new Processor(lines);

// print pseudocode blocks
const createPseudocode = async (processor: Processor): Promise<void> => {
    let output = '';
    const blockSize = 18;
    const blocks = processor.program.length / blockSize;
    if (!Number.isInteger(blocks)) {
        throw new Error('Program length is not a multiple of block size');
    }
    output += 'export const pseudocode = (input: number[]): number => {\n';
    output += '    let x = 0;\n';
    output += '    let z = 0;\n';
    output += '    let w = 0;\n\n';
    for (let b = 0; b < blocks; b++) {
        const start = b * blockSize;
        const a1 = +processor.program[start + 4].op2!;
        const a2 = +processor.program[start + 5].op2!;
        const a3 = +processor.program[start + 15].op2!;
        output += `    w = input[${b}];\n`;
        output += `    x = z % 26 ${a2 < 0 ? '-' : '+'} ${Math.abs(a2)};\n`;
        if (a1 !== 1) {
            output += `    z = Math.floor(z / ${a1});  // <----------- \n`;
        }
        output += `    if (x != w) {\n`;
        output += `        z = 26 * z + w ${a3 < 0 ? '-' : '+'} ${Math.abs(a3)};\n`;
        output += '    }\n\n';
    }
    output += '    return z;\n';
    output += '}\n';
    await Deno.writeTextFile('pseudocode.ts', output);

    console.log('Pseudocode written to pseudocode.ts');
}

const checkPseudocode = async (processor: Processor): Promise<void> => {
    // dynamically import pseudocode.ts
    let pseudocode: (input: number[]) => number = () => 0;
    try {
        const mod = await import('./pseudocode.ts');
        if (typeof mod.pseudocode === 'function') {
            pseudocode = mod.pseudocode;
        }
    } catch {
        console.log('Could not load pseudocode module.');
    }

    // check 50000 random model numbers just to make sure the pseudocode matches the processor
    const start = Date.now();
    for (let i = 0; i < 50000; i++) {
        const inputDigits = Array.from({ length: 14 }, () => Math.floor(Math.random() * 9) + 1);
        processor.reset();
        processor.executeProgram(inputDigits);
        const z1 = processor.registers['z'];
        const z2 = pseudocode(inputDigits);
        if (z1 !== z2) {
            throw new Error(`Discrepancy found for input ${inputDigits.join('')}: processor z=${z1}, pseudocode z=${z2}`);
        }
    }
    const end = Date.now();
    console.log(`CHECK_PSEUDOCODE loop took ${end - start} ms\n`);
    console.log('All checks passed. Pseudocode matches processor output.');
}

await createPseudocode(processor);
await checkPseudocode(processor);


