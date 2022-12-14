import { encode } from "https://deno.land/x/pngs@0.1.1/mod.ts";

interface O { x: number, y: number, type: string }

const renderpng = async (filename: string, width: number, height: number, hasfloor: boolean, objArray: Array<O>): Promise<void> => {

    const colorMap: Map<string, [number, number, number, number]> = new Map();
    colorMap.set('.', [20, 29, 211, 255]);
    colorMap.set('#', [77, 205, 255, 255]);
    colorMap.set('o', [255, 239, 131, 255]);
    colorMap.set('F', [200, 15, 0, 255]);

    const buffer = new ArrayBuffer(width * height * 4);
    const data = new Uint8Array(buffer);
    let pos = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const type = (hasfloor && y === (height - 1)) ? 'F' : (objArray.filter(o => o.x === x && o.y === y)[0])?.type;
            const color = colorMap.get(type ?? '.') || [255, 0, 0, 255];
            data[pos++] = color[0];
            data[pos++] = color[1];
            data[pos++] = color[2];
            data[pos++] = color[3];
        }
    }

    const png = encode(data, width, height);
    await Deno.writeFile(filename, png);
}

export { renderpng };
