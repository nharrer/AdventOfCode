use std::fs;
use std::collections::HashSet;
use grid::Grid;

const FILENAME: &str = "day12"; // file is in /data/<year>/

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));
    let vec: Vec<char> = input.lines().flat_map(|line| line.chars()).collect();
    let grid = Grid::from_vec(vec, input.lines().next().unwrap().len());

    println!("Solution 1: {}", calc_cost(&grid, true));
    println!("Solution 2: {}", calc_cost(&grid, false));
}

fn calc_cost(grid: &Grid<char>, part1: bool) -> u32 {
    let mut visited: HashSet<(usize, usize)> = HashSet::new();
    grid.indexed_iter().fold(0, |acc, ((row, col), plant)| {
        if visited.insert((row, col)) {
            let mut region: HashSet<(usize, usize)> = HashSet::from([(row, col)]);
            let p1 = find_fences(grid, row, col, plant, &mut region);
            let area = region.len() as u32;
            let perimeter = if part1 { p1 } else { find_sides(&region, plant) };

            visited.extend(region);

            return acc + area * perimeter;
        }
        acc
    })
}

fn find_fences(grid: &Grid<char>, row: usize, col: usize, plant: &char, visited: &mut HashSet<(usize, usize)>) -> u32 {
    [(0, -1), (0, 1), (-1, 0), (1, 0)].iter().fold(0_u32, |acc, (r, c)| {
        let (r, c) = (row as isize + r, col as isize + c);
        if let Some(neighbor) = grid.get(r, c) {
            if neighbor == plant {
                if visited.insert((r as usize, c as usize)) {
                    return acc + find_fences(grid, r as usize, c as usize, plant, visited);
                } else {
                    return acc;
                }
            }
        }
        acc + 1
    })
}

fn find_sides(region: &HashSet<(usize, usize)>, plant: &char) -> u32 {
    // cut out a subgrid of the region and scan it for continous fences
    let (rowmin, colmin, rowmax, colmax) = region.iter().fold((usize::MAX, usize::MAX, 0, 0), |(rmin, cmin, rmax, cmax), &(r, c)| {
        (rmin.min(r), cmin.min(c), rmax.max(r), cmax.max(c))
    });
    let mut region_grid = Grid::new(rowmax - rowmin + 1, colmax - colmin + 1);
    for &(r, c) in region {
        *region_grid.get_mut(r - rowmin, c - colmin).unwrap() = *plant;
    }

    let p1 = scan(&region_grid, plant); // scan rows
    region_grid.transpose();
    p1 + scan(&region_grid, plant)      // scan columns
}

fn scan(grid: &Grid<char>, plant: &char) -> u32 {
    fn check(cond: bool, isfence: &mut bool, fence: &mut u32) {
        if cond && !*isfence { // count only the first fence
            *isfence = true;
            *fence += 1;
        } else if !cond {
            *isfence = false;
        }
    }

    let mut fence = 0_u32;
    for row in 0..grid.rows() {
        let mut isfence_above = false;
        let mut isfence_below = false;
        for col in 0..grid.cols() {
            let isplant = *grid.get(row as isize, col as isize).unwrap() == *plant;
            let isplantabove = *grid.get(row as isize - 1, col as isize).unwrap_or(&'0') == *plant;
            let isplantbelow = *grid.get(row as isize + 1, col as isize).unwrap_or(&'0') == *plant;
            check(isplant && !isplantabove, &mut isfence_above, &mut fence);
            check(isplant && !isplantbelow, &mut isfence_below, &mut fence);
        }
    }
    fence
}
