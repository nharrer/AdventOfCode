use std::{collections::{HashMap, HashSet}, fs};
use itertools::Itertools;
use core::panic;

const FILENAME: &str = "day24"; // file is in /data/<year>/

#[derive(PartialEq)]
#[derive(Clone)]
#[derive(Debug)]
enum Operation {
    AND,
    OR,
    XOR
}

#[derive(Clone)]
#[derive(Debug)]
struct State {
    inputs: Vec<Option<bool>>,
    value: Option<bool>,
}

#[derive(Clone)]
#[derive(Debug)]
struct Gate {
    operation: Operation,
    inputs: Vec<String>,
    output: String,
    next: Vec<(String, u8)>,
    state: State,
    layer: u8,
    level: u8
}

impl Gate {
    fn new(op: Operation, in1: &String, in2: &String, out: &String) -> Self {
        Gate {
            operation: op,
            inputs: vec![in1.clone(), in2.clone()],
            output: out.clone(),
            next: Vec::new(),
            state: State { inputs: vec![None, None], value: None },
            layer: 0,
            level: 0
        }
    }
    fn reset(&mut self) {
        self.state = State { inputs: vec![None, None], value: None };
        self.next.clear();
    }
}

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let (mut gates, inputs) = parse(input);

    let sol1 = solve1(&gates, &inputs);
    let sol2 = solve2(&mut gates, &inputs);
    println!("Solution 1: {}", sol1);
    println!("Solution 2: {}", sol2);
}

fn solve1(gates: &HashMap<String, Gate>, inputs: &Vec<(String, bool)>) -> u64 {
    let outputs = run_gates(&mut gates.clone(), inputs);
    to_decimal(&outputs, "z")
}

fn solve2(gates: &mut HashMap<String, Gate>, inputs: &Vec<(String, bool)>) -> String {
    classify_gates(gates);
    let bad_apples = find_bad_apples(gates);
    println!("Bad Gates: {}", bad_apples.join(","));

    let x = to_decimal(&inputs, "x");
    let y = to_decimal(&inputs, "y");
    let z = x + y;

    for swaps in swaps(bad_apples.len() as u8).iter() {
        let mut gates_fixed = gates.clone();

        let swaps: Vec<Vec<&String>> = swaps.iter().map(|s| s.iter().map(|x| &bad_apples[*x as usize]).collect()).collect();
        for swap in swaps.iter() {
            // swap the pairs of outputs
            let (o1, o2) = (swap[0], swap[1]);
            let mut g1 = gates_fixed.remove(o1).unwrap();
            let mut g2 = gates_fixed.remove(o2).unwrap();
            g1.output = o2.clone();
            g2.output = o1.clone();
            gates_fixed.insert(o1.clone(), g2);
            gates_fixed.insert(o2.clone(), g1);
        }

        reset_gates(&mut gates_fixed);

        if solve1(&gates_fixed, inputs) == z {
            println!("Found fix: {:?}\n", swaps);
        }
    }

    bad_apples.join(",")
}

fn run_gates(gates: &mut HashMap<String, Gate>, inputs: &Vec<(String, bool)>) -> Vec<(String, bool)> {
    // set inputs
    for (line, state) in inputs.iter() {
        let keys: Vec<String> = gates.keys().cloned().collect();
        for gate_name in keys.iter() {
            let inp = gates.get(gate_name).unwrap().inputs.clone();
            if *line == inp[0] {
                propagate_input(gate_name.clone(), 0, *state, gates);
            }
            if *line == inp[1] {
                propagate_input(gate_name.clone(), 1, *state, gates);
            }
        }
    }

    // get values of the outputs
    gates.values().filter(|g| g.output.starts_with("z")).map(|g| (g.output.clone(), g.state.value.unwrap_or(false))).collect()
}


fn propagate_input(gate_name: String, index: u8, value: bool, gates: &mut HashMap<String, Gate>) {
    let mut queue: Vec<(String, u8, bool)> = Vec::new();
    queue.push((gate_name, index, value));

    while !queue.is_empty() {
        let (gate_name, index, value) = queue.pop().unwrap();
        let gate = gates.get_mut(&gate_name).unwrap();
        let state = &mut gate.state;

        state.inputs[index as usize] = Some(value);
        if state.inputs.iter().all(|x| x.is_some()) {
            let s = match gate.operation {
                Operation::AND => Some(state.inputs.iter().all(|x| x.unwrap())),
                Operation::OR => Some(state.inputs.iter().any(|x| x.unwrap())),
                Operation::XOR => Some(state.inputs.iter().filter(|x| x.unwrap()).count() == 1)
            };
            state.value = s;
            for (gatename, index) in gate.next.iter() {
                queue.push((gatename.clone(), *index, s.unwrap()));
            }
        }
    }
}

