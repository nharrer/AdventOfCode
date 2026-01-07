#pragma once

#include <chrono>
#include <iostream>
#include <map>
#include <variant>

using SolutionType = std::variant<std::pair<std::string, std::string>, std::pair<int, int>, std::pair<long, long>>;

static std::map<std::string, std::chrono::high_resolution_clock::time_point> start_times;

SolutionType solve();

void start_take_time(const std::string& label) {
    start_times[label] = std::chrono::high_resolution_clock::now();
}

void end_take_time(const std::string& label) {
    auto end = std::chrono::high_resolution_clock::now();
    auto it = start_times.find(label);
    if (it != start_times.end()) {
        auto duration_us = std::chrono::duration_cast<std::chrono::microseconds>(end - it->second).count();
        std::cout << label << " took " << duration_us / 1000.0 << " ms\n"
                  << std::endl;
        start_times.erase(it);
    } else {
        std::cout << "No start time recorded for label: " << label << std::endl;
    }
}

int main() {
    auto start = std::chrono::high_resolution_clock::now();

    SolutionType sol = solve();

    auto end = std::chrono::high_resolution_clock::now();

    std::string sol1 = "";
    std::string sol2 = "";

    if (std::holds_alternative<std::pair<std::string, std::string>>(sol)) {
        auto res = std::get<std::pair<std::string, std::string>>(sol);
        sol1 = res.first;
        sol2 = res.second;
    } else if (std::holds_alternative<std::pair<int, int>>(sol)) {
        auto res = std::get<std::pair<int, int>>(sol);
        sol1 = std::to_string(res.first);
        sol2 = std::to_string(res.second);
    } else if (std::holds_alternative<std::pair<long, long>>(sol)) {
        auto res = std::get<std::pair<long, long>>(sol);
        sol1 = std::to_string(res.first);
        sol2 = std::to_string(res.second);
    }

    std::cout << "Solution Part 1: " << sol1 << std::endl;
    std::cout << "Solution Part 2: " << sol2 << std::endl;

    auto duration_us = std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();
    std::cout << "Duration: " << duration_us / 1000.0 << " ms" << std::endl;
}
