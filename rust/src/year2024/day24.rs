use std::{collections::HashMap, fs::{self, File}, io::Write};
use itertools::Itertools;
use petgraph::graph::{DiGraph, NodeIndex};
use petgraph_graphml::GraphMl;

const FILENAME: &str = "day24_fixed"; // file is in /data/<year>/

#[derive(Debug)]
enum Operation {
    AND,
    OR,
    XOR
}

struct State {
    inputs: Vec<Option<bool>>,
    state: Option<bool>,
}

struct Gate {
    operation: Operation,
    inputs: Vec<String>,
    output: String,
    next: Vec<(String, u8)>,
    state: State,
}

impl Gate {
    fn new(op: Operation, in1: &String, in2: &String, out: &String) -> Self {
        Gate {
            operation: op,
            inputs: vec![in1.clone(), in2.clone()],
            output: out.clone(),
            next: Vec::new(),
            state: State { inputs: vec![None, None], state: None }
        }
    }
}

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let mut lines: Vec<(&str, bool)> = Vec::new();
    let mut gates: HashMap<String, Gate> = HashMap::new();

    let regex = regex::Regex::new(r"((.*): ([01])|(.+) ((XOR)|(OR)|(AND)) (.+) -> (.+))").unwrap();
    let input = input.chars().filter(|&c| c != '\r').collect::<String>();
    regex.captures_iter(&input).for_each(|caps| {
        let parts: Vec<Option<&str>> = (1..=10).map(|x| caps.get(x).map(|x| x.as_str())).collect();
        if !parts[2].is_none() {
            let line = parts[1].unwrap();
            let state = parts[2].unwrap() == "1";
            lines.push((line, state));
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

    // wire gates
    let keys: Vec<String> = gates.keys().cloned().collect();
    for gate_name in keys {
        let (in1, in2, out) = {
            let gate = gates.get(&gate_name).unwrap();
            (gate.inputs[0].clone(), gate.inputs[1].clone(), gate.output.clone())
        };
        if let Some(outs) = gates.get_mut(&in1) {
            outs.next.push((out.clone(), 0));
        }
        if let Some(outs) = gates.get_mut(&in2) {
            outs.next.push((out.clone(), 1));
        }
    }

    // set inputs
    let mut updates: Vec<(String, u8, bool)> = Vec::new();
    for (line, state) in lines.iter() {
        for gate in gates.values() {
            if *line == gate.inputs[0] {
                let gate_name = &gate.output;
                updates.push((gate_name.clone(), 0, *state));
            }
            if *line == gate.inputs[1] {
                let gate_name = &gate.output;
                updates.push((gate_name.clone(), 1, *state));
            }
        }
    }
    for (gate_name, index, state) in updates {
        set_input(gate_name, index, state, &mut gates);
    }

    // also add outputs to the lines, so they show up in the graph as nodes
    let keys_z = gates.keys().filter(|x| x.starts_with("z")).collect::<Vec<&String>>();
    for key in keys_z.iter() {
        let gate = gates.get(*key).unwrap();
        let value = gate.state.state.unwrap();
        lines.push((key, value));
    }

    let x = to_decimal(&lines, "x");
    let y = to_decimal(&lines, "y");
    let z = to_decimal(&lines, "z");

    println!("sim:  {} + {} = {}", x, y, z);
    println!("real: {} + {} = {}", x, y, x + y);
    println!("x as binary:  {:b}", x);
    println!("y as binary:  {:b}", y);
    println!("r as binary: {:b}", x + y);
    println!("z as binary: {:b}", z);

    // This was determined by looking at the graph in cytoscape
    build_gate_graph(&gates, &lines);
    let sol2 = "fbq,pbv,qff,qnw,qqp,z16,z23,z36";

    println!("Solution 1: {}", z);
    println!("Solution 2: {}", sol2);
}

fn set_input(gate_name: String, index: u8, value: bool, gates: &mut HashMap<String, Gate>) {
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
            state.state = s;
            for (gatename, index) in gate.next.iter() {
                queue.push((gatename.clone(), *index, s.unwrap()));
            }
        }
    }
}

fn to_decimal(lines: &Vec<(&str, bool)>, prefix: &str) -> u64 {
    let l2: Vec<&bool> = lines.iter().filter(|(x, _)| x.starts_with(prefix)).sorted_by(|a, b| a.0.cmp(b.0)).map(|(_, v)| v).collect();
    l2.iter().enumerate().fold(0_u64, |acc, (i, value)| {
        if **value {
            acc + 2_u64.pow(i as u32)
        } else {
            acc
        }
    })
}

fn build_gate_graph(gates: &HashMap<String, Gate>, lines: &Vec<(&str, bool)>) {
    let mut graph: DiGraph<String, String> = DiGraph::new();
    let mut gate_map: HashMap<String, NodeIndex> = HashMap::new();

    for gate in gates.values() {
        let node = graph.add_node(gate.output.clone());
        gate_map.insert(gate.output.clone(), node);
    }
    for (line, _) in lines {
        let node = graph.add_node(line.to_string());
        gate_map.insert(line.to_string(), node);
    }

    for gate in gates.values() {
        let current_node = gate_map[&gate.output];
        if let Some(input_node) = gate_map.get(&gate.inputs[0]) {
            graph.add_edge(*input_node, current_node, "input1".to_string());
        }
        if let Some(input_node) = gate_map.get(&gate.inputs[1]) {
            graph.add_edge(*input_node, current_node, "input2".to_string());
        }
    }

    let mut ml = GraphMl::new(&graph)
        .pretty_print(true)
        .export_node_weights_display()
        .to_string();
    for node in graph.node_indices().sorted().rev() {
        let index = format!("n{}", node.index());
        let name = &graph[node];
        let node_name =
        if let Some(gate) = gates.get(name) {
            let n = gate.next.iter().map(|(n, _)| n.clone()).sorted().collect::<Vec<String>>().join(", ");
            format!("{}: {:?}, IN1: {}, IN2: {}, OUT: {}", gate.output, gate.operation, gate.inputs[0], gate.inputs[1], n)
        } else {
            format!("IN {}", name)
        };
        ml = ml.replace(&index, node_name.as_str());
    }
    let filename = format!("{}.graphml", FILENAME);
    let mut file = File::create(&filename).expect("Unable to create file");
    file.write(ml.as_bytes()).expect("Unable to write data");
    println!("GraphML file {} written", filename);
}
