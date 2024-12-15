use std::{collections::{HashMap, HashSet}, fs, vec};
use grid::Grid;

const FILENAME: &str = "day15"; // file is in /data/<year>/

const DIR_CHAR: [char; 4] = ['>', 'v', '<', '^'];
const DIR_OFFSET: [(i32, i32); 4] = [(0, 1), (1, 0), (0, -1), (-1, 0)];

type Position = (usize, usize);

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let (map, moves) = parse(&input);

    println!("Solution 1: {}", solve1(&map, &moves));
    println!("Solution 2: {}", solve2(&map, &moves));
}

fn solve1(map: &HashMap<Position, u32>, moves: &Vec<usize>) -> usize {
    let mut map = map.clone();
    let mut objects: HashMap<u32, (Position, usize)> = map.iter()
        .filter(|(_, &s)| s >= 2) // only moveable objects, so no walls
        .fold(HashMap::new(), |mut acc, (&p1, &o)| {
            if let Some(&(p2, size)) = acc.get(&o) {
                let p = (p1.0, p1.1.min(p2.1));
                acc.insert(o, (p, size + 1));
            } else {
                acc.insert(o, (p1, 1));
            }
            acc
        });

    moves.iter().for_each(|&m| move_robot(&mut map, &mut objects, m));

    objects.iter().filter(|(&o, _)| o >= 3).map(|(_, &((r, c), _))| r * 100 + c).sum()
}

fn solve2(map: &HashMap<Position, u32>, moves: &Vec<usize>) -> usize {
    let mut map2: HashMap<Position, u32> = HashMap::new();
    map.iter().for_each(|(&(r, c), &s)| {
        map2.insert((r, c * 2), s);
        if s != 2 {
            map2.insert((r, c * 2 + 1), s);
        }
    });
    solve1(&map2, moves)
}

fn move_robot(map: &mut HashMap<Position, u32>, objects: &mut HashMap<u32, (Position, usize)>, dir: usize) {
    let (robot, _) = *objects.get(&2).unwrap();
    let delta = DIR_OFFSET[dir];
    let (_, moved) = can_move(map, objects, robot, dir, &delta);

    let mut tempmap: HashMap<Position, u32> = HashMap::new();
    for o in moved {
        let &(pos, l) = objects.get(&o).unwrap();
        for co in 0..l {
            let pos1 = (pos.0, pos.1 + co);
            let pos2 = ((pos1.0 as i32 + delta.0) as usize, (pos1.1 as i32 + delta.1) as usize);
            map.remove(&pos1);
            tempmap.insert(pos2, o);
            if co == 0 {
                objects.insert(o, (pos2, l));
            }
        }
    }
    map.extend(tempmap);
}

fn can_move(map: &HashMap<Position, u32>, objects: &HashMap<u32, (Position, usize)>, pos: Position, dir: usize, delta: &(i32, i32)) -> (bool, HashSet<u32>) {
    let mut moved = HashSet::new();
    let posn = ((pos.0 as i32 + delta.0) as usize, (pos.1 as i32 + delta.1) as usize);
    let (object, object_next) = (*map.get(&pos).unwrap_or(&0), *map.get(&posn).unwrap_or(&0));
    if object_next == 1 { // wall
        return (false, moved);
    } else if object_next >= 2 { // robot or crate
        let &(pos, size) = objects.get(&object_next).unwrap();
        let pos_to_replace = match dir {
            0 => vec![(pos.0, pos.1 - 1 + size)],
            2 => vec![(pos.0, pos.1)],
            _ => vec![(pos.0, pos.1), (pos.0, pos.1 - 1 + size)],
        };
        for (nr, nc) in pos_to_replace {
            let (ok, moved2) = can_move(map, objects, (nr, nc), dir, delta);
            if !ok {
                return (false, HashSet::new());
            }
            moved.extend(moved2);
        }
    }
    moved.insert(object);
    (true, moved)
}

fn parse(input: &str) -> (HashMap<Position, u32>, Vec<usize>) {
    let line_separator = if cfg!(target_os = "windows") { "\r\n" } else { "\n" };
    let blocks = input.split(line_separator.repeat(2).as_str()).collect::<Vec<&str>>();
    let (b1, b2) = (blocks[0].replace(&['\n', '\r'][..], ""), blocks[1].replace(&['\n', '\r'][..], ""));

    let mut cnt = 2;
    let grid = Grid::from_vec(b1.chars().collect(), input.lines().next().unwrap().len());
    let map: HashMap<Position, u32> = grid.indexed_iter().filter(|(_, &s)| s != '.').map(|((r, c), &s)| {
        ((r, c), match s {
            '#' => 1,                   // wall = 1
            '@' => 2,                   // robot = 2
            _ => { cnt += 1; cnt },     // box = 3, 4, ...
        })
    }).collect();

    let moves = b2.chars().map(|c| DIR_CHAR.iter().position(|&d| d == c).unwrap()).collect::<Vec<usize>>();
    (map, moves)
}
