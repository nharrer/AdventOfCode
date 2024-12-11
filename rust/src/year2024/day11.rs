use std::fs;
use memoize::memoize;

const FILENAME: &str = "day11"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let nums: Vec<u64> = input.lines().next().unwrap().split_whitespace().map(|s| s.parse().unwrap()).collect();
    println!("Solution 1: {}", nums.iter().fold(0, |acc, n| acc + rsolve(*n, 25, 1)));
    println!("Solution 2: {}", nums.iter().fold(0, |acc, n| acc + rsolve(*n, 75, 1)));
}

#[memoize]
fn rsolve(n: u64, steps_left: u32, sum: u64) -> u64 {
    if steps_left == 0 {
        return sum;
    }
    if n == 0 {
        return rsolve(1, steps_left - 1, sum);
    }
    let str = n.to_string();
    let digits = str.len();
    if digits % 2 == 0 {
        let (left, right) = str.split_at(digits / 2);
        let (n1, n2) = (left.parse().unwrap(), right.parse().unwrap());
        return rsolve(n1, steps_left - 1, sum) + rsolve(n2, steps_left - 1, sum);
    }
    rsolve(n * 2024, steps_left - 1, sum)
}
