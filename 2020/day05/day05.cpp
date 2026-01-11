#include <fstream>
#include <set>
#include <string>

#include "../../cpp/startup.h"

#define FILE "input.txt"

int seat_id(const std::string& pass) {
    int row = 0, col = 0;

    std::string row_part = pass.substr(0, 7);
    std::replace(row_part.begin(), row_part.end(), 'F', '0');
    std::replace(row_part.begin(), row_part.end(), 'B', '1');
    row = std::stoi(row_part, nullptr, 2);

    std::string col_part = pass.substr(7, 3);
    std::replace(col_part.begin(), col_part.end(), 'L', '0');
    std::replace(col_part.begin(), col_part.end(), 'R', '1');
    col = std::stoi(col_part, nullptr, 2);

    return row * 8 + col;
}

SolutionType solve() {
    std::ifstream infile(FILE);
    std::string line;
    std::set<int> seats;
    while (std::getline(infile, line)) {
        if (!line.empty()) {
            seats.insert(seat_id(line));
        }
    }

    int sol1 = -1, sol2 = 0;
    for (int id : seats) {
        if (sol1 != -1 && id != sol1 + 1) {
            sol2 = sol1 + 1;
        }
        sol1 = id;
    }

    return {std::make_pair(sol1, sol2)};
}
