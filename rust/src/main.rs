use aoc::*;
use clap::{Arg, Command};
use std::env;
use std::time::Instant;

const YEAR: u16 = 2024;

fn main() {
    setup_cwd();

    let command = Command::new("Advent of Code")
        .version("1.0")
        .author("Norbert Harrer")
        .about("Solves Advent of Code Puzzles")
        .arg(
            Arg::new("day")
                .short('d')
                .long("day")
                .value_name("DAY")
                .help("Specifies the day to solve")
                .num_args(1)
                .required(true),
        )
        .get_matches();

    let day = command.get_one::<String>("day").unwrap();

    let solve = match day.as_str().parse() {
        Ok(01) => year2024::day01::solve,
        Ok(02) => year2024::day02::solve,
        Ok(03) => year2024::day03::solve,
        Ok(04) => year2024::day04::solve,
        Ok(05) => year2024::day05::solve,
        Ok(06) => year2024::day06::solve,
        Ok(07) => year2024::day07::solve,
        Ok(08) => year2024::day08::solve,
        Ok(09) => year2024::day09::solve,
        Ok(10) => year2024::day10::solve,
        Ok(11) => year2024::day11::solve,
        Ok(12) => year2024::day12::solve,
        Ok(13) => year2024::day13::solve,
        Ok(14) => year2024::day14::solve,
        Ok(15) => year2024::day15::solve,
        Ok(16) => year2024::day16::solve,
        Ok(17) => year2024::day17::solve,
        Ok(18) => year2024::day18::solve,
        Ok(19) => year2024::day19::solve,
        Ok(20) => year2024::day20::solve,
        Ok(21) => year2024::day21::solve,
        Ok(22) => year2024::day22::solve,
        Ok(23) => year2024::day23::solve,
        Ok(24) => year2024::day24::solve,
        Ok(25) => year2024::day25::solve,
        _ => panic!("Day {} is not implemented yet!", day),
    };

    let d = day.as_str().parse().unwrap();

    run_day(d, YEAR, solve);
}

fn run_day(day: u8, year: u16, solve: fn()) {
    println!("Solving Advent of Code {year}: Day {day:02}\n");

    check_data_files(day, year);

    let now = Instant::now();

    solve();

    println!("\nElapsed: {:.2?}", now.elapsed());
}

fn check_data_files(day: u8, _: u16) {
    let files = vec![format!("day{:02}", day), format!("day{:02}_test1", day)];
    for file in files {
        if !std::path::Path::new(&file).exists() {
            std::fs::File::create(&file).expect(&format!("Failed to create file: {file}"));
        }
    }
}

fn setup_cwd() {
    let current_dir = env::current_dir().expect("Failed to get current directory");
    // println!("Current directory: {}", current_dir.display());

    let dir = if current_dir.join("data").exists() {
        format!("data/year{}", YEAR)
    } else {
        format!("../../data/year{}", YEAR)
    };

    env::set_current_dir(&dir).expect(&format!("Failed to set current directory to {dir}"));
}
