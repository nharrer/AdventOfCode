use std::fs;

const FILENAME: &str = "day02"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let data: Vec<Vec<i32>> =
        input.lines().map(|line| line.split_whitespace().map(|n| n.parse().unwrap()).collect()).collect();

    let solution1 = solve1(&data);
    println!("Solution 1: {}", solution1);

    let solution2 = solve2(&data);
    println!("Solution 2: {}", solution2);
}

fn solve1(data: &Vec<Vec<i32>>) -> i32 {
    data.iter().filter(|report| check_report(report)).count() as i32
}

fn solve2(data: &Vec<Vec<i32>>) -> i32 {
    data.iter().filter(|report| check_report(report) || check_report2(report)).count() as i32
}

fn check_report(report: &Vec<i32>) -> bool {
    let diffs: Vec<i32> = report.windows(2).map(|w| w[1] - w[0]).collect();             // diff between adjacent numbers
    let all_same_sign = diffs.iter().all(|&x| x > 0) || diffs.iter().all(|&x| x < 0);   // all positive or all negative
    let only_allowed_steps = diffs.iter().all(|&x| x.abs() >= 1 && x.abs() <= 3);       // all diffs are >= 1 and <= 3
    all_same_sign && only_allowed_steps
}

fn check_report2(report: &Vec<i32>) -> bool {
    (0..report.len()).any(|i| check_report(&report.iter().enumerate().filter(|(j, _)| *j != i).map(|(_, x)| *x).collect::<Vec<i32>>()))
}
