use std::fs;
use std::collections::HashMap;

const FILENAME: &str = "day01"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let (l1, l2) = parse(&input);

    let solution1 = solve1(&l1, &l2);
    println!("Solution 1: {}", solution1);

    let solution2 = solve2(&l1, &l2);
    println!("Solution 2: {}", solution2);
}

fn solve1(l1: &Vec<i32>, l2: &Vec<i32>) -> i32 {
    let mut l1 = l1.clone();
    let mut l2 = l2.clone();

    l1.sort();
    l2.sort();
    let z: Vec<(&i32, &i32)> = l1.iter().zip(l2.iter()).collect();

    z.into_iter().map(|(a, b)| (a - b).abs()).sum()
}

fn solve2(l1: &Vec<i32>, l2: &Vec<i32>) -> i32 {
    let mut counts: HashMap<i32, i32> = HashMap::new();
    for n in l2 {
        *counts.entry(*n).or_insert(0) += 1;
    }
    l1.iter().map(|n| n * counts.get(n).unwrap_or(&0)).sum::<i32>()
}

fn parse(input: &str) -> (Vec<i32>, Vec<i32>) {
    let mut l1 = Vec::new();
    let mut l2 = Vec::new();
    for line in input.lines() {
        // spist by spaces
        let mut parts = line.split_whitespace();
        l1.push(parts.next().unwrap().parse().unwrap());
        l2.push(parts.next().unwrap().parse().unwrap());
    }
    (l1, l2)
}
