use itertools::Itertools;
use std::fs;

const FILENAME: &str = "day17"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let mut computer = parse(&input);
    println!("Solution 1: {}", solve1(&mut computer));
    println!("Solution 2: {}", solve2(&mut computer, &Vec::new()).unwrap());
}

fn solve1(computer: &mut Computer) -> String {
    computer.run(computer.registers[0]);
    computer.output.iter().map(|&o| o.to_string()).join(",")
}

fn solve2(computer: &mut Computer, indices: &Vec<u64>) -> Option<u64> {
    // calculate the start position based on the digit indices already found
    let start = indices.iter().rev().enumerate().fold(0, |acc, (i, &d)| acc + d * 8_u64.pow(i as u32 + 1));

    let data_to_find = computer.program[computer.program.len() - indices.len() - 1];
    for i in 0..8 {
        let rega = start + i;
        computer.run(rega);

        if computer.output[0] == data_to_find {
            if computer.program == computer.output {
                return Some(rega);
            }

            let mut indices2 = indices.clone();
            indices2.push(i as u64);
            if let Some(f) = solve2(computer, &indices2) {
                return Some(f);
            }
        }
    }
    None
}

fn parse(input: &str) -> Computer {
    let mut computer = Computer::new();
    let regex = regex::Regex::new(r"(Register (.): (\d+)|Program: ([\d,]*))").unwrap();
    for caps in regex.captures_iter(input) {
        if let Some(reg_match) = caps.get(2) {
            let reg = reg_match.as_str().chars().next().unwrap() as usize - 'A' as usize;
            computer.registers[reg] = caps[3].parse::<u64>().unwrap();
        } else if let Some(prog_match) = caps.get(4) {
            computer.program = prog_match.as_str().split(',').map(|s| s.parse().unwrap()).collect();
        }
    }
    computer
}

struct Computer {
    registers: [u64; 3],
    program: Vec<u8>,
    ip: usize,
    output: Vec<u8>
}

impl Computer {
    fn new() -> Self {
        Self { registers: [0; 3], program: Vec::new(), ip: 0, output: Vec::new() }
    }

    fn run(&mut self, rega: u64) {
        self.registers = [rega, 0, 0];
        self.output.clear();
        self.ip = 0;
        loop {
            if self.ip >= (self.program.len() - 1) {
                break;
            }
            let opcode = self.program[self.ip];
            let operand = self.program[self.ip + 1];
            self.execute(opcode, operand);
        }
    }

    fn combo_value(&self, operand: u8) -> u64 {
        match operand {
            0..=3 => operand as u64,
            4..=6 => self.registers[operand as usize - 4],
            _ => panic!("Invalid combo operand: {}", operand),
        }
    }

    fn execute(&mut self, opcode: u8, operand: u8) {
        match opcode {
            0 => { // adv
                let rega = self.registers[0];
                let value = self.combo_value(operand);
                self.registers[0] = rega / 2_u64.pow(value as u32);
                self.ip += 2;
            },
            1 => { // bxl
                let regb = self.registers[1];
                self.registers[1] = regb ^ operand as u64;
                self.ip += 2;
            },
            2 => { // bst
                let value = self.combo_value(operand);
                self.registers[1] = value % 8;
                self.ip += 2;
            },
            3 => { // jnz
                if self.registers[0] == 0 {
                    self.ip += 2;
                } else {
                    self.ip = operand as usize;
                }
            },
            4 => { // bxc
                let regb = self.registers[1];
                let regc = self.registers[2];
                self.registers[1] = regb ^ regc;
                self.ip += 2;
            },
            5 => { // out
                let value = self.combo_value(operand);
                self.output.push((value % 8) as u8);
                self.ip += 2;
            },
            6 => { // bdv
                let rega = self.registers[0];
                let value = self.combo_value(operand);
                self.registers[1] = rega / 2_u64.pow(value as u32);
                self.ip += 2;
            },
            7 => { // cdv
                let rega = self.registers[0];
                let value = self.combo_value(operand);
                self.registers[2] = rega / 2_u64.pow(value as u32);
                self.ip += 2;
            },
            _ => panic!("Unknown opcode: {}", opcode)
        }
    }
}
