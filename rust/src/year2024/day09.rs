use std::{fs, ops::Range};
use rangemap::RangeMap;

const FILENAME: &str = "day09"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let map = parse(&input);

    println!("Solution 1: {}", solve1(&map));
    println!("Solution 2: {}", solve2(&map));
}

fn solve1(map: &RangeMap<u32, u32>) -> u64 {
    let mut map = map.clone();

    let outer_range = 0..map.last_range_value().unwrap().0.end;
    while let Some(gap) = map.gaps(&outer_range).next() { // get the first gap
        let gap_size = gap.end - gap.start;
        if gap.end == outer_range.end {
            break;
        }

        let (block_range, id) = {
            let (block_range, id) = map.last_range_value().unwrap();
            (block_range.clone(), *id)
        };
        let block_size = block_range.end - block_range.start;

        if block_size >= gap_size {
            map.remove(block_range.start + block_size - gap_size..block_range.end);
            map.insert(gap, id);
        } else {
            map.remove(block_range);
            map.insert(gap.start..gap.start + block_size, id);
        }
    }

    checksum(&map)
}

fn solve2(map: &RangeMap<u32, u32>) -> u64 {
    let mut map = map.clone();

    let files: Vec<(Range<u32>, u32)> = map.iter().map(|(range, id)| (range.clone(), *id)).rev().collect();
    for (range, id) in files {
        let file_size = range.end - range.start;
        // we could speed this up by using a hash map of gap sizes, but it's fast enough
        for gap in map.gaps(&(0..range.start)) {
            let gap_size = gap.end - gap.start;
            if gap_size >= file_size {
                map.remove(range);
                map.insert(gap.start..gap.start + file_size, id);
                break;
            }
        }
    }

    checksum(&map)
}

fn checksum(map: &RangeMap<u32, u32>) -> u64 {
    map.iter()
        .map(|(range, id)| (range.start as u64..range.end as u64, *id as u64))
        .fold(0, |acc, (range, id)| acc + range.sum::<u64>() * id)
}

fn parse(input: &str) -> RangeMap<u32, u32> {
    let mut map: RangeMap<u32, u32> = RangeMap::new();
    let mut pos = 0;
    let line = input.lines().next().unwrap();
    for (i, c) in line.chars().enumerate() {
        let s: u32 = c.to_digit(10).unwrap();
        if i % 2 == 0 {
            let id = (i >> 1) as u32;
            map.insert(pos..pos + s, id);
        }
        pos += s;
    }
    map
}
