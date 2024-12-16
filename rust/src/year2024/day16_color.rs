use grid::Grid;
use std::collections::{HashMap, HashSet, VecDeque};
use std::{fs, u32};
use colored::*;

const FILENAME: &str = "day16"; // file is in /data/<year>/
const DIR_OFFSET: [(i32, i32); 4] = [(0, 1), (1, 0), (0, -1), (-1, 0)];

type Position = (usize, usize);
type Player = (Position, usize);

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let (grid, player) = parse(&input);
    let (sol1, sol2) = seek(&grid, player);
    println!("Solution 1: {}", sol1);
    println!("Solution 2: {}", sol2);
}

fn seek(grid: &Grid<char>, player: Player) -> (u32, usize) {
    let mut min_cost = u32::MAX;
    let mut paths: HashSet<Position> = HashSet::new();
    let mut best: HashMap<(Position, usize), u32> = HashMap::new();
    let mut stack: VecDeque<(Player, u32, HashSet<Position>)> = VecDeque::new();
    stack.push_back((player, 0, HashSet::new()));
    while let Some(((pos, dir), current_cost, path)) = stack.pop_front() {
        let c = *grid.get(pos.0, pos.1).unwrap();
        if c == 'E' {
            if current_cost <= min_cost {
                if current_cost < min_cost {
                    paths.clear();
                }
                paths.extend(path);
                min_cost = current_cost;
            }
        } else if c != '#' {
            let cost_local_min = *best.get(&(pos, dir)).unwrap_or(&u32::MAX);
            if current_cost <= cost_local_min {
                best.insert((pos, dir), current_cost);
                [(dir, 1), ((dir + 1) % 4, 1001), ((dir + 3) % 4, 1001)].into_iter().for_each(|(d, cost)| {
                    let new_pos = ((pos.0 as i32 + DIR_OFFSET[d].0) as usize, (pos.1 as i32 + DIR_OFFSET[d].1) as usize);
                    let mut path2 = path.clone();
                    path2.insert(new_pos);
                    stack.push_back(((new_pos, d), current_cost + cost, path2));
                });
            }
        }
    }

    dump(&grid, &paths);

    (min_cost, paths.len() + 1)
}

fn dump(grid: &Grid<char>, paths: &HashSet<Position>) {
    for y in 0..grid.rows() {
        for x in 0..grid.cols() {
            let c = grid.get(y, x).unwrap();
            if *c == 'E' || *c == 'S' {
                print!("{}", c.to_string().red());
            } else if paths.contains(&(y, x)) {
                print!("{}", "O".green());
            } else if *c == '#' {
                print!("{}", c.to_string().blue());
            } else {
                print!(".");
            }
        }
        println!();
    }
    println!();
}

fn parse(input: &str) -> (Grid<char>, Player) {
    let chars: Vec<char> = input.chars().filter(|&c| c != '\n' && c != '\r').collect();
    let grid = Grid::from_vec(chars, input.lines().next().unwrap().len());
    let player: Player = ((grid.rows() - 2, 1), 0);
    (grid, player)
}
