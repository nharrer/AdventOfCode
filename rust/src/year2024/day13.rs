use num::integer::gcd;
use std::fs;

const FILENAME: &str = "day13"; // file is in /data/<year>/

struct Machine {
    delta_a: (i64, i64),
    delta_b: (i64, i64),
    goal: (i64, i64),
}

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let machines = parse(&input);
    println!("Solution 1: {}", solve2(&machines, 0));
    println!("Solution 2: {}", solve2(&machines, 10000000000000));
}

fn solve2(machines: &Vec<Machine>, offset: i64) -> i64 {
    machines.iter().fold(0, |acc, m| {
        if let Some((b, f, a, e)) = determine_steps(m.delta_a.0, m.delta_b.0, m.goal.0 + offset) {
            if let Some((d, h, c, g)) = determine_steps(m.delta_a.1, m.delta_b.1, m.goal.1 + offset) {
                // There are now two equations:
                //    a * na + b = c * nb + d
                //    e * na + f = g * nb + h
                // We can solve this for na and nb. However, we only need one of them:
                let na = (g * (b - d) + c * (h - f)) / (c * e - a * g);
                let (counta, countb) = (a * na + b, e * na + f);

                // Consider only whole number solutions, since we can't push a fraction of button :-).
                if counta.fract() == 0.0 && countb.fract() == 0.0 {
                    let cost = counta as i64 * 3 + countb as i64;
                    return acc + cost;
                }
            }
        }
        acc
    })
}

fn determine_steps(a: i64, b: i64, g: i64) -> Option<(f64, f64, f64, f64)> {
    let gcd = gcd(a, b); // check, if there is even a solution
    if g % gcd != 0 {
        return None;
    }

    // We repeatedly press button A until a solution is found. By examining the first two solutions,
    // we can determine the parameters for a linear function that provides all possible solutions.
    // I'm sure this can be done mathematically, but I'm either too lazy (or too stupid).
    let mut sa = 0;
    let mut sb = 0;
    let mut s = 0;
    loop {
        let xa = s * a;
        let r = g - xa;
        if r % b == 0 {
            if sa == 0 {
                sa = s;                 // number of button A presses for first solution
                sb = r / b;             // number of button B presses for first solution
            } else {
                let da = s - sa;        // A presses between solutions
                let db = (r / b) - sb;  // B presses between solutions
                return Some((sa as f64, sb as f64, da as f64, db as f64));
            }
        }
        s += 1;
    }
}

fn parse(input: &str) -> Vec<Machine> {
    let separator = if cfg!(target_os = "windows") { "\r\n" } else { "\n" };
    let separator = format!("{}{}", separator, separator);
    input.split(&separator).map(|line| {
            let lines: Vec<&str> = line.lines().collect();
            let pa: Vec<i64> = lines[0].split(|c| ['+', ','].contains(&c)).map(|s| s.parse::<i64>().unwrap_or(0)).collect();
            let pb: Vec<i64> = lines[1].split(|c| ['+', ','].contains(&c)).map(|s| s.parse::<i64>().unwrap_or(0)).collect();
            let pr: Vec<i64> = lines[2].split(|c| ['=', ','].contains(&c)).map(|s| s.parse::<i64>().unwrap_or(0)).collect();
            Machine {
                delta_a: (pa[1], pa[3]),
                delta_b: (pb[1], pb[3]),
                goal: (pr[1], pr[3]),
            }
        }).collect()
}
