use std::{fs, u32};
use std::collections::{HashMap, HashSet};
use priority_queue::PriorityQueue;
use colored::*;

const FILENAME: &str = "day18"; // file is in /data/<year>/
const DIR_OFFSET: [(i32, i32); 4] = [(1, 0), (0, 1), (-1, 0), (0, -1)];
type Position = (usize, usize);

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let bytes: Vec<Position> = input.lines().map(|line| {
        let mut parts = line.split(',').map(|x| x.parse::<usize>().unwrap());
        (parts.next().unwrap() as usize, parts.next().unwrap() as usize)
    }).collect();
    let (start, size) = if bytes.len() > 1024 { (1024, 71) } else { (12, 7) };

    let mut sol1 = u32::MAX;
    let mut fallen: HashSet<Position> = bytes.iter().take(start - 1).copied().collect();
    let mut last_path: Vec<Position> = Vec::new();
    for (i, byte) in bytes.iter().skip(start - 1).enumerate() {
        fallen.insert(*byte);
        let (s, p) = seek(&fallen, size, i == 1911);
        if let Some(sol) = s {
            sol1 = sol.min(sol1);
        } else {
            println!("Last block at {}", i);
            _dump(&fallen, &last_path, *byte, size);
            println!("Solution 1: {}", sol1);
            println!("Solution 1: {},{}", byte.0, byte.1);
            break;
        }
        last_path = p;
    }
}

fn seek(fallen: &HashSet<Position>, size: usize, get_path: bool) -> (Option<u32>, Vec<Position>) {
    let goal: Position = (size - 1, size - 1);
    let mut best: HashMap<Position, u32> = HashMap::new();
    let mut min_cost: Option<u32> = None;
    let mut min_path: Vec<Position> = Vec::new();
    let mut pq = PriorityQueue::new();
    pq.push(((0, 0), Vec::new()), 0_i32);
    while let Some(((player, path), current_cost)) = pq.pop() {
        let current_cost = -current_cost as u32;
        if player == goal {
            if current_cost < min_cost.unwrap_or(u32::MAX) {
                min_cost = Some(current_cost);
                min_path = path.clone();
            }
        }

        let cost_local_min = *best.get(&player).unwrap_or(&u32::MAX);
        if current_cost < cost_local_min {
            best.insert(player, current_cost);
            for dir in DIR_OFFSET.iter() {
                let new_pos = ((player.0 as i32 + dir.0), (player.1 as i32 + dir.1));
                if new_pos.0 < 0 || new_pos.0 >= size as i32 || new_pos.1 < 0 || new_pos.1 >= size as i32 {
                    continue;
                }
                let new_pos = (new_pos.0 as usize, new_pos.1 as usize);
                if !fallen.contains(&new_pos) {
                    let path2 = if get_path {
                        let mut path2 = path.clone();
                        path2.push(new_pos);
                        path2
                    } else { Vec::new() };
                    pq.push((new_pos, path2), -((current_cost + 1) as i32));
                }
            }
        }
    }
    (min_cost, min_path)
}

fn _dump(fallen: &HashSet<Position>, path: &Vec<Position>, byte: Position, size: usize) {
    println!("");
    print!("╔");
    for _ in 0..size {
        print!("═");
    }
    println!("╗");
    for y in 0..size {
        print!("║");
        for x in 0..size {
            let mut cs: ColoredString = '.'.to_string().white();
            if (x, y) == byte {
                cs = 'X'.to_string().bright_red().on_red();
            } else if path.contains(&(x, y)) {
                cs = 'O'.to_string().bright_green();
            } else if fallen.contains(&(x, y)) {
                cs = '#'.to_string().blue();
            }
            print!("{}", cs);
        }
        println!("║");
    }
    print!("╚");
    for _ in 0..size {
        print!("═");
    }
    println!("╝");
    println!("");
}

