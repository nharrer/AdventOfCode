export const pseudocode = (input: number[]): number => {
    let x = 0;
    let z = 0;
    let w = 0;

    w = input[0];
    x = z % 26 + 12;
    if (x != w) {
        z = 26 * z + w + 7;
    }

    w = input[1];
    x = z % 26 + 12;
    if (x != w) {
        z = 26 * z + w + 8;
    }

    w = input[2];
    x = z % 26 + 13;
    if (x != w) {
        z = 26 * z + w + 2;
    }

    w = input[3];
    x = z % 26 + 12;
    if (x != w) {
        z = 26 * z + w + 11;
    }

    w = input[4];
    x = z % 26 - 3;
    z = Math.floor(z / 26);  // <----------- 
    if (x != w) {
        z = 26 * z + w + 6;
    }

    w = input[5];
    x = z % 26 + 10;
    if (x != w) {
        z = 26 * z + w + 12;
    }

    w = input[6];
    x = z % 26 + 14;
    if (x != w) {
        z = 26 * z + w + 14;
    }

    w = input[7];
    x = z % 26 - 16;
    z = Math.floor(z / 26);  // <----------- 
    if (x != w) {
        z = 26 * z + w + 13;
    }

    w = input[8];
    x = z % 26 + 12;
    if (x != w) {
        z = 26 * z + w + 15;
    }

    w = input[9];
    x = z % 26 - 8;
    z = Math.floor(z / 26);  // <----------- 
    if (x != w) {
        z = 26 * z + w + 10;
    }

    w = input[10];
    x = z % 26 - 12;
    z = Math.floor(z / 26);  // <----------- 
    if (x != w) {
        z = 26 * z + w + 6;
    }

    w = input[11];
    x = z % 26 - 7;
    z = Math.floor(z / 26);  // <----------- 
    if (x != w) {
        z = 26 * z + w + 10;
    }

    w = input[12];
    x = z % 26 - 6;
    z = Math.floor(z / 26);  // <----------- 
    if (x != w) {
        z = 26 * z + w + 8;
    }

    w = input[13];
    x = z % 26 - 11;
    z = Math.floor(z / 26);  // <----------- 
    if (x != w) {
        z = 26 * z + w + 5;
    }

    return z;
}
