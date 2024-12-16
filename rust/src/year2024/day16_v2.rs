use grid::Grid;
use std::collections::{HashMap, HashSet};
use std::{fs, u32};
use priority_queue::PriorityQueue;

const FILENAME: &str = "day16"; // file is in /data/<year>/
const DIR_OFFSET: [(i32, i32); 4] = [(0, 1), (1, 0), (0, -1), (-1, 0)];

type Position = (usize, usize);
type Player = (Position, usize);

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let (grid, player) = parse(&input);
    let mut best: HashMap<(Position, usize), u32> = HashMap::new();
    let (sol1, _) = seek(&grid, player, &mut best, false);
    let (_, sol2) = seek(&grid, player, &mut best, true);
    println!("Version 2");
    println!("Solution 1: {}", sol1);
    println!("Solution 2: {}", sol2);
}

fn seek(grid: &Grid<char>, player: Player, best: &mut HashMap<(Position, usize), u32>, part2: bool) -> (u32, usize) {
    let mut min_cost = u32::MAX;
    let mut paths: HashSet<Position> = HashSet::new();
    let mut pq = PriorityQueue::new();
    let vec: Vec<Position> = Vec::new();
    pq.push((player, vec), 0_i32);
    while let Some((((pos, dir), path), current_cost)) = pq.pop() {
        let current_cost = -current_cost as u32;
        let c = *grid.get(pos.0, pos.1).unwrap();
        if c == 'E' {
            if current_cost <= min_cost {
                if current_cost < min_cost {
                    paths.clear();
                }
                paths.extend(path);
                min_cost = current_cost;
                println!("Found solution with cost: {}", min_cost);
            }
        } else if c != '#' {
            let cost_local_min = *best.get(&(pos, dir)).unwrap_or(&u32::MAX);
            if current_cost <= cost_local_min {
                best.insert((pos, dir), current_cost);
                [(dir, 1), ((dir + 1) % 4, 1001), ((dir + 3) % 4, 1001)].into_iter().for_each(|(d, cost)| {
                    let new_pos = ((pos.0 as i32 + DIR_OFFSET[d].0) as usize, (pos.1 as i32 + DIR_OFFSET[d].1) as usize);
                    let path2 = if part2 {
                        let mut path2 = path.clone();
                        path2.push(new_pos);
                        path2
                    } else { Vec::new() };
                    pq.push(((new_pos, d), path2), -((current_cost + cost) as i32));
                });
            }
        }
    }
    (min_cost, paths.len() + 1)
}

fn parse(input: &str) -> (Grid<char>, Player) {
    let chars: Vec<char> = input.chars().filter(|&c| c != '\n' && c != '\r').collect();
    let grid = Grid::from_vec(chars, input.lines().next().unwrap().len());
    let player: Player = ((grid.rows() - 2, 1), 0);
    (grid, player)
}
