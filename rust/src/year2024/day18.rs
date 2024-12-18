use std::{fs, u32};
use std::collections::{HashMap, HashSet};
use priority_queue::PriorityQueue;

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
    for byte in bytes.iter().skip(start - 1) {
        fallen.insert(*byte);
        if let Some(sol) = seek(&fallen, size) {
            sol1 = sol.min(sol1);
        } else {
            println!("Solution 1: {}", sol1);
            println!("Solution 2: {},{}", byte.0, byte.1);
            break;
        }
    }
}

fn seek(fallen: &HashSet<Position>, size: usize) -> Option<u32> {
    let goal: Position = (size - 1, size - 1);
    let mut best: HashMap<Position, u32> = HashMap::new();
    let mut min_cost: Option<u32> = None;
    let mut pq = PriorityQueue::new();
    pq.push((0, 0), 0_i32);
    while let Some((player, current_cost)) = pq.pop() {
        let current_cost = -current_cost as u32;
        if player == goal {
            if current_cost < min_cost.unwrap_or(u32::MAX) {
                min_cost = Some(current_cost);
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
                    pq.push(new_pos, -((current_cost + 1) as i32));
                }
            }
        }
    }
    min_cost
}
