use itertools::Itertools;
use std::collections::HashMap;
use std::fs;

const FILENAME: &str = "day05"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let (orders, updates) = parse(&input);
    let (sol1, sol2) = solve1(&orders, &updates);

    println!("Solution 1: {}", sol1);
    println!("Solution 2: {}", sol2);
}

fn solve1(orders: &Vec<(i32, i32)>, updates: &Vec<Vec<i32>>) -> (i32, i32) {
    let mut sum1 = 0;
    let mut sum2 = 0;
    for update1 in updates {
        let mut update2 = update1.clone();
        let mut map: HashMap<i32, usize> = update2.iter().enumerate().map(|(i, n)| (*n, i)).collect();
        let mut round = 0;
        let mut ok = false;
        while !ok {
            ok = orders.iter().all(|(n1, n2)| {
                if let (Some(&i1), Some(&i2)) = (map.get(n1), map.get(n2)) {
                    if i2 < i1 {
                        let tmp = update2[i1];
                        update2[i1] = update2[i2];
                        update2[i2] = tmp;
                        map.insert(*n1, i2);
                        map.insert(*n2, i1);
                        return false;
                    }
                }
                true
            });
            round += 1;
        }
        if round == 1 {
            sum1 += *update1.get(update1.len() / 2).unwrap();
        } else {
            sum2 += *update2.get(update2.len() / 2).unwrap();
        }
    }
    (sum1, sum2)
}

fn parse(input: &str) -> (Vec<(i32, i32)>, Vec<Vec<i32>>) {
    let mut orders: Vec<(i32, i32)> = Vec::new();
    let mut updates: Vec<Vec<i32>> = Vec::new();
    let mut part1 = true;
    for line in input.lines() {
        if line.is_empty() {
            part1 = false;
            continue;
        }
        if part1 {
            orders.push(line.split('|').map(|s| s.parse().unwrap()).tuple_windows().collect::<Vec<(i32, i32)>>()[0]);
        } else {
            updates.push(line.split(',').map(|s| s.parse().unwrap()).collect::<Vec<i32>>());
        }
    }
    (orders, updates)
}