fn reset_gates(gates: &mut HashMap<String, Gate>) {
    // clear wiring
    gates.values_mut().for_each(|gate| gate.reset());

    // rewire gates
    let keys: Vec<String> = gates.keys().cloned().collect();
    for gate_name in keys {
        let (in1, in2, out) = {
            let gate = gates.get(&gate_name).unwrap();
            (gate.inputs[0].clone(), gate.inputs[1].clone(), gate.output.clone())
        };
        if let Some(prev_gate1) = gates.get_mut(&in1) {
            prev_gate1.next.push((out.clone(), 0));
        }
        if let Some(prev_gate2) = gates.get_mut(&in2) {
            prev_gate2.next.push((out.clone(), 1));
        }
    }
}

fn find_bad_apples(gates: &HashMap<String, Gate>) -> Vec<String> {
    let mut bad_apples: HashSet<String> = HashSet::new();
    for gate in gates.values() {
        if gate.layer == 1 && gate.level > 0 {
            if gate.operation == Operation::XOR {
                let follower_count = gate.next.len();
                if follower_count != 2  {
                    println!("Gate XOR {} at layer {} should have 2 followers, but has {}", gate.output, gate.layer, follower_count);
                    bad_apples.insert(gate.output.clone());
                } else {
                    let next: Vec<&Gate> = gate.next.iter().map(|(n, _)| gates.get(n).unwrap()).collect();
                    let (g1, g2) = if next[0].operation == Operation::AND { (next[0], next[1]) } else { (next[1], next[0]) };
                    // g1 must be an AND at layer 2
                    if g1.operation != Operation::AND || g1.layer != 2 {
                        println!("Gate XOR {} at layer {} has a non-AND follower: {:?}", gate.output, gate.layer, g1);
                        bad_apples.insert(gate.output.clone());
                    }
                    // g2 must be an XCR at layer 4
                    if g2.operation != Operation::XOR || g2.layer != 4 {
                        println!("Gate XOR {} at layer {} has a non-XOR follower: {:?}", gate.output, gate.layer, g2);
                        bad_apples.insert(gate.output.clone());
                    }
                }
            } else if gate.operation == Operation::AND {
                let follower_count = gate.next.len();
                if follower_count != 1  {
                    println!("Gate AND {} at layer {} should have 1 followers, but has {}", gate.output, gate.layer, follower_count);
                    bad_apples.insert(gate.output.clone());
                } else {
                    let gnext = gate.next.iter().map(|(n, _)| gates.get(n).unwrap()).next().unwrap();
                    // gnext must be an OR at layer 3
                    if gnext.operation != Operation::OR || gnext.layer != 3 {
                        println!("Gate AND {} at layer {} has a non-OR follower: {:?}", gate.output, gate.layer, gnext);
                        bad_apples.insert(gate.output.clone());
                    }
                }
            }
        }
        if gate.layer == 2 { // AND at layer 2
            let follower_count = gate.next.len();
            if follower_count != 1  {
                println!("Gate AND {} at layer {} should have 1 followers, but has {}", gate.output, gate.layer, follower_count);
                bad_apples.insert(gate.output.clone());
            } else {
                let gnext = gate.next.iter().map(|(n, _)| gates.get(n).unwrap()).next().unwrap();
                // gnext must be an OR at layer 3
                if gnext.operation != Operation::OR || gnext.layer != 3 {
                    println!("Gate AND {} at layer {} has a non-OR follower: {:?}", gate.output, gate.layer, gnext);
                    bad_apples.insert(gate.output.clone());
                }
            }
        }
        if gate.layer == 3 { // OR layer 3
            let follower_count = gate.next.len();
            if gate.output == "z45" && follower_count == 0 {
                // That's ok
            } else {
                if follower_count != 2  {
                    println!("Gate OR {} at layer {} should have 2 followers, but has {}", gate.output, gate.layer, follower_count);
                    bad_apples.insert(gate.output.clone());
                } else {
                    let next: Vec<&Gate> = gate.next.iter().map(|(n, _)| gates.get(n).unwrap()).collect();
                    let (g1, g2) = if next[0].operation == Operation::XOR { (next[0], next[1]) } else { (next[1], next[0]) };
                    // g1 must be an XOR at layer 4
                    if g1.operation != Operation::XOR || g1.layer != 4 {
                        println!("Gate OR {} at layer {} has a non-XOR follower: {:?}", gate.output, gate.layer, g1);
                        bad_apples.insert(gate.output.clone());
                    }
                    // g2 must be an AND at layer 2
                    if g2.operation != Operation::AND || g2.layer != 2 {
                        println!("Gate OR {} at layer {} has a non-AND follower: {:?}", gate.output, gate.layer, g2);
                        bad_apples.insert(gate.output.clone());
                    }
                }
            }
        }
        if gate.layer == 4 { // XOR at end
            if &gate.output[0..1] != "z" {
                println!("Gate {:?} {} at layer {} should have a zxx output", gate.operation, gate.output, gate.layer);
                bad_apples.insert(gate.output.clone());
            }
        }
    }

    bad_apples.into_iter().sorted().collect()
}

