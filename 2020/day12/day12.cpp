#include <fstream>
#include <string>

#include "../../cpp/startup.h"

#define FILE "input.txt"

inline void swap(int x, int y, int& a, int& b) {
    a = x, b = y;
}

SolutionType solve() {
    std::ifstream infile(FILE);
    std::string line;
    int x1 = 0, y1 = 0, dir1 = 0;
    int x2 = 0, y2 = 0, wx = 10, wy = 1;
    while (std::getline(infile, line)) {
        char move = line[0];
        int length = std::stoi(line.substr(1));
        int times = 0;
        switch (move) {
            case 'N':
                y1 += length, wy += length;
                break;
            case 'S':
                y1 -= length, wy -= length;
                break;
            case 'E':
                x1 += length, wx += length;
                break;
            case 'W':
                x1 -= length, wx -= length;
                break;
            case 'L':
            case 'R': {
                int angle = move == 'L' ? length : 360 - length;
                dir1 = (dir1 + angle) % 360;
                if (angle == 90) {
                    swap(-wy, wx, wx, wy);
                } else if (angle == 180) {
                    swap(-wx, -wy, wx, wy);
                } else if (angle == 270) {
                    swap(wy, -wx, wx, wy);
                }
                break;
            }
            case 'F':
                if (dir1 == 0) {
                    x1 += length;
                } else if (dir1 == 90) {
                    y1 += length;
                } else if (dir1 == 180) {
                    x1 -= length;
                } else if (dir1 == 270) {
                    y1 -= length;
                }
                x2 += wx * length;
                y2 += wy * length;
                break;
        }
    }

    int sol1 = std::abs(x1) + std::abs(y1);
    int sol2 = std::abs(x2) + std::abs(y2);

    return {std::make_pair(sol1, sol2)};
}
