use colored::*;
use grid::Grid;
use rand::Rng;
use std::{collections::HashMap, fs};

const FILENAME: &str = "day12"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let vec: Vec<char> = input.lines().flat_map(|line| line.chars()).collect();
    let grid = Grid::from_vec(vec, input.lines().next().unwrap().len());

    dump(&grid);

    // println!("Solution 1: {}", calc_cost(&grid, true));
    // println!("Solution 2: {}", calc_cost(&grid, false));
}

fn dump(grid: &Grid<char>) {
    let mut cols: HashMap<char, (u8, u8, u8)> = HashMap::new();
    let mut rng = rand::thread_rng();
    for c in 'A'..='Z' {
        let r = rng.gen_range(0..=255);
        let g = rng.gen_range(0..=255);
        let b = rng.gen_range(0..=255);
        cols.insert(c, (r, g, b));
    }

    for row in 0..grid.rows() {
        for col in 0..grid.cols() {
            let plant = grid.get(row as isize, col as isize).unwrap();
            let border = [(0, -1), (0, 1), (-1, 0), (1, 0)].iter().any(|(r, c)| {
                *grid.get(row as isize + r, col as isize + c).unwrap_or(&'0') != *plant
            });

            let (r, g, b) = cols.get(plant).unwrap();
            let colored_plant = plant.to_string().truecolor(*r, *g, *b);

            let mut color = colored_plant;
            if border {
                color = color.on_black();
            }

            print!("{}", color);
        }
        println!();
    }
}
