use std::fs;
use grid::Grid;

const FILENAME: &str = "day25"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let (locks, keys) = parse(&input);

    println!("Solution 1: {}", solve1(&locks, &keys));
    println!("Solution 2: {}", "Finally done! It was so much fun!");
}

fn solve1(locks: &Vec<Vec<u8>>, keys: &Vec<Vec<u8>>) -> usize {
    locks.iter().flat_map(|lock| {
        keys.iter().filter(move |key| lock.iter().zip(key.iter()).all(|(l, k)| l + k <= 5))
    }).count()
}

fn parse(input: &str) -> (Vec<Vec<u8>>, Vec<Vec<u8>>) {
    let input: String = input.chars().filter(|&c| c != '\r').collect();
    let (mut locks, mut keys) = (Vec::new(), Vec::new());
    for block in input.split("\n\n") {
        let vec: Vec<u8> = block.lines().flat_map(|line| line.chars().map(|c| (c != '.') as u8)).collect();
        let grid = Grid::from_vec(vec, block.lines().next().unwrap().len());
        if grid.iter_row(0).map(|&val| val as u8).sum::<u8>() == 5 {
            locks.push(from_grid(grid));
        } else {
            keys.push(from_grid(grid));
        }
    }
    (locks, keys)
}

fn from_grid(grid: Grid<u8>) -> Vec<u8> {
    (0..grid.cols()).map(|i| grid.iter_col(i).map(|&val| val as u8).sum::<u8>() - 1).collect()
}
