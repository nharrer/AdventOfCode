#include "../../cpp/startup.h"

#include <fstream>
#include <iostream>
#include <vector>

#define FILE "input.txt"

SolutionType solve() {
    std::ifstream infile(FILE);
    std::vector<int> lines;
    std::string line;
    while (std::getline(infile, line)) {
        if (!line.empty()) {
            lines.push_back(std::stoi(line));
        }
    }

    int sol2 = 0, sol1 = 0;
    int n = lines.size();
    for (size_t i = 0; i < n && (sol1 == 0 || sol2 == 0); i++) {
        for (size_t j = i + 1; j < n && (sol1 == 0 || sol2 == 0); j++) {
            if (lines[i] + lines[j] == 2020) {
                sol1 = lines[i] * lines[j];
            }
            for (size_t k = j + 1; k < n && sol2 == 0; k++) {
                if (lines[i] + lines[j] + lines[k] == 2020) {
                    sol2 = lines[i] * lines[j] * lines[k];
                }
            }
        }
    }

    return {std::make_pair(sol1, sol2)};
}
