#include <fstream>
#include <iostream>
#include <regex>
#include <set>
#include <string>
#include <vector>

#include "../../cpp/startup.h"

#define FILE "input.txt"

enum class OpCode { ACC, JMP, NOP };

class Instruction {
   public:
    OpCode op;
    int arg;

    Instruction(std::string operation, int argument) : arg(argument) {
        if (operation == "acc") {
            op = OpCode::ACC;
        } else if (operation == "jmp") {
            op = OpCode::JMP;
        } else if (operation == "nop") {
            op = OpCode::NOP;
        }
    }
};

class Processor {
   public:
    int accumulator = 0;
    int sp = 0;
    bool infinite_loop = false;
    bool memory_exception = false;
    bool terminated = false;
    std::vector<Instruction> program;
    std::set<int> executed_sp;

    void compileLine(const std::string& line) {
        std::regex rgx(R"((\w{3}) ([+-]\d+))");
        std::smatch match;
        if (std::regex_search(line, match, rgx)) {
            std::string operation = match[1];
            int argument = std::stoi(match[2]);
            program.emplace_back(operation, argument);
        }
    }

    void reset() {
        accumulator = 0;
        sp = 0;
        infinite_loop = false;
        memory_exception = false;
        terminated = false;
        executed_sp.clear();
    }

    int run() {
        reset();
        while (!infinite_loop && !memory_exception && !terminated) {
            step();
        }
        return accumulator;
    }

    bool step() {
        if (sp == program.size()) {
            terminated = true;
            return true;
        }

        if (sp < 0 || sp > program.size()) {
            memory_exception = true;
            return true;
        }

        Instruction& instr = program[sp];
        if (executed_sp.find(sp) != executed_sp.end()) {
            infinite_loop = true;
            return true;
        }

        executed_sp.insert(sp);
        if (instr.op == OpCode::ACC) {
            accumulator += instr.arg;
            sp++;
        } else if (instr.op == OpCode::JMP) {
            sp += instr.arg;
        } else if (instr.op == OpCode::NOP) {
            sp++;
        }

        return false;
    }
};

SolutionType solve() {
    std::ifstream infile(FILE);
    std::string line;
    Processor cpu;
    while (std::getline(infile, line)) {
        cpu.compileLine(line);
    }

    int sol1 = cpu.run();

    int sol2 = -1;
    for (size_t i = 0; i < cpu.program.size(); i++) {
        Instruction& instr = cpu.program[i];
        if (instr.op == OpCode::JMP || instr.op == OpCode::NOP) {
            instr.op = (instr.op == OpCode::JMP) ? OpCode::NOP : OpCode::JMP;
            sol2 = cpu.run();
            if (cpu.terminated) {
                std::cout << "Fixed instruction at line " << i + 1 << std::endl;
                break;
            }
            instr.op = (instr.op == OpCode::JMP) ? OpCode::NOP : OpCode::JMP;
        }
    }

    return {std::make_pair(sol1, sol2)};
}
