use std::{collections::HashSet, fs::{self, File}, io::Write};
use petgraph::graph::{UnGraph, NodeIndex};
use itertools::Itertools;
use petgraph_graphml::GraphMl;

const FILENAME: &str = "day23"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let graph = parse(&input);
    println!("Solution 1: {}", solve1(&graph));
    println!("Solution 2: {}", solve2(&graph));
}

fn solve1(graph: &UnGraph::<&str, ()>) -> u32 {
    let mut sum = 0_u32;
    let mut g = graph.clone();
    let mut tnodes: Vec<NodeIndex> = g.node_indices().filter(|&node| g[node].starts_with('t')).collect();
    while let Some(tnode) = tnodes.pop() {
        // find all neighbors of tnode which are connected to each other
        for (n1, n2) in g.neighbors(tnode).tuple_combinations() {
            if g.neighbors(n1).contains(&n2) {
                sum += 1;
            }
        }
        g.remove_node(tnode);
    }
    sum
}

fn solve2(g: &UnGraph::<&str, ()>) -> String {
    let mut max_set: HashSet<NodeIndex> = HashSet::new();
    for n1 in g.node_indices() {
        let mut neighbors: HashSet<NodeIndex> = g.neighbors(n1).collect();
        while neighbors.len() > 0 {
            let mut pool = HashSet::from([n1]);
            // keep adding to the pool as long as the new node is connected to all nodes of the pool
            for &n2 in neighbors.iter() {
                let ne2 = g.neighbors(n2).collect::<HashSet<NodeIndex>>();
                if pool.is_subset(&ne2) {
                    pool.insert(n2);
                }
            }
            neighbors = neighbors.difference(&pool).cloned().collect();

            if pool.len() > max_set.len() {
                max_set = pool.clone();
            }
        }
    }

    _export_graph(g, "final.graphml");

    max_set.iter().map(|n| g[*n]).sorted().join(",")
}

fn parse(input: &str) -> UnGraph::<&str, ()> {
    let mut graph = UnGraph::<&str, ()>::new_undirected();
    for line in input.lines() {
        let (n1, n2) = line.split("-").collect_tuple().unwrap();
        let n1_index = graph.node_indices().find(|i| graph[*i] == n1).unwrap_or_else(|| graph.add_node(n1));
        let n2_index = graph.node_indices().find(|i| graph[*i] == n2).unwrap_or_else(|| graph.add_node(n2));
        graph.add_edge(n1_index, n2_index, ());
    }
    graph
}

fn _export_graph(g: &UnGraph<&str, ()>, filename: &str) {
    let mut ml = GraphMl::new(g)
        .pretty_print(true)
        .export_node_weights_display()
        .to_string();
    for node in g.node_indices().sorted().rev() {
        let index = format!("n{}", node.index());
        let name = g[node];
        ml = ml.replace(&index, name);
    }
    let mut file = File::create(filename).expect("Unable to create file");
    file.write(ml.as_bytes()).expect("Unable to write data");
}
