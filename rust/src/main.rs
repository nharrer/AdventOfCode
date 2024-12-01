use aoc::*;
use std::env;

const YEAR: &str = "2024";
// const DAY: &str = "01"; // TODO

fn main() {
    let current_dir = env::current_dir().expect("Failed to get current directory");
    println!("Current directory: {}", current_dir.display());

    let dir = if current_dir.join("data").exists() {
        format!("data/year{}", YEAR)
    } else {
        format!("../../data/year{}", YEAR)
    };

    env::set_current_dir(&dir).expect(&format!("Failed to set current directory to {dir}"));

    year2024::day01::solve();
}
