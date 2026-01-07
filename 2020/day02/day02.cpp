#include <fstream>
#include <iostream>
#include <regex>

#include "../../cpp/startup.h"

#define FILE "input.txt"

SolutionType solve() {
    std::ifstream infile(FILE);
    std::string line;
    std::regex pattern("(\\d+)-(\\d+) (.): (.+)");

    int sol1 = 0, sol2 = 0;
    while (std::getline(infile, line)) {
        std::smatch match;
        if (std::regex_search(line, match, pattern)) {
            auto min = std::stoi(match[1]);
            auto max = std::stoi(match[2]);
            char letter = match[3].str()[0];
            std::string password = match[4];

            int count = std::count(password.begin(), password.end(), letter);
            if (count >= min && count <= max) {
                sol1++;
            }

            if ((password[min - 1] == letter ? 1 : 0) + (password[max - 1] == letter ? 1 : 0) == 1) {
                sol2++;
            }
        }
    }

    return {std::make_pair(sol1, sol2)};
}
