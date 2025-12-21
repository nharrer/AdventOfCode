const INPUT_FILE = 'input.txt';

const lines = (await Deno.readTextFile(INPUT_FILE)).split('\n');
const [startp1, startp2] = lines.map(line => +line.split(': ')[1]);

let [pos1, pos2, sc1, sc2, die, moves] = [startp1, startp2, 0, 0, 0, 0];
const roll = () => (moves++, die = die % 100 + 1);
while (true) {
    if ((sc1 += pos1 = (pos1 + roll() + roll() + roll() - 1) % 10 + 1) >= 1000) {
        break;
    }
    if ((sc2 += pos2 = (pos2 + roll() + roll() + roll() - 1) % 10 + 1) >= 1000) {
        break;
    }
}

const memo = new Map<string, [number, number]>();
function quantumWins(p1: number, p2: number, s1: number, s2: number, turn: number): [number, number] {
    const key = `${p1},${p2},${s1},${s2},${turn}`;
    if (memo.has(key)) {
        return memo.get(key)!;
    }
    if (s1 >= 21) {
        return [1, 0];
    }
    if (s2 >= 21) {
        return [0, 1];
    }
    const wins: [number, number] = [0, 0];
    for (const [roll, freq] of [[3, 1], [4, 3], [5, 6], [6, 7], [7, 6], [8, 3], [9, 1]]) {
        const pos = ((turn === 0 ? p1 : p2) + roll - 1) % 10 + 1;
        const [w1, w2] = turn === 0 ?
            quantumWins(pos, p2, s1 + pos, s2, 1) :
            quantumWins(p1, pos, s1, s2 + pos, 0);
        wins[0] += w1 * freq;
        wins[1] += w2 * freq;
    }
    memo.set(key, wins);
    return wins;
}
const [p1Wins, p2Wins] = quantumWins(startp1, startp2, 0, 0, 0);

console.log(`Part one: ${Math.min(sc1, sc2) * moves}`);
console.log(`Part two: ${Math.max(p1Wins, p2Wins)}`);
