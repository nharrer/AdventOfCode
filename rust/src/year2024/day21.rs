use std::{collections::HashMap, fs, vec};
use itertools::Itertools;

const FILENAME: &str = "day21"; // file is in /data/<year>/

type Pos = (usize, usize);

struct Key {
    c: char,
    pos: Pos,
}

struct Keypad {
    keys: HashMap<char, Key>
}

impl Keypad {
    fn new(keys: Vec<Key>) -> Self {
        Keypad { keys: keys.into_iter().map(|key| (key.c, key)).collect() }
    }

    fn new_door() -> Self {
        let key_0 = Key { pos: (1, 0), c: '0' };
        let key_1 = Key { pos: (0, 1), c: '1' };
        let key_2 = Key { pos: (1, 1), c: '2' };
        let key_3 = Key { pos: (2, 1), c: '3' };
        let key_4 = Key { pos: (0, 2), c: '4' };
        let key_5 = Key { pos: (1, 2), c: '5' };
        let key_6 = Key { pos: (2, 2), c: '6' };
        let key_7 = Key { pos: (0, 3), c: '7' };
        let key_8 = Key { pos: (1, 3), c: '8' };
        let key_9 = Key { pos: (2, 3), c: '9' };
        let key_a = Key { pos: (2, 0), c: 'A' };
        let key_e = Key { pos: (0, 0), c: '_' };
        Keypad::new(vec![key_0, key_1, key_2, key_3, key_4, key_5, key_6, key_7, key_8, key_9, key_a, key_e])
    }

    fn new_robot() -> Self {
        let key_l = Key { pos: (0, 0), c: '<' };
        let key_d = Key { pos: (1, 0), c: 'v' };
        let key_r = Key { pos: (2, 0), c: '>' };
        let key_u = Key { pos: (1, 1), c: '^' };
        let key_a = Key { pos: (2, 1), c: 'A' };
        let key_e = Key { pos: (0, 1), c: '_' };
        Keypad::new(vec![key_l, key_d, key_r, key_u, key_a, key_e])
    }
}

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let codes = input.lines().map(|line| line.to_string()).collect();
    let door = Keypad::new_door();
    let robot = Keypad::new_robot();

    let mut mem = HashMap::new();
    println!("Solution 1: {}", solve1(&door, &robot, &codes, &mut mem, 3));
    println!("Solution 2: {}", solve1(&door, &robot, &codes, &mut mem, 26));
}

fn solve1(door: &Keypad, robot: &Keypad, codes: &Vec<String>, mem: &mut HashMap<(String, u8), u64>, levels: u8) -> u64 {
    codes.iter().map(|code| {
        let s = format!("A{}", code);
        let cost = min_moves(&robot, &door, &s, levels, levels, mem);
        let nr: u64 = code[..code.len() - 1].parse().unwrap();
        nr * cost
    }).sum()
}

fn min_moves(robot: &Keypad, door: &Keypad, sequence: &String, level: u8, start: u8, mem: &mut HashMap<(String, u8), u64>) -> u64 {
    if let Some(&cost) = mem.get(&(sequence.clone(), level)) {
        return cost;
    }

    let mut cost = 0;
    if sequence.len() == 2 {
        if level == 0 {
            return 1; // It's me. I just press the button.
        }
        let keypad = if level == start { door } else { robot };
        let c1 = sequence.chars().next().unwrap();
        let c2 = sequence.chars().nth(1).unwrap();
        let k1 = &keypad.keys.get(&c1).unwrap();
        let k2 = &keypad.keys.get(&c2).unwrap();
        let ki = &keypad.keys.get(&'_').unwrap();
        let moves1 = get_moves(k1.pos, k2.pos, ki.pos);
        cost += moves1.iter().map(|m| {
            // the next level needs to enter this sequence finished by an 'A'
            let sub = format!("A{}A", m);
            min_moves(robot, door, &sub, level - 1, start, mem)
        }).min().unwrap();
    } else {
        // split the sequence into pairs of characters which is easier to handle
        for t in sequence.chars().tuple_windows::<(char, char)>() {
            let sub = format!("{}{}", t.0, t.1);
            cost += min_moves(robot, door, &sub, level, start, mem);
        }
    }

    mem.insert((sequence.clone(), level), cost);
    cost
}

fn get_moves(current: Pos, goal: Pos, avoid: Pos) -> Vec<String> {
    if current == goal {
        return vec![String::new()];
    }
    let mut moves: Vec<String> = Vec::new();
    let dirx = (goal.0 as isize - current.0 as isize).signum();
    let diry = (goal.1 as isize - current.1 as isize).signum();
    if dirx != 0 {
        let next = ((current.0 as isize + dirx) as usize, current.1);
        if next != avoid {
            for m in get_moves(next, goal, avoid).into_iter() {
                moves.push(String::from(if dirx == 1 { '>' } else { '<' }) + m.as_str());
            }
        }
    }
    if diry != 0 {
        let next = (current.0, (current.1 as isize + diry) as usize);
        if next != avoid {
            for m in get_moves(next, goal, avoid).into_iter() {
                moves.push(String::from(if diry == 1 { '^' } else { 'v' }) + m.as_str());
            }
        }
    }
    moves
}
