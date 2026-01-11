#include <fstream>
#include <vector>

#include "../../cpp/startup.h"

#define FILE "input.txt"

std::vector<std::string> map;

long test(int stepx, int stepy) {
    int width = map[0].size();
    int height = map.size();
    int x = 0, y = 0, sol = 0;
    while (y < height) {
        if (map[y][x % width] == '#') {
            sol++;
        }
        x += stepx;
        y += stepy;
    }
    return sol;
}

SolutionType solve() {
    std::ifstream infile(FILE);
    std::string line;
    while (std::getline(infile, line)) {
        if (!line.empty()) {
            map.push_back(line);
        }
    }

    long sol1 = test(3, 1);
    long sol2 = test(1, 1) * sol1 * test(5, 1) * test(7, 1) * test(1, 2);

    return {std::make_pair(sol1, sol2)};
}
