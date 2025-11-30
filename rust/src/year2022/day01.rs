
pub fn solve() {
    let input = std::fs::read_to_string("day01").expect("Error loading file: day01");
    let mut packs: Vec<u32> = input
        .split(if cfg!(windows) { "\r\n\r\n" } else { "\n\n" })
        .map(|block| block.lines().map(|line| line.trim().parse::<u32>().unwrap()).sum())
        .collect();
    packs.sort_unstable_by(|a, b| b.cmp(a));
    println!("Solution 1: {}", packs.first().unwrap());
    println!("Solution 2: {}", packs.iter().take(3).sum::<u32>());
}
