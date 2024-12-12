use std::fs;

const FILENAME: &str = "day15_test1"; // file is in /data/<year>/

pub fn solve() {
    #[allow(unused_variables)]
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    println!("Solution 1: {}", solve1());
    println!("Solution 2: {}", solve2());
}

fn solve1() -> u32 {
    0
}

fn solve2() -> u32 {
    0
}
