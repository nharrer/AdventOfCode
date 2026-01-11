#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <set>

#include "../../cpp/startup.h"

#define FILE "input.txt"

typedef uint64_t LargeNumber;

std::set<int> adapters;

LargeNumber find(int current, int max, std::set<int> available, int& cnt1, int& cnt3, std::map<int, LargeNumber>& memo, bool part1) {
    if (current == max) {
        return 1;
    }
    if (!part1 && memo.find(current) != memo.end()) {
        return memo[current];
    }

    available.erase(current);

    LargeNumber cnt = 0;
    for (int diff = 1; diff <= 3; diff++) {
        int next = current + diff;
        if (available.find(next) != available.end()) {
            LargeNumber n = find(next, max, available, cnt1, cnt3, memo, part1);
            if (n > 0) {
                cnt += n;
                if (part1) {
                    cnt1 += (diff == 1) ? n : 0;
                    cnt3 += (diff == 3) ? n : 0;
                    return 1;
                }
            }
        }
    }

    memo[current] = cnt;
    return cnt;
}

SolutionType solve() {
    std::ifstream infile(FILE);
    std::string line;
    while (std::getline(infile, line)) {
        int j = std::stoi(line);
        adapters.insert(j);
    }

    int max = *adapters.rbegin() + 3;
    adapters.insert(max);

    int cnt1 = 0, cnt3 = 0;
    std::map<int, LargeNumber> memo;
    find(0, max, adapters, cnt1, cnt3, memo, true);
    LargeNumber sol1 = cnt1 * cnt3;
    LargeNumber sol2 = find(0, max, adapters, cnt1, cnt3, memo, false);

    return {std::make_pair((uint64_t)sol1, (uint64_t)sol2)};
}
