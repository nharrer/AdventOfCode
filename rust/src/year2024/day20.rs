use std::{collections::{HashMap, HashSet}, fs};

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
    path.iter().enumerate().fold(0, |mut acc, (index1, _)| {
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
                        }
                    }
                }
            }
        }
        acc
    })
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
