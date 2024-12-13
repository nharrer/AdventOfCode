use std::fs;

const FILENAME: &str = "day13"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let machines = parse(&input);
    println!("Solution 1: {}", solve2(&machines, 0.0));
    println!("Solution 2: {}", solve2(&machines, 10000000000000.0));
}

fn solve2(machines: &Vec<(f64, f64, f64, f64, f64, f64)>, offset: f64) -> i64 {
    machines.iter().fold(0, |acc, &(ax, ay, bx, by, gx, gy)| {
        let (gx, gy) = (gx  + offset, gy + offset);
        // solve for na and nb in:
        //    ax * na + bx * nb = gx
        //    ay * na + by * nb = gy
        if bx != 0.0 && (by * ax - ay * bx) != 0.0 {
            let na = (by * gx - bx * gy) / (by * ax - ay * bx);
            let nb = (gx - ax * na) / bx;
            // consider only whole number solutions, since we can't press a fraction of the button :-)
            if na.fract() == 0.0 && nb.fract() == 0.0 {
                return acc + (na as i64) * 3 + (nb as i64); // cost
            }
        }
        acc
    })
}

fn parse(input: &str) -> Vec<(f64, f64, f64, f64, f64, f64)> {
    let regex = regex::Regex::new(r"(?s).*? X\+(\d+), Y\+(\d+).*?X\+(\d+), Y\+(\d+).*?X=(\d+), Y=(\d+)").unwrap();
    regex.captures_iter(input).map(|caps| {
        let nums: Vec<f64> = (1..=6).map(|i| caps[i].parse().unwrap()).collect();
        (nums[0], nums[1], nums[2], nums[3], nums[4], nums[5])
    }).collect()
}
