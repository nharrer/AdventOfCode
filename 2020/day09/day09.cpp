#include <fstream>
#include <iostream>
#include <regex>
#include <set>
#include <string>
#include <vector>

#include "../../cpp/startup.h"

#define FILE "input.txt"

typedef uint32_t N;

bool is_valid(const std::vector<N>& preamble, N number) {
    for (size_t i = 0; i < preamble.size(); i++) {
        for (size_t j = i + 1; j < preamble.size(); j++) {
            if (preamble[i] + preamble[j] == number) {
                return true;
            }
        }
    }
    return false;
}

SolutionType solve() {
    std::ifstream infile(FILE);
    std::string line;
    std::vector<N> numbers;
    while (std::getline(infile, line)) {
        numbers.push_back(std::stol(line));
    }

    int preamble_size = FILE == "input0.txt" ? 5 : 25;

    std::vector<N> preamble;
    for (int i = 0; i < preamble_size; i++) {
        preamble.push_back(numbers[i]);
    }

    int sol1 = -1;
    for (int i = preamble_size; i < numbers.size(); i++) {
        N n = numbers[i];
        if (!is_valid(preamble, n)) {
            std::cout << "Found invalid number " << n << " at line " << i + 1 << std::endl;
            sol1 = n;
            break;
        }
        preamble.push_back(n);
        preamble.erase(preamble.begin());
    }

    int sol2 = -1;
    for (size_t start = 0; start < (numbers.size() - 1); start++) {
        N sum, min, max;
        sum = min = max = numbers[start];
        for (size_t end = start + 1; end < numbers.size(); end++) {
            N n = numbers[end];
            sum += n;
            min = n < min ? n : min;
            max = n > max ? n : max;
            if (sum == sol1) {
                sol2 = min + max;
                goto break_outer;
            } else if (sum > sol1) {
                break;
            }
        }
    }
break_outer:

    return {std::make_pair(sol1, sol2)};
}
