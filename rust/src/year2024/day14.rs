use std::fs::{self, File};
use std::borrow::Cow;
use grid::Grid;
use gif::{Encoder, Frame, Repeat};
use std::collections::HashMap;
use std::f64::consts::E;

const FILENAME: &str = "day14"; // file is in /data/<year>/

type Point = (i32, i32);
type Robot = (Point, Point);

// const SPACE: Point = (11, 7);
const SPACE: Point = (101, 103);
const STEPS: usize = 10000;

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let robots = parse(&input);

    let (sol1, sol2) = solve1(&robots);

    println!("Solution 1: {}", sol1);
    println!("Solution 2: {}", sol2);
}

fn solve1(robots: &Vec<Robot>) -> (u32, u32) {
    let mut robots = robots.clone();
    let mut sol = 0;

    let mut min_entropy: (f64, u32) = (1.0, 0);

    for s in 1..=STEPS {
        for r in robots.iter_mut() {
            let (p, v) = *r;
            r.0 = move_point(p, v);
        }

        let entropy = calculate_entropy(&robots);
        if entropy < min_entropy.0 {
            min_entropy = (entropy, s as u32);
            create_gif(s, &robots);
        }

        if s == 100 {
            let (mh, mv) = (SPACE.0 / 2, SPACE.1 / 2);
            let quadrants = [
                ((0, 0), (mh - 1, mv - 1)),
                ((mh + 1, 0), (SPACE.0 - 1, mv - 1)),
                ((0, mv + 1), (mh - 1, SPACE.1 - 1)),
                ((mh + 1, mv + 1), (SPACE.0 - 1, SPACE.1 - 1))
            ];
            sol = quadrants.into_iter().map(|((x1, y1), (x2, y2))| {
                robots.iter().filter(|((x, y), _)| *x >= x1 && *x <= x2 && *y >= y1 && *y <= y2).count()
            }).fold(1, |acc, c| acc * c as u32)
        }
    }
    (sol, min_entropy.1)
}

fn move_point(p: Point, v: Point) -> Point {
    let x = (((p.0 + v.0) % SPACE.0) + SPACE.0) % SPACE.0;
    let y = (((p.1 + v.1) % SPACE.1) + SPACE.1) % SPACE.1;
    (x, y)
}

fn calculate_entropy(robots: &Vec<Robot>) -> f64 {
    let grid = robots.iter().fold(Grid::new(SPACE.1 as usize, SPACE.0 as usize), |mut grid, r| {
        *grid.get_mut(r.0.1 as usize, r.0.0 as usize).unwrap() += 1;
        grid
    });

    let data: Vec<i32> = grid.iter().cloned().collect();
    let mut frequency_map: HashMap<i32, usize> = HashMap::new();
    for &value in &data {
        *frequency_map.entry(value).or_insert(0) += 1;
    }

    let total_cells = data.len() as f64;
    let mut entropy = 0.0;
    for &count in frequency_map.values() {
        let probability = count as f64 / total_cells;
        entropy -= probability * probability.ln() / E.ln();
    }

    entropy
}

fn create_gif(s: usize, robots: &Vec<Robot>) {
    let grid: Grid<i32> = robots.iter().fold(Grid::new(SPACE.1 as usize, SPACE.0 as usize), |mut grid, r| {
        *grid.get_mut(r.0.1 as usize, r.0.0 as usize).unwrap() += 1;
        grid
    });

    let entropy = calculate_entropy(&robots);

    if entropy > 0.194 {
        return;
    }

    let dir = "robots";
    fs::create_dir_all(dir).unwrap();
    let file = format!("{dir}/output{s}.gif");

    // convert grid into gif
    let mut image = File::create(file.clone()).unwrap();
    let palette = &[0x00, 0x00, 0x00, 0x00, 0xFF, 0x00];
    let mut encoder = Encoder::new(&mut image, SPACE.0 as u16, SPACE.1 as u16, palette).unwrap();
    encoder.set_repeat(Repeat::Infinite).unwrap();

    let mut frame = Frame::default();
    frame.width = SPACE.0 as u16;
    frame.height = SPACE.1 as u16;
    let binding = grid.iter().map(|&c| if c == 0 { 0 } else { 1 }).collect::<Vec<u8>>();
    frame.buffer = Cow::Borrowed(&binding);
    encoder.write_frame(&frame).unwrap();

    println!("wrote file {}, entrpoy: {}", file, entropy);
}

fn parse(input: &str) -> Vec<Robot> {
    let regex = regex::Regex::new(r"(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)").unwrap();
    regex.captures_iter(input).map(|caps| {
        let nums: Vec<i32> = (1..=4).map(|i| caps[i].parse().unwrap()).collect();
        ((nums[0], nums[1]), (nums[2], nums[3]))
    }).collect()
}