fn classify_gates(gates: &mut HashMap<String, Gate>) {
    // the ripple adder has 4 layers:
    // layer 1: XOR and AND gates that have inputs x and y
    // layer 2: AND gates
    // layer 3: OR gates
    // layer 4: XOR gates that have output z
    for gate in gates.values_mut() {
        if gate.operation == Operation::XOR || gate.operation == Operation::AND {
            if gate.inputs.iter().any(|g| g.starts_with("x")) {
                if !gate.inputs.iter().any(|g| g.starts_with("y")) {
                    panic!("Gate {} has x but no y: {:?}", gate.output, gate.inputs);
                }
                let i1 = gate.inputs[0][1..].parse::<u8>().unwrap();
                let i2 = gate.inputs[1][1..].parse::<u8>().unwrap();
                if i1 != i2 {
                    panic!("Gate {} has different input levels: {:?}", gate.output, gate.inputs);
                }
                gate.layer = 1;
                gate.level = i1;
            } else {
                if gate.operation == Operation::XOR {
                    gate.layer = 4;
                }
                if gate.operation == Operation::AND {
                    gate.layer = 2;
                }
            }
        }
        if gate.operation == Operation::OR {
            gate.layer = 3;
        }
    }
}

fn swaps(elements: u8) -> Vec<Vec<Vec<u8>>> {
    // Get all combinations of 2 elements from the elements (which form the pairs)
    let pairs: Vec<Vec<u8>> = (0..elements).combinations(2).collect();
    // we need all distinct groupings of 4 pairs
    pairs.iter().cloned().combinations((elements / 2) as usize).filter(|comb| {
        // Ensure that no elements repeat across the 4 pairs
        let unique_elements: HashSet<_> = comb.iter().flatten().cloned().collect();
        unique_elements.len() == 8
    }).collect()
}

fn to_decimal(lines: &Vec<(String, bool)>, prefix: &str) -> u64 {
    let l2: Vec<&bool> = lines.iter().filter(|(x, _)| x.starts_with(prefix)).sorted_by(|a, b| a.0.cmp(&b.0)).map(|(_, v)| v).collect();
    l2.iter().enumerate().fold(0_u64, |acc, (i, value)| {
        if **value {
            acc + 2_u64.pow(i as u32)
        } else {
            acc
        }
    })
}

fn parse(input_str: String) -> (HashMap<String, Gate> , Vec<(String, bool)>) {
    let mut inputs: Vec<(String, bool)> = Vec::new();
    let mut gates: HashMap<String, Gate> = HashMap::new();

    let regex = regex::Regex::new(r"((.*): ([01])|(.+) ((XOR)|(OR)|(AND)) (.+) -> (.+))").unwrap();
    let input = input_str.chars().filter(|&c| c != '\r').collect::<String>();
    regex.captures_iter(&input).for_each(|caps| {
        let parts: Vec<Option<&str>> = (1..=10).map(|x| caps.get(x).map(|x| x.as_str())).collect();
        if !parts[2].is_none() {
            let inp = parts[1].unwrap();
            let state = parts[2].unwrap() == "1";
            inputs.push((inp.to_string(), state));
        } else {
            let op = match parts[4].unwrap() {
                "AND" => Operation::AND,
                "OR" => Operation::OR,
                "XOR" => Operation::XOR,
                _ => panic!("Unknown operation")
            };
            let inp1 = parts[3].unwrap().to_string();
            let inp2 = parts[8].unwrap().to_string();
            let out = parts[9].unwrap().to_string();
            gates.insert(out.clone(), Gate::new(op, &inp1, &inp2, &out));
        }
    });

    reset_gates(&mut gates);

    (gates, inputs)
}
