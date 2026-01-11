#include <algorithm>
#include <fstream>
#include <ranges>
#include <string>
#include <tuple>
#include <vector>

#include "../../cpp/startup.h"

#define FILE "input.txt"

typedef std::vector<std::vector<char>> Grid;

const std::vector<std::tuple<int, int>> neighbors = {{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}};

int occupied_neighbors_part1(Grid& grid, int r, int c, int rows, int cols) {
    return std::count_if(neighbors.begin(), neighbors.end(),
                         [&](const auto& d) {
                             int nr = r + std::get<0>(d), nc = c + std::get<1>(d);
                             return nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '#';
                         });
}

int occupied_neighbors_part2(Grid& grid, int r, int c, int rows, int cols) {
    int occupied_count = 0;
    for (const auto& [dr, dc] : neighbors) {
        int nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            char ch = grid[nr][nc];
            if (ch == 'L') {
                break;
            } else if (ch == '#') {
                occupied_count++;
                break;
            }
            nr += dr;
            nc += dc;
        }
    }
    return occupied_count;
}

Grid occupy(Grid& grid, bool part1) {
    Grid new_grid = grid;
    int rows = grid.size();
    int cols = grid[0].size();
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            char seat = grid[r][c];
            int on = part1 ? occupied_neighbors_part1(grid, r, c, rows, cols) : occupied_neighbors_part2(grid, r, c, rows, cols);
            if (seat == '#' && on >= (part1 ? 4 : 5)) {
                new_grid[r][c] = 'L';
            } else if (seat == 'L' && on == 0) {
                new_grid[r][c] = '#';
            }
        }
    }
    return new_grid;
}

int find_stable_state(Grid grid, bool part1) {
    for (bool same = false; !same;) {
        Grid new_grid = occupy(grid, part1);
        same = (new_grid == grid);
        grid = std::move(new_grid);
    }
    return std::ranges::count_if(grid | std::views::join, [](char c) { return c == '#'; });
}

SolutionType solve() {
    std::ifstream infile(FILE);
    std::string line;
    Grid grid;
    while (std::getline(infile, line)) {
        grid.emplace_back(line.begin(), line.end());
    }
    int sol1 = find_stable_state(grid, true);
    int sol2 = find_stable_state(grid, false);
    return {std::make_pair(sol1, sol2)};
}
