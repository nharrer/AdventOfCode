use std::{collections::{HashMap, HashSet}, fs};
use colored::*;

const FILENAME: &str = "day20"; // file is in /data/<year>/
const DIR_OFFSET: [(i32, i32); 4] = [(1, 0), (0, 1), (-1, 0), (0, -1)];
type Point = (usize, usize);

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let (positions, path, size) = parse(&input);

    println!("Solution 1: {}", count_cheats(&positions, &path, size, 2, 100));
    println!("Solution 2: {}", count_cheats(&positions, &path, size, 20, 100));
}

fn count_cheats(positions: &HashMap<Point, usize>, path: &Vec<Point>, size: Point, dist: i32, threshold: isize) -> u32 {
    let mut saves_max = 0_u32;
    let ret = path.iter().enumerate().fold(0, |mut acc, (index1, _)| {
        let (px1, py1) = path[index1];
        let (px1, py1) = (px1 as i32, py1 as i32);
        for dy in -dist..=dist {
            let d = dist - dy.abs();
            for dx in -d..=d {
                let (px2, py2) = (px1 + dx, py1 + dy);
                let manhatten = (dx.abs() + dy.abs()) as isize;
                if px2 >= 1 && px2 < size.0 as i32 && py2 >= 1 && py2 < size.1 as i32 && manhatten >= 2 {
                    if let Some(index2) = positions.get(&(px2 as usize, py2 as usize)) {
                        let saves = (*index2 as isize) - (index1 as isize) - manhatten;

                        if saves >= threshold {
                            acc += 1;
                            saves_max = saves_max.max(saves as u32);
                            if saves == 9284 && manhatten == 20 {
                                println!("{} {} {} {} {} {}", px1, py1, px2, py2, saves, manhatten);
                                let start = path[0];
                                let end = path[path.len() - 1];
                                _dump(&path, &size, start, end, (px1 as usize, py1 as usize), (px2 as usize, py2 as usize));
                            }
                        }
                    }
                }
            }
        }
        acc
    });
    println!("Max saves: {}", saves_max);
    ret
}

fn parse(input: &str) -> (HashMap<Point, usize>, Vec<Point>, Point) {
    let mut positions: HashMap<Point, usize> = HashMap::new();
    let (mut start, mut end, mut size) = ((0, 0), (0, 0), (0, 0));
    input.lines().enumerate().for_each(|(r, line)| {
        line.chars().enumerate().for_each(|(c, ch)| {
            let p = (c, r);
            if ch != '#' {
                positions.insert(p, 0);
                if ch == 'S' {
                    start = p;
                } else if ch == 'E' {
                    end = p;
                }
            }
            size = p;
        });
    });
    let mut path: Vec<Point> = Vec::new();
    let mut pool: HashSet<Point> = positions.keys().cloned().collect();
    let mut current = start;
    loop {
        pool.remove(&current);
        positions.insert(current, path.len());
        path.push(current);
        if current == end {
            break;
        }
        for dir in DIR_OFFSET.iter() {
            let new_pos = (((current.0 as i32 + dir.0) as usize), ((current.1 as i32 + dir.1) as usize));
            if pool.contains(&new_pos) {
                current = new_pos;
                break;
            }
        }
    }
    (positions, path, size)
}

fn _dump(path: &Vec<Point>, size: &Point, s: Point, e: Point, m1: Point, m2: Point) {
    let size = (size.0 + 1, size.1 + 1);
    println!("");

    let dx = (m2.0 as i32 - m1.0 as i32).signum();
    let dy = (m2.1 as i32 - m1.1 as i32).signum();
    let mut dc = m1;
    let mut cheat: HashMap<Point, char> = HashMap::new();
    while dc != m2 {
        if dc.1 != m2.1 {
            dc.1 = (dc.1 as i32 + dy) as usize;
            if dc.1 == m2.1 {
                cheat.insert(dc, '┘');
            } else {
                cheat.insert(dc, '│');
            }
        } else if dc.0 != m2.0 {
            dc.0 = (dc.0 as i32 + dx) as usize;
            cheat.insert(dc, '─');
        }
    }


    print!("╔");
    for _ in 0..size.0 {
        print!("═");
    }
    println!("╗");
    for y in 0..size.1 {
        print!("║");
        for x in 0..size.0 {
            let mut cs: ColoredString = '.'.to_string().white();
            if s == (x, y) {
                cs = 'S'.to_string().bright_green()
            } else if e == (x, y) {
                cs = 'E'.to_string().bright_green()
            } else if m1 == (x, y) || m2 == (x, y) {
                cs = 'X'.to_string().bright_red();
            } else if let Some(c) = cheat.get(&(x, y)) {
                cs = c.to_string().bright_red();
            } else if !path.contains(&(x, y)) {
                cs = '#'.to_string().blue();
            }
            print!("{}", cs);
        }
        println!("║");
    }
    print!("╚");
    for _ in 0..size.0 {
        print!("═");
    }
    println!("╝");
    println!("");
}
