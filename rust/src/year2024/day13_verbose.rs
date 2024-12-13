use memoize::memoize;
use num::integer::gcd;
use std::fs;

const FILENAME: &str = "day13"; // file is in /data/<year>/

#[derive(Debug, Eq, Hash, PartialEq)]
struct Machine {
    delta_a: (i64, i64),
    delta_b: (i64, i64),
    goal: (i64, i64),
}

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let machines = parse(&input);

    println!("Solution 1: {}", solve1(&machines));

    let machines2 = machines.iter().map(|m| Machine {
        delta_a: m.delta_a,
        delta_b: m.delta_b,
        goal: (m.goal.0 + 10000000000000, m.goal.1 + 10000000000000),
    }).collect();
    println!("Solution 2: {}", solve2(&machines2));
}

#[allow(dead_code)]
fn solve1(machines: &Vec<Machine>) -> i64 {
    let mut sum = 0;
    for machine in machines {
        if let Some((s, _, _)) = solve1_1(machine) {
            sum += s;
        }
    }
    sum
}

fn solve1_1(machine: &Machine) -> Option<(i64, i64, i64)> {
    let mut min = (i64::MAX, (0_i64, 0_i64));
    for a in 0..=100 {
        for b in 0..=100 {
            let xd = a * machine.delta_a.0 + b * machine.delta_b.0;
            let yd = a * machine.delta_a.1 + b * machine.delta_b.1;
            let cost = a * 3 + b;
            if (xd, yd) == machine.goal {
                if cost < min.0 {
                    min = (cost, (a, b));
                }
            }
        }
    }
    if min.0 != i64::MAX {
        Some((min.0, min.1 .0, min.1 .1))
    } else {
        None
    }
}

fn solve2(machines: &Vec<Machine>) -> i64 {
    let mut sum = 0;
    for m in machines {
        println!("\n===============================================================");
        println!("Machine: {:?}", m);

        // let sol1 = solve1_1(m);
        // if let Some((s1, a1, b1)) = sol1 {
        //     println!("Solution: {:?} = {}", (a1, b1), s1);
        // } else {
        //     println!("Solution: Keine");
        // }
        // let s1 = sol1.unwrap_or((0, 0, 0)).0;
        // println!("---------------------------------------------------------------");
        // analyze(m);
        // println!("---------------------------------------------------------------");

        let gx = m.goal.0;
        let dxa = m.delta_a.0;
        let dxb = m.delta_b.0;

        let gy = m.goal.1;
        let dya = m.delta_a.1;
        let dyb = m.delta_b.1;

        let mut s2 = 0;
        if let Some((b, f, a, e)) = get_steps(dxa, dxb, gx) {
            if let Some((d, h, c, g)) = get_steps(dya, dyb, gy) {
                println!("Equation 1: {:?}", (a, b, c, d));
                println!("Equation 2: {:?}", (e, f, g, h));

                let na = (g * (b - d) + c * (h - f)) / (c * e - a * g);
                let nb = (-a * f + a * h + b * e - d * e) / (c * e - a * g);
                println!("nA = {:?}, nB = {:?}", na, nb);

                let pusha = a * na + b;
                let pushb = e * na + f;

                if pusha.fract() == 0.0 && pushb.fract() == 0.0 {
                    let cost = pusha as i64 * 3 + pushb as i64;
                    println!("Solution: {:?} = {}", (pusha, pushb), cost);
                    s2 = cost;
                }
            }
        }

        // if s1 != s2 {
        //     println!("ALERT");
        // }

        sum += s2;

        println!("Done");
    }
    sum
}

fn get_steps(a: i64, b: i64, g: i64) -> Option<(f64, f64, f64, f64)> {
    let gcd = gcd(a, b);
    if g % gcd != 0 {
        return None;
    }
    let mut sa = 0;
    let mut sb = 0;
    let mut s = 0;
    loop {
        let xa = s * a;
        let r = g - xa;
        // if r < -gx {
        //     return None;
        // }
        if r % b == 0 {
            if sa == 0 {
                sa = s;
                sb = r / b;
            } else {
                let da = s - sa;
                let db = (r / b) - sb;
                return Some((sa as f64, sb as f64, da as f64, db as f64));
            }
        }
        s += 1;
    }
}

