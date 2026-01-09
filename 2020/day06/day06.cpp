#include <fstream>
#include <regex>
#include <set>
#include <string>

#include "../../cpp/startup.h"

#define FILE "input.txt"

void add_up(std::map<char, int>& counts, int& groupsize, int& sol1, int& sol2) {
    for (const auto& [_, count] : counts) {
        sol1++;
        sol2 += (count == groupsize ? 1 : 0);
    }
    counts.clear();
    groupsize = 0;
}

SolutionType solve() {
    std::ifstream infile(FILE);
    std::string line;

    int sol1 = 0, sol2 = 0, groupsize = 0;
    std::map<char, int> counts;
    while (std::getline(infile, line)) {
        if (!line.empty()) {
            groupsize++;
            for (char c : line) {
                counts[c]++;
            }
        } else {
            add_up(counts, groupsize, sol1, sol2);
        }
    }
    add_up(counts, groupsize, sol1, sol2);

    return {std::make_pair(sol1, sol2)};
}
