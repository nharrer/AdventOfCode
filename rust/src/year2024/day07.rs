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
        let calc_cnt = (eq.values.len() - 1) as u32;
        let ops_cnt = operators.len();
        let perms = ops_cnt.pow(calc_cnt);
        (0..perms).map(|i| {
            (0..calc_cnt).fold(eq.values[0], |acc, j| {
                let index = (i / ops_cnt.pow(j)) % ops_cnt;
                let func = operators[index as usize];
                func(acc, eq.values[(j + 1) as usize])
            })
        }).find(|&x| x == eq.result).unwrap_or(0) + acc
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
