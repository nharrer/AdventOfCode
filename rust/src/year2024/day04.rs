use std::{fs, vec};

const FILENAME: &str = "day04"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let map = input.lines().into_iter().map(|l| l.chars().collect()).collect();

    let solutions = solve1(&map);
    println!("Solution 1: {}", solutions.0);
    println!("Solution 2: {}", solutions.1);
}

fn solve1(map: &Vec<Vec<char>>) -> (i32, i32) {
    let (mut cnt1, mut cnt2) = (0, 0);
    let (sizey, sizex) = (map.len() as isize, map[0].len() as isize);

    for y in 0..sizey {
        for x in 0..sizex {
            for (xd, yd) in [(1, 0), (1, -1), (0, -1), (-1, -1), (-1, 0), (-1, 1), (0, 1), (1, 1)] {
                if "XMAS".chars().enumerate().all(|(n, s)| {
                    let nx = x + xd * n as isize;
                    let ny = y + yd * n as isize;
                    nx >= 0 && nx < sizex && ny >= 0 && ny < sizey && map[ny as usize][nx as usize] == s
                }) {
                    cnt1 += 1;
                }
            }

            if x > 0 && x < (sizex - 1) && y > 0 && y < (sizey - 1) {
                let (x, y) = (x as usize, y as usize);
                if map[y][x] == 'A' {
                    let d1 = vec![map[y - 1][x - 1], map[y + 1][x + 1]].into_iter().collect::<String>();
                    let d2 = vec![map[y - 1][x + 1], map[y + 1][x - 1]].into_iter().collect::<String>();
                    if (d1 == "MS" || d1 == "SM") && (d2 == "MS" || d2 == "SM") {
                        cnt2 += 1;
                    }
                }
            }
        }
    }
    (cnt1, cnt2)
}
