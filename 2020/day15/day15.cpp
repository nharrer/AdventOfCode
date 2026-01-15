#include <cstring>

#include "../../cpp/startup.h"

constexpr uint32_t numbers[] = {16, 11, 15, 0, 1, 7};
constexpr uint32_t limit = 30000000;
uint32_t last_spoken[limit];

SolutionType solve() {
    std::memset(last_spoken, 0, sizeof(last_spoken));

    uint32_t sol1 = 0, sol2 = 0, turn = 1;
    for (; turn < std::size(numbers); ++turn) {
        last_spoken[numbers[turn - 1]] = turn;
    }
    sol2 = numbers[turn - 1];

    while (turn < limit) {
        uint32_t prev = last_spoken[sol2];
        last_spoken[sol2] = turn;
        sol2 = prev ? turn - prev : 0;
        if (++turn == 2020) {
            sol1 = sol2;
        }
    }

    return {std::make_pair((int)sol1, (int)sol2)};
}
