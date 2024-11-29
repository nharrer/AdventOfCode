use std::fs;

const FILENAME: &str = "day03";
//const FILENAME: &str = "day03_test1";

#[derive(Debug)]
struct Coord(i32, i32);

#[derive(Debug)]
struct Number {
    number: u32,
    from: Coord,
    to: Coord,
}

#[derive(Debug)]
struct Symbol {
    pos: Coord,
    #[allow(dead_code)]
    symbol: char,
}

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let (numbers, symbols) = read_numbers(&input);

    // debug_print(input, &numbers, &symbols);

    let solution1 = solve1(&numbers, &symbols);
    println!("Solution 1: {}", solution1);

    let solution2 = solve2(&numbers, &symbols);
    println!("Solution 2: {}", solution2);
}

fn solve1(numbers: &Vec<Number>, symbols: &Vec<Symbol>) -> u32 {
    numbers
        .iter()
        .filter(|n| symbols.iter().any(|s| are_adjacent(n, s)))
        .map(|n| n.number)
        .sum()
}

fn solve2(numbers: &Vec<Number>, symbols: &Vec<Symbol>) -> u32 {
    fn gear_ratio(s: &Symbol, numbers: &Vec<Number>) -> u32 {
        let ratios: Vec<&Number> = numbers.iter().filter(|n| are_adjacent(n, s)).collect();
        if ratios.len() == 2 {
            return ratios[0].number * ratios[1].number;
        } else {
            0
        }
    }

    symbols.iter().filter(|s| s.symbol == '*').map(|s| gear_ratio(s, numbers)).sum()
}

fn are_adjacent(n: &Number, s: &Symbol) -> bool {
    s.pos.0 >= (n.from.0 - 1)
        && s.pos.0 <= (n.to.0 + 1)
        && s.pos.1 >= (n.from.1 - 1)
        && s.pos.1 <= (n.to.1 + 1)
}

fn read_numbers(input: &str) -> (Vec<Number>, Vec<Symbol>) {
    let mut y = 0;
    let mut numbers: Vec<Number> = Vec::new();
    let mut symbols: Vec<Symbol> = Vec::new();

    fn push_number(lastnumber: &mut String, x: i32, y: i32, numbers: &mut Vec<Number>) {
        let n = lastnumber.parse::<u32>().unwrap();
        let s = lastnumber.len() as i32;
        let number = Number {
            number: n,
            from: Coord(x - s, y),
            to: Coord(x - 1, y),
        };
        lastnumber.clear();
        numbers.push(number);
    }

    for line in input.lines() {
        let mut lastnumber = String::new();

        let mut x = 0;
        for c in line.chars() {
            if c.is_digit(10) {
                lastnumber.push(c);
            } else {
                if lastnumber.len() > 0 {
                    push_number(&mut lastnumber, x, y, &mut numbers);
                }
                if c != '.' {
                    symbols.push(Symbol {
                        pos: Coord(x, y),
                        symbol: c,
                    });
                }
            }
            x += 1;
        }

        if lastnumber.len() > 0 {
            push_number(&mut lastnumber, x - 1, y, &mut numbers);
        }

        y += 1;
    }

    (numbers, symbols)
}

#[allow(dead_code)]
fn debug_print(input: String, numbers: &Vec<Number>, symbols: &Vec<Symbol>) {
    println!("Input:\n{}", input);

    for number in numbers {
        println!(
            "Number: {} from: {:?} to: {:?}",
            number.number, number.from, number.to
        );
    }
    for symbol in symbols {
        println!("Symbol: {} at: {:?}", symbol.symbol, symbol.pos);
    }
}
