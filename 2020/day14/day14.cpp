#include <fstream>
#include <regex>
#include <string>
#include <unordered_map>

#include "../../cpp/startup.h"

#define FILE "input.txt"

SolutionType solve() {
    std::ifstream infile(FILE);
    std::regex pattern(R"(mem\[(\d+)\]\s*=\s*(\d+))");
    std::unordered_map<u_int64_t, u_int64_t> memory1 = {};
    std::unordered_map<u_int64_t, u_int64_t> memory2 = {};
    std::vector<u_int64_t> floating_bits;
    uint64_t mask_0 = 0, mask_1 = 0;
    std::string line;
    while (std::getline(infile, line)) {
        if (!line.empty()) {
            if (line[1] == 'a') {
                mask_0 = mask_1 = 0;
                floating_bits.clear();
                uint64_t bit = 1;
                for (size_t i = line.size() - 1; i >= 7; i--) {
                    char c = line[i];
                    if (c == '0') {
                        mask_0 |= bit;
                    } else if (c == '1') {
                        mask_1 |= bit;
                    } else {
                        floating_bits.push_back(bit);
                    }
                    bit = bit << 1;
                }
            } else {
                std::smatch match;
                if (std::regex_search(line, match, pattern)) {
                    uint64_t addr = std::stoull(match[1]);
                    uint64_t val = std::stoull(match[2]);
                    // Part 1
                    memory1[addr] = (val | mask_1) & ~mask_0;
                    // Part 2
                    addr |= mask_1;
                    size_t combinations = 1 << floating_bits.size();
                    for (size_t i = 0; i < combinations; i++) {
                        for (size_t j = 0; j < floating_bits.size(); j++) {
                            if (i & (1 << j)) {
                                addr |= floating_bits[j];
                            } else {
                                addr &= ~floating_bits[j];
                            }
                        }
                        memory2[addr] = val;
                    }
                }
            }
        }
    }

    u_int64_t sol1 = 0, sol2 = 0;
    for (const auto& [_, val] : memory1) { sol1 += val; }
    for (const auto& [_, val] : memory2) { sol2 += val; }
    return {std::make_pair(sol1, sol2)};
}