#[allow(dead_code)]
fn analyze(m: &Machine) {
    let gx = m.goal.0;
    let dxa = m.delta_a.0;
    let dxb = m.delta_b.0;
    println!("X: {:?}, {:?}, {:?}", gx, dxa, dxb);
    analyze2(gx, dxa, dxb);

    let gy = m.goal.1;
    let dya = m.delta_a.1;
    let dyb = m.delta_b.1;
    println!("Y: {:?}, {:?}, {:?}", gy, dya, dyb);
    analyze2(gy, dya, dyb);
}

#[allow(dead_code)]
fn analyze2(gx: i64, dxa: i64, dxb: i64) {
    let steps = 2 * (gx / dxa);
    let mut last = (-1, -1);
    for s in 0..steps {
        let xa = s * dxa;
        let r = gx - xa;
        if r % dxb == 0 {
            let sb = r / dxb;
            let mut d = String::new();
            if last.0 != -1 {
                d = format!(", Diff: {:?}", (s - last.0, (sb - last.1).abs()));
            }
            let cost = s * 3 + sb;
            println!("Step a: {:4}, b: {:4}, cost: {:5}{}", s, sb, cost, d);
            last = (s, sb);
        }
    }
}

#[allow(dead_code)]
fn solve3(machines: &Vec<Machine>) -> u64 {
    let mut sum = 0;
    for machine in machines {
        let dist = (machine.goal.0, machine.goal.1);
        let ret = find((machine.delta_a, machine.delta_b), dist);
        if let Some(ret) = ret {
            println!("Machine: {:?}: {:?}", machine, ret);
            sum += ret;
        }
    }
    sum
}

#[memoize]
fn find(buttons: ((i64, i64), (i64, i64)), dist: (i64, i64)) -> Option<u64> {
    if dist == (0, 0) {
        return Some(0);
    }
    let mut ca: Option<u64> = None;
    let mut cb: Option<u64> = None;

    let (buttona, buttonb) = buttons;

    let da = (dist.0 - buttona.0, dist.1 - buttona.1);
    if da.0 >= 0 && da.1 >= 0 {
        let cost = 3;
        let ret1 = find(buttons, da);
        if !ret1.is_none() {
            ca = Some(cost + ret1.unwrap());
        }
    }
    let db = (dist.0 - buttonb.0, dist.1 - buttonb.1);
    if db.0 >= 0 && db.1 >= 0 {
        let cost = 1;
        let ret2 = find(buttons, db);
        if !ret2.is_none() {
            cb = Some(cost + ret2.unwrap());
        }
    }

    if !ca.is_none() && !cb.is_none() {
        return Some(ca.min(cb).unwrap());
    } else if !ca.is_none() {
        return ca;
    } else if !cb.is_none() {
        return cb;
    }
    return None;
}

fn parse(input: &str) -> Vec<Machine> {
    let separator = if cfg!(target_os = "windows") {
        "\r\n"
    } else {
        "\n"
    };
    let separator = format!("{}{}", separator, separator);
    input
        .split(&separator)
        .map(|line| {
            let lines: Vec<&str> = line.lines().collect();
            let pa: Vec<i64> = lines[0]
                .split(|c| ['+', ','].contains(&c))
                .map(|s| s.parse::<i64>().unwrap_or(0))
                .collect();
            let pb: Vec<i64> = lines[1]
                .split(|c| ['+', ','].contains(&c))
                .map(|s| s.parse::<i64>().unwrap_or(0))
                .collect();
            let pr: Vec<i64> = lines[2]
                .split(|c| ['=', ','].contains(&c))
                .map(|s| s.parse::<i64>().unwrap_or(0))
                .collect();
            Machine {
                delta_a: (pa[1], pa[3]),
                delta_b: (pb[1], pb[3]),
                goal: (pr[1], pr[3]),
            }
        })
        .collect()
}
