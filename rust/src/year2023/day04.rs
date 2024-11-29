use std::collections::HashSet;
use std::fs;

const FILENAME: &str = "day04";

#[derive(Debug)]
pub struct Card {
    wins: u32,
    copies: u32,
}

pub fn solve() {
    let input = fs::read_to_string(FILENAME).expect(&format!("Error loading file: {FILENAME}"));

    let mut cards: Vec<Card> = read_cards(&input);

    let solution1 = solve1(&cards);
    println!("Solution 1: {}", solution1);

    let solution2 = solve2(&mut cards);
    println!("Solution 2: {}", solution2);
}

fn solve1(cards: &Vec<Card>) -> u32 {
    cards.iter().map(|c| (1 << c.wins) >> 1).sum()
}

fn solve2(cards: &mut Vec<Card>) -> u32 {
    let mut sum = 0;
    for i in 0..cards.len() {
        let card = &cards[i];
        let amount = card.copies;
        let j = i + card.wins as usize;
        for k in (i + 1)..=j {
            cards[k].copies += amount;
        }
        sum += amount;
    }
    sum
}

fn read_cards(input: &str) -> Vec<Card> {
    let mut cards: Vec<Card> = Vec::new();

    for line in input.lines() {
        let p1 = line.split(":").collect::<Vec<&str>>();
        let p2 = p1[1].trim().split("|").collect::<Vec<&str>>();
        let winning = p2[0].split_whitespace().collect::<Vec<&str>>();
        let drawn = p2[1].split_whitespace().collect::<Vec<&str>>();

        let winning = winning
            .iter()
            .map(|x| x.trim().parse::<u32>().unwrap())
            .collect::<HashSet<u32>>();
        let drawn = drawn
            .iter()
            .map(|x| x.trim().parse::<u32>().unwrap())
            .collect::<HashSet<u32>>();
        let wins = winning.intersection(&drawn).collect::<HashSet<&u32>>();

        cards.push(Card {
            wins: wins.len() as u32,
            copies: 1,
        });
    }

    cards
}
