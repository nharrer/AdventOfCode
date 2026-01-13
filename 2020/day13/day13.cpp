#include <fstream>
#include <ranges>
#include <string>

#include "../../cpp/startup.h"

#define FILE "input.txt"

std::tuple<int, int> x;

SolutionType solve() {
    std::ifstream infile(FILE);
    int depart;
    infile >> depart;
    std::string bus;
    std::vector<std::tuple<int, int>> busmap;
    for (int i = 0; std::getline(infile, bus, ','); i++) {
        if (bus[0] != 'x' && !bus.empty()) {
            busmap.emplace_back(std::stoi(bus), i);
        }
    }

    uint64_t sol1 = 0, sol2 = 0;
    uint64_t step = 1;
    uint min = uint(-1);
    for (const auto& [bus, offset] : busmap) {
        int diff = (bus - (depart % bus)) % bus;
        if (diff < min) {
            min = diff;
            sol1 = bus * diff;
        }

        do {
            // This was a bit tricky. We step by the product of all previous buses, which works
            // because they are all prime numbers. We then step until the current bus aligns.
            sol2 += step;
        } while ((sol2 + offset) % bus != 0);
        step *= bus;
    }

    return {std::make_pair(sol1, sol2)};
}
