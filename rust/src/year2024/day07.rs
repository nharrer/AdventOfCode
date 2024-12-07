use std::fs;

const FILENAME: &str = "day07"; // file is in /data/<year>/

struct Equation {
    result: u64,
    values: Vec<u64>,
}

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let equations = parse(&input);

    fn add(a: u64, b: u64) -> u64 { a + b }
    fn mul(a: u64, b: u64) -> u64 { a * b }
    fn conc(a: u64, b: u64) -> u64 { a * 10_u64.pow((b as f64).log10() as u32 + 1) + b }

    println!("Solution 1: {}", evaluate(&equations, &vec![add, mul]));
    println!("Solution 2: {}", evaluate(&equations, &vec![add, mul, conc]));
}

fn evaluate(equations: &Vec<Equation>, operators: &Vec<fn(u64, u64) -> u64>) -> u64 {
    equations.iter().fold(0, |acc, eq| {
        let operations = (eq.values.len() - 1) as u32;
        let opscnt = operators.len();
        let perms = opscnt.pow(operations);
        for i in 0..perms {
            let result = (0..operations).fold(eq.values[0], |acc, j| {
                let index = (i / opscnt.pow(j)) % opscnt;
                let func = operators[index as usize];
                func(acc, eq.values[(j + 1) as usize])
            });
            if result == eq.result {
                return acc + result;
            }
        }
        acc
    })
}

fn parse(input: &str) -> Vec<Equation> {
    input.lines().map(|line| {
        let parts = line.split(": ").collect::<Vec<&str>>();
        let result = parts[0].parse::<u64>().unwrap();
        let values = parts[1].split_whitespace().map(|x| x.parse::<u64>().unwrap()).collect::<Vec<u64>>();
        Equation { result, values }
    }).collect()
}
