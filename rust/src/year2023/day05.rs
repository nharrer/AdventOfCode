use itertools::Itertools;
use std::fs;

const FILENAME: &str = "day05";

#[derive(Debug)]
struct Range {
    source: (u64, u64),
    dest: (u64, u64)
}

#[derive(Debug)]
struct Mapper {
    #[allow(dead_code)]
    name: String,
    ranges: Vec<Range>,
}

impl Mapper {
    fn map(&self, source: u64) -> u64 {
        for range in &self.ranges {
            if source >= range.source.0 && source <= range.source.1 {
                return source - range.source.0 + range.dest.0;
            }
        }
        source
    }

    fn map_interval(&self, source: (u64, u64)) -> Vec<(u64, u64)> {
        let mut intervals: Vec<(u64, u64)> = Vec::new();
        let mut start = source.0;
        for range in &self.ranges {
            if start < range.source.0 {
                if source.1 < range.source.0 {
                    intervals.push((start, source.1));
                    start = source.1 + 1;
                    break;
                }
                intervals.push((start, range.source.0 - 1));
                start = range.source.0;
            }
            if start >= range.source.0 && start <= range.source.1 {
                if source.1 <= range.source.1 {
                    intervals.push((start, source.1));
                    start = source.1 + 1;
                    break;
                }
                intervals.push((start, range.source.1));
                start = range.source.1 + 1;
                if start > source.1 {
                    break;
                }
            }
        }
        if start <= source.1 {
            intervals.push((start, source.1));
        }

        intervals
            .into_iter()
            .map(|(start, end)| (self.map(start), self.map(end)))
            .collect()
    }
}

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let (seeds, mappers) = read_mapper(&input);

    let solution1 = solve1(&seeds, &mappers);
    println!("Solution 1: {}", solution1);

    let solution2 = solve2(&seeds, &mappers);
    println!("Solution 2: {}", solution2);
}

fn solve1(seeds: &Vec<u64>, mappers: &Vec<Mapper>) -> u64 {
    seeds
        .iter()
        .map(|v| mappers.iter().fold(*v, |v, m| m.map(v)))
        .min()
        .unwrap()
}

fn solve2(seeds: &Vec<u64>, mappers: &Vec<Mapper>) -> u64 {
    let mut intervals: Vec<(u64, u64)> = seeds
        .iter()
        .tuples()
        .map(|(start, len)| (*start, *start + len - 1))
        .collect();

    for mapper in mappers {
        intervals = intervals
            .into_iter()
            .flat_map(|interval| mapper.map_interval(interval))
            .collect();
    }

    intervals
        .into_iter()
        .map(|interval| interval.0)
        .min()
        .unwrap()
}

fn read_mapper(input: &str) -> (Vec<u64>, Vec<Mapper>) {
    let mut seeds: Vec<u64> = Vec::new();
    let mut mappers: Vec<Mapper> = Vec::new();

    for line in input.lines() {
        if seeds.is_empty() {
            let seeds_str = line.split_once(':').unwrap().1.trim();
            seeds = seeds_str.split(' ').map(|x| x.parse().unwrap()).collect();
        } else {
            if !line.trim().is_empty() {
                if line.contains("map") {
                    let name = line.split_once(' ').unwrap().0;
                    let m = Mapper {
                        name: name.to_string(),
                        ranges: Vec::new(),
                    };
                    mappers.push(m);
                } else {
                    let numbers = line
                        .split(' ')
                        .map(|x| x.parse().unwrap())
                        .collect::<Vec<u64>>();
                    let range = Range {
                        source: (numbers[1], numbers[1] + numbers[2] - 1),
                        dest: (numbers[0], numbers[0] + numbers[2] - 1)
                    };
                    if let Some(mapper) = mappers.last_mut() {
                        mapper.ranges.push(range);
                    }
                }
            }
        }
    }

    // sort ranges by source
    for m in &mut mappers {
        m.ranges.sort_by(|a, b| a.source.cmp(&b.source));
    }

    (seeds, mappers)
}
