use itertools::Itertools;
use num::integer::gcd;
use std::collections::{HashMap, HashSet};
use std::fs;

const FILENAME: &str = "day08"; // file is in /data/<year>/

#[derive(Eq, Hash, PartialEq)]
struct Node(i32, i32);

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let (antennas, w, h) = parse(&input);
    println!("Solution 1: {}", count_antinodes(&antennas, w, h, antinodes1));
    println!("Solution 2: {}", count_antinodes(&antennas, w, h, antinodes2));
}

fn count_antinodes(antennas: &HashMap<char, HashSet<Node>>, w: i32, h: i32, func: fn(&Node, &Node, i32, i32) -> HashSet<Node>) -> usize {
    let mut allantinodes: HashSet<Node> = HashSet::new();
    for v in antennas.values() {
        for c in v.iter().combinations(2) {
            allantinodes.extend(func(c[0], c[1], w, h));
        }
    }
    allantinodes.len()
}

fn antinodes1(a: &Node, b: &Node, w: i32, h: i32) -> HashSet<Node> {
    let mut antinodes = HashSet::new();
    let (dx, dy) = (b.0 - a.0, b.1 - a.1);
    add_if_inside(&mut antinodes, Node(a.0 - dx, a.1 - dy), w, h);
    add_if_inside(&mut antinodes, Node(b.0 + dx, b.1 + dy), w, h);
    antinodes
}

fn antinodes2(a: &Node, b: &Node, w: i32, h: i32) -> HashSet<Node> {
    let (dx, dy) = (b.0 - a.0, b.1 - a.1);
    let gcd = gcd(dx, dy); // is always 1 for puzzle input ?!? they could have made it harder
    let (dx, dy) = (dx / gcd, dy / gcd);
    let mut mul = 0;
    let mut antinodes = HashSet::new();
    loop {
        let n1 = Node(a.0 + dx * mul, a.1 + dy * mul);
        let n2 = Node(a.0 - dx * mul, a.1 - dy * mul);
        if add_if_inside(&mut antinodes, n1, w, h) + add_if_inside(&mut antinodes, n2, w, h) == 0 {
            break;
        }
        mul += 1;
    }
    antinodes
}

fn add_if_inside(antinodes: &mut HashSet<Node>, a: Node, w: i32, h: i32) -> usize {
    if a.0 >= 0 && a.0 < w && a.1 >= 0 && a.1 < h { antinodes.insert(a); 1 } else { 0 }
}

fn parse(input: &str) -> (HashMap<char, HashSet<Node>>, i32, i32) {
    let lines: Vec<Vec<char>> = input.lines().map(|line| line.chars().collect()).collect();
    let mut antennas: HashMap<char, HashSet<Node>> = HashMap::new();
    for y in 0..lines.len() {
        for x in 0..lines[y].len() {
            let c = lines[y][x];
            if c != '.' {
                let node = Node(x as i32, y as i32);
                let v = antennas.entry(c).or_insert(HashSet::new());
                v.insert(node);
            }
        }
    }
    (antennas, lines[0].len() as i32, lines.len() as i32)
}
