use std::fs;

const FILENAME: &str = "day01";
// const FILENAME: &str = "day01_test1";

const NUMBER_WORDS: [&str; 9] = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let solution1 = solve2(&input, &[].to_vec());
    println!("Solution 1: {}", solution1);

    let solution2 = solve2(&input, &NUMBER_WORDS.to_vec());
    println!("Solution 2: {}", solution2);
}

fn solve2(input: &String, number_words: &Vec<&str>) -> i32 {
    let mut sum = 0;
    for line in input.lines() {
        let first_char = find_number(line, number_words, false).unwrap_or("".to_string());
        let last_char = find_number(line, number_words, true).unwrap_or("".to_string());
        let concat = format!("{}{}", first_char, last_char);
        // println!("{line} -> {concat}");
        let n = concat.parse::<i32>().unwrap_or(0);
        sum = sum + n;
    }
    sum
}

fn find_number(line: &str, number_words: &Vec<&str>, reverse: bool) -> Option<String> {
    let mut buf = String::new();
    let line = if reverse {
        line.chars().rev().collect::<String>()
    } else {
        line.to_string()
    };

    for char in line.chars() {
        if char.is_digit(10) {
            return Some(char.to_string());
        } else {
            let found: Vec<&&str>;
            if reverse {
                buf = format!("{}{}", char, buf);
                found = number_words
                    .iter()
                    .filter(|&&x| buf.starts_with(x))
                    .collect();
            } else {
                buf.push(char);
                found = number_words
                    .iter()
                    .filter(|&&x| buf.ends_with(x))
                    .collect();
            }

            if !found.is_empty() {
                let found = **found.first().unwrap();
                let nr =
                    (number_words.iter().position(|&x| x == found).unwrap() + 1).to_string();
                return Some(nr);
            }
        }
    }
    None
}
