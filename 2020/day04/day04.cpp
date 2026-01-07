#include <fstream>
#include <regex>
#include <set>
#include <string>

#include "../../cpp/startup.h"

#define FILE "input.txt"

SolutionType solve() {
    int sol1 = 0, sol2 = 0;
    std::regex pattern("([^\\s:]+):([^\\s:]+)");
    std::regex hcl("#[0-9a-f]{6}");
    std::regex ecl("amb|blu|brn|gry|grn|hzl|oth");
    std::set<std::string> required = {"byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid"};

    auto check = [&](const std::string& p) {
        if (p.empty()) {
            return;
        }
        std::map<std::string, std::string> present;
        for (std::sregex_iterator i(p.begin(), p.end(), pattern), end; i != end; ++i) {
            present.insert({(*i)[1], (*i)[2]});
        }
        if (!std::all_of(required.begin(), required.end(), [&](const std::string& x) { return present.count(x); })) {
            return;
        }
        sol1++;
        bool valid = true;
        for (const auto& [key, value] : present) {
            if (key == "byr") {
                valid &= std::stoi(value) >= 1920 && std::stoi(value) <= 2002;
            } else if (key == "iyr") {
                valid &= std::stoi(value) >= 2010 && std::stoi(value) <= 2020;
            } else if (key == "eyr") {
                valid &= std::stoi(value) >= 2020 && std::stoi(value) <= 2030;
            } else if (key == "hgt") {
                valid &= (value.ends_with("cm") && std::stoi(value) >= 150 && std::stoi(value) <= 193) ||
                         (value.ends_with("in") && std::stoi(value) >= 59 && std::stoi(value) <= 76);
            } else if (key == "hcl") {
                valid &= std::regex_match(value, hcl);
            } else if (key == "ecl") {
                valid &= std::regex_match(value, ecl);
            } else if (key == "pid") {
                valid &= value.size() == 9 && std::all_of(value.begin(), value.end(), ::isdigit);
            }
        }
        sol2 += valid;
    };

    std::ifstream infile(FILE);
    std::string line, current;
    while (std::getline(infile, line)) {
        if (line.empty()) {
            check(current);
            current.clear();
        } else {
            current += line + " ";
        }
    }
    check(current);

    return {std::make_pair(sol1, sol2)};
}
