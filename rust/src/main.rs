use aoc::*;
use std::env;

fn main() {
    let current_dir = env::current_dir().expect("Failed to get current directory");
    println!("Current directory: {}", current_dir.display());

    let dir = if current_dir.join("data").exists() {
        "data"
    } else {
        "../../data"
    };

    env::set_current_dir(dir).expect(&format!("Failed to set current directory to {dir}"));

    year2023::day05::solve();
}
