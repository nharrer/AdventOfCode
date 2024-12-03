use regex::Regex;
use std::fs;

const FILENAME: &str = "day03"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let input = input.lines().collect::<Vec<&str>>().join("");

    let mut enabled = true;
    let mut sol1 = 0_u32;
    let mut sol2 = 0_u32;

    let re = Regex::new(r"(do\(\))|(don't\(\))|(mul\((\d\d?\d?),(\d\d?\d?)\))").unwrap();
    for cap in re.captures_iter(&input) {
        match cap.get(0).unwrap().as_str() {
            "do()" => enabled = true,
            "don't()" => enabled = false,
            _ => {
                let v1 = cap.get(4).unwrap().as_str().parse::<u32>().unwrap();
                let v2 = cap.get(5).unwrap().as_str().parse::<u32>().unwrap();
                let v = v1 * v2;
                sol1 = sol1 + v;
                if enabled {
                    sol2 = sol2 + v;
                }
            }
        }
    }

    println!("Solution 1: {}", sol1);
    println!("Solution 2: {}", sol2);
}
