use regex::Regex;
use std::fs;

const FILENAME: &str = "day02";

const COLORS: [&str; 3] = ["red", "green", "blue"];

const MAX_COLORS: [i32; 3] = [12, 13, 14];

struct Game {
    nr: i32,
    sets: Vec<[i32; 3]>,
}

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let games = read_games(&input);

    let solution1 = solve1(&games);
    println!("Solution 1: {}", solution1);

    let solution2 = solve2(&games);
    println!("Solution 2: {}", solution2);
}

fn solve1(games: &Vec<Game>) -> i32 {
    fn check_game(game: &Game) -> bool {
        for set in &game.sets {
            if set[0] > MAX_COLORS[0] || set[1] > MAX_COLORS[1]|| set[2] > MAX_COLORS[2] {
                return false;
            }
        }
        true
    }

    games
        .iter()
        .filter_map(|g| check_game(g).then_some(g.nr))
        .sum()
}

fn solve2(games: &Vec<Game>) -> i32 {
    fn power_of_game(game: &Game) -> i32 {
        (0..3)
            .map(|i| game.sets.iter().map(|set| set[i]).max().unwrap())
            .fold(1, |c, x| c * x)
    }

    games.iter().map(|g| power_of_game(g)).sum()
}

fn read_games(input: &String) -> Vec<Game> {
    let mut games: Vec<Game> = Vec::new();

    for line in input.lines() {
        let mut game = Game {
            nr: 0,
            sets: Vec::new(),
        };

        let re = Regex::new(r"Game (\d*):(.*)").unwrap();
        if let Some(caps) = re.captures(line) {
            game.nr = caps.get(1).unwrap().as_str().parse::<i32>().unwrap();

            let sets = caps.get(2).unwrap().as_str();
            let sets: Vec<&str> = sets.split(';').map(|s| s.trim()).collect();
            for set in sets {
                let mut colors = [0, 0, 0];
                let parts: Vec<&str> = set.split(',').map(|s| s.trim()).collect();
                for part in parts {
                    let pick: Vec<&str> = part.split(' ').map(|s| s.trim()).collect();
                    if pick.len() != 2 {
                        panic!("Invalid part {}", part);
                    }
                    let cnt = pick[0].parse::<i32>().unwrap();
                    let color_index = COLORS.iter().position(|&c| c == pick[1]).unwrap();
                    colors[color_index] = cnt;
                }
                game.sets.push(colors);
            }
            games.push(game);
        }
    }
    games
}
