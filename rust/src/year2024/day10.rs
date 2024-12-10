use std::{collections::HashSet, fs};

const FILENAME: &str = "day10"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let map = parse(&input);

    println!("Solution 1: {}", seek(&map, true));
    println!("Solution 2: {}", seek(&map, false));
}

fn seek(map: &Vec<Vec<i32>>, distinct: bool) -> u32 {
    let mut sum = 0_u32;
    for y in 0..map.len() {
        for x in 0..map[0].len() {
            let val1 = map[y][x];
            if val1 == 0 {
                let pos = (x, y);
                let mut visited = HashSet::new();
                let paths = walk(map, &mut visited, pos, distinct);
                let score = paths.len();
                sum += score as u32;
            }
        }
    }
    sum
}

fn walk(map: &Vec<Vec<i32>>, visited: &mut HashSet<(usize, usize)>, pos: (usize, usize), distinct: bool) -> Vec<Vec<(usize, usize)>> {
    let mut ret: Vec<Vec<(usize, usize)>> = vec![];

    if distinct && !visited.insert(pos) {
        return ret;
    }

    let v1 = map[pos.1][pos.0];
    if v1 == 9 {
        ret.push(Vec::from([pos]));
        return ret;
    }

    let w = map[0].len() as isize;
    let h = map.len() as isize;
    for dir in [(-1, 0), (1, 0), (0, -1), (0, 1)] {
        let (x2, y2) = (pos.0 as isize + dir.0, pos.1 as isize + dir.1);
        if x2 >= 0 && y2 >= 0 && x2 < w && y2 < h {
            let (x2, y2) = (x2 as usize, y2 as usize);
            if map[y2][x2] == (v1 + 1) {
                for path in walk(map, visited, (x2, y2), distinct) {
                    let mut p1 = Vec::from([pos]);
                    p1.extend(path);
                    ret.push(p1);
                }
            }
        }
    }
    ret
}


fn parse(input: &str) -> Vec<Vec<i32>> {
    input.lines().map(|line| line.chars().map(|c| {
        if c == '.' { -1 } else { c.to_digit(10).unwrap() as i32 }
    }).collect()).collect()
}
