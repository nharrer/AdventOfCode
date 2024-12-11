use std::{collections::HashSet, fs};
use grid::Grid;
use colored::*;

const FILENAME: &str = "day10"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let vec: Vec<u32> = input.lines().flat_map(|line| line.chars().map(|c| c.to_digit(10).unwrap_or(10))).collect();
    let grid = Grid::from_vec(vec, input.lines().next().unwrap().len());
    println!("Solution 1: {}", seek(&grid, true));
    println!("Solution 2: {}", seek(&grid, false));
}

fn seek(grid: &Grid<u32>, distinct: bool) -> u32 {
    let mut visited_all = HashSet::new();
    let sum = grid.indexed_iter().filter(|(_, &v)| v == 0).map(|(pos, _)| {
        let mut visited = HashSet::new();
        let p = walk(grid, &mut visited, (pos.0 as isize, pos.1 as isize), distinct);
        visited_all.extend(visited);
        p

    }).sum();
    dump(grid, &visited_all);
    sum
}

fn walk(grid: &Grid<u32>, visited: &mut HashSet<(isize, isize)>, pos: (isize, isize), distinct: bool) -> u32 {
    if distinct && !visited.insert(pos) {
        return 0;
    }
    let v1 = *grid.get(pos.0, pos.1).unwrap();
    if v1 == 9 {
        return 1;
    }
    [(-1, 0), (1, 0), (0, -1), (0, 1)].iter().map(|dir| {
        let (r, c) = (pos.0 + dir.0, pos.1 + dir.1);
        if let Some(v2) = grid.get(r, c) {
            if *v2 == (v1 + 1) {
                return walk(grid, visited, (r, c), distinct)
            }
        }
        0
    }).sum()
}

fn dump(grid: &Grid<u32>, visited_all: &HashSet<(isize, isize)>) {
    println!();
    for (pos, &v) in grid.indexed_iter() {
        if v == 0 {
            print!("{}", v.to_string().green());
        } else if v == 9 {
            print!("{}", v.to_string().blue());
        } else if visited_all.contains(&(pos.0 as isize, pos.1 as isize)) {
            print!("{}", v.to_string().red());
        } else {
            print!("{}", v);
        }
        if pos.1 == grid.size().1 - 1 {
            println!();
        }
    }
    println!();
}
