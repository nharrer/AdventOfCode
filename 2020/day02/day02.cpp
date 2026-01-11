#include <fstream>
#include <cstdio>

#include "../../cpp/startup.h"

#define FILE "input.txt"

SolutionType solve() {
    std::ifstream infile(FILE);
    std::string line;
    int sol1 = 0, sol2 = 0;
    while (std::getline(infile, line)) {
        int min = 0, max = 0; char letter = 0; char pwdbuf[1024];
        if (std::sscanf(line.c_str(), "%d-%d %c: %1023s", &min, &max, &letter, pwdbuf) == 4) {
            std::string password = pwdbuf;

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
