use std::{collections::HashMap, fs};

const FILENAME: &str = "day22"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let (sol1, sol2) = solve2(&input.lines().map(|x| x.parse().unwrap()).collect());
    println!("Solution 1: {}", sol1);
    println!("Solution 2: {}", sol2);
}

fn solve2(numbers: &Vec<u64>) -> (u64, u32) {
    let mut sol1 = 0;
    let mut sum_map = HashMap::new();
    for &n in numbers {
        let sequence = (0..2000).fold(vec![n], |mut acc, _| {
            acc.push(rnd(*acc.last().unwrap()));
            acc
        });
        let prices = sequence.iter().map(|x| (x % 10) as u8).collect();
        let diff_map = diff_map(&prices);

        sol1 += *sequence.last().unwrap();

        for (diff, price) in diff_map {
            *sum_map.entry(diff).or_insert(0) += price as u32;
        }
    }
    (sol1, *sum_map.values().max().unwrap())
}

fn diff_map(prices: &Vec<u8>) -> HashMap<u32, u8> {
    let mut diffs: HashMap<u32, u8> = HashMap::new();
    for i in 0..prices.len() - 4 {
        // we encode a 4-tuple of differences into a single u32, which is easier to handle
        // for example [1, 2, 3, 4] -> 01020304, or [-9, 3, 1, -1] -> 19030111
        let diff = (i..i + 4).fold(0, |s, i| {
            let mut d = prices[i + 1] as i8 - prices[i] as i8;
            d = if d < 0 { -d + 10 } else { d };
            (s + d as u32) * 100
        }) / 100;
        // important: only consider the first occurrence
        diffs.entry(diff).or_insert(prices[i + 4]);
    }
    diffs
}

fn rnd(secret: u64) -> u64 {
    fn mix(s: u64, s2: u64) -> u64 { s ^ s2 }
    fn prune(s: u64) -> u64 { s % 16777216 }
    let mut s = prune(mix(secret, secret * 64));
    s = prune(mix(s, s / 32));
    prune(mix(s, s * 2048))
}
