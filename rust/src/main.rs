use aoc::*;
use clap::{Arg, Command};
use std::env;
use std::time::Instant;

fn main() {
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
        .arg(
            Arg::new("year")
                .short('y')
                .long("year")
                .value_name("YEAR")
                .help("Specifies the year to solve")
                .num_args(1)
                .required(true),
        )
        .get_matches();

    let day = command
        .get_one::<String>("day")
        .unwrap()
        .parse::<u16>()
        .expect("Day must be a valid number");
    let year = command
        .get_one::<String>("year")
        .unwrap()
        .parse::<u16>()
        .expect("Year must be a valid number");

    setup_cwd(year);

    let solve = match year {
        2022 => match day {
            1 => year2022::day01::solve,
            _ => panic!("Day {} is not implemented yet for year {}!", day, year),
        },
        2023 => match day {
            1 => year2023::day01::solve,
            2 => year2023::day02::solve,
            3 => year2023::day03::solve,
            4 => year2023::day04::solve,
            5 => year2023::day05::solve,
            _ => panic!("Day {} is not implemented yet for year {}!", day, year),
        },
        2024 => match day {
            1 => year2024::day01::solve,
            2 => year2024::day02::solve,
            3 => year2024::day03::solve,
            4 => year2024::day04::solve,
            5 => year2024::day05::solve,
            6 => year2024::day06::solve,
            7 => year2024::day07::solve,
            8 => year2024::day08::solve,
            9 => year2024::day09::solve,
            10 => year2024::day10::solve,
            11 => year2024::day11::solve,
            12 => year2024::day12::solve,
            13 => year2024::day13::solve,
            14 => year2024::day14::solve,
            15 => year2024::day15::solve,
            16 => year2024::day16::solve,
            17 => year2024::day17::solve,
            18 => year2024::day18::solve,
            19 => year2024::day19::solve,
            20 => year2024::day20::solve,
            21 => year2024::day21::solve,
            22 => year2024::day22::solve,
            23 => year2024::day23::solve,
            24 => year2024::day24::solve,
            25 => year2024::day25::solve,
            _ => panic!("Day {} is not implemented yet for year {}!", day, year),
        },
        _ => panic!("Year {} is not implemented yet!", year),
    };

    run_day(day, year, solve);
}

fn run_day(day: u16, year: u16, solve: fn()) {
    println!("Solving Advent of Code {year}: Day {day:02}\n");

    check_data_files(day, year);

    let now = Instant::now();

    solve();

    println!("\nElapsed: {:.2?}", now.elapsed());
}

fn check_data_files(day: u16, _: u16) {
    let files = vec![format!("day{:02}", day), format!("day{:02}_test1", day)];
    for file in files {
        if !std::path::Path::new(&file).exists() {
            std::fs::File::create(&file).expect(&format!("Failed to create file: {file}"));
        }
    }
}

fn setup_cwd(year: u16) {
    let current_dir = env::current_dir().expect("Failed to get current directory");
    // println!("Current directory: {}", current_dir.display());

    let dir = if current_dir.join("data").exists() {
        format!("data/year{}", year)
    } else {
        format!("../../data/year{}", year)
    };

    env::set_current_dir(&dir).expect(&format!("Failed to set current directory to {dir}"));
}
