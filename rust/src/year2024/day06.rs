use std::collections::HashSet;
use std::fs;

const FILENAME: &str = "day06"; // file is in /data/<year>/

struct Game {
    width: i32,
    height: i32,
    guard: (i32, i32),
    objects: HashSet<(i32, i32)>,
}

const DIRECTIONS: [(i32, i32); 4] = [(0, -1), (1, 0), (0, 1), (-1, 0)];

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let game = parse(&input);

    let visited = solve1(&game, (-1, -1)).unwrap();
    println!("Solution 1: {}", visited.len());

    let sol2 = solve2(&game, &visited);
    println!("Solution 2: {}", sol2);
}

fn solve1(game: &Game, obs: (i32, i32)) -> Option<HashSet<(i32, i32)>> {
    let mut visited: HashSet<(i32, i32)> = HashSet::new();
    let mut visited_with_dir: HashSet<(i32, i32, usize)> = HashSet::new();
    let mut guard = game.guard;
    let mut dir = 0;

    while guard.0 >= 0 && guard.0 < game.width && guard.1 >= 0 && guard.1 < game.height {
        if !visited_with_dir.insert((guard.0, guard.1, dir)) {
            return None;    // we are in a loop
        }
        if obs.0 == -1 {
            visited.insert(guard);
        }

        let mut ng = (guard.0 + DIRECTIONS[dir].0, guard.1 + DIRECTIONS[dir].1);
        if game.objects.contains(&ng) || ng == obs {
            ng = guard;
            dir = (dir + 1) % 4;
        }

        guard = ng;
    }

    Some(visited)
}

fn solve2(game: &Game, visited: &HashSet<(i32, i32)>) -> i32 {
    // put an obstacle in each visited spot and check if the guard would loop
    visited.iter().fold(0, |acc, obs| acc + if *obs != game.guard && solve1(&game, *obs).is_none() { 1 } else { 0 })
}

fn parse(input: &str) -> Game {
    let lines: Vec<Vec<char>> = input.lines().map(|line| line.chars().collect()).collect();

    let mut game = Game {
        width: lines[0].len() as i32,
        height: lines.len() as i32,
        guard: (0, 0),
        objects: HashSet::new(),
    };

    for (y, line) in lines.iter().enumerate() {
        for (x, c) in line.iter().enumerate() {
            match c {
                '^' => { game.guard = (x as i32, y as i32); }
                '#' => { game.objects.insert((x as i32, y as i32)); }
                _ => (),
            }
        }
    }

    game
}
