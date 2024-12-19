use std::{collections::{HashMap, HashSet}, fs};

const FILENAME: &str = "day19"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let (towels, designs) = parse(&input);

    let (sol1, sol2) = solve1(&towels, &designs);
    println!("Solution 1: {}", sol1);
    println!("Solution 2: {}", sol2);
}

fn solve1(towels: &HashSet<String>, designs: &Vec<String>) -> (u32, u64) {
    designs.iter().fold((0, 0), |(sum1, sum2), design| {
        let solutions = splitter(design, towels, &mut HashMap::new(), 0);
        (sum1 + if solutions > 0 { 1 } else { 0 }, sum2 + solutions)
    })
}

fn splitter(design: &str, towels: &HashSet<String>, cache: &mut HashMap<usize, u64>, index: usize) -> u64 {
    if let Some(result) = cache.get(&index) {
        return *result;
    }
    let mut result = 0_u64;
    for towel in towels {
        if design[index..].starts_with(towel) { // this could also be cached, but is already fast enough
            let next_index = index + towel.len();
            if next_index >= design.len() {
                result += 1; // we reached the end, so we can increase the solution count by 1
            } else {
                result += splitter(design, towels, cache, next_index);
            }
        }
    }
    cache.insert(index, result);
    result
}

fn parse(input: &str) -> (HashSet<String>, Vec<String>) {
    let input = input.chars().filter(|&c| c != '\r').collect::<String>();
    let parts = input.split("\n\n").collect::<Vec<&str>>();
    let towels = parts[0].split(", ").map(|line| line.to_string()).collect::<HashSet<String>>();
    let designs = parts[1].lines().map(|line| line.to_string()).collect::<Vec<String>>();
    (towels, designs)
}
