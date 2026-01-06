// Notes:
// The largest solution is:
// 97919997299495

// Then the lowest solution per first digits:
// 91619131181135
// 81619131181134
// 71619131181133
// 61619131181132
// 51619131181131

// I actually only calculated the first two and then decucted the correct solution 51619131181131 from that.
// The last digit is always 1 less than the one before. It could have been something lower. But 41619131181130
// didn't make sense because of the 0 and 41619131181129 didn't work either. So I tried 51619131181131 and that
// was correct.

#include <algorithm>
#include <atomic>
#include <chrono>
#include <cmath>
#include <fstream>
#include <iostream>
#include <map>
#include <mutex>
#include <random>
#include <sstream>
#include <stdexcept>
#include <string>
#include <string>
#include <thread>
#include <thread>
#include <vector>

// #define CHECK_PSEUDOCODE
// #define SAFETLY_CHECKS

#ifdef CHECK_PSEUDOCODE
#define FAIL_EARLY(stmt) stmt
#else
#define FAIL_EARLY(stmt) return -1
#endif

class Instruction; // Forward declaration
int pseudocode(const std::vector<int> &input);

class Processor {
  public:
    std::vector<Instruction *> program;
    std::map<std::string, int> registers = {{"w", 0}, {"x", 0}, {"y", 0}, {"z", 0}};
    std::vector<int> input;
    bool logging = true;
    int ip = 0;

    Processor(const std::vector<std::string> &instructions);
    ~Processor();
    void reset();
    void executeProgram(const std::vector<int> &in);
};

class Instruction {
  public:
    std::string name, op1, op2;

    Instruction(const std::string &n, const std::string &o1, const std::string &o2 = "") : name(n), op1(o1), op2(o2) {
    }
    virtual ~Instruction() = default;

    virtual void execute(Processor &processor) = 0;
    virtual std::string toString() const {
        return name + " " + op1 + (op2.empty() ? "" : (" " + op2));
    }

  protected:
    int getOperand(const std::string &op, Processor &p) const {
        if (op == "w" || op == "x" || op == "y" || op == "z") {
            return p.registers[op];
        }
        return std::stoi(op);
    }
};

class Inp : public Instruction {
  public:
    Inp(const std::string &o1) : Instruction("inp", o1) {
    }
    void execute(Processor &p) override {
        if (p.input.empty()) {
            throw std::runtime_error("No more input available");
        }
        p.registers[op1] = p.input.front();
        p.input.erase(p.input.begin());
    }
};

class Add : public Instruction {
  public:
    Add(const std::string &o1, const std::string &o2) : Instruction("add", o1, o2) {
    }
    void execute(Processor &p) override {
        p.registers[op1] = p.registers[op1] + getOperand(op2, p);
    }
};

class Mul : public Instruction {
  public:
    Mul(const std::string &o1, const std::string &o2) : Instruction("mul", o1, o2) {
    }
    void execute(Processor &p) override {
        p.registers[op1] = p.registers[op1] * getOperand(op2, p);
    }
};

class Div : public Instruction {
  public:
    Div(const std::string &o1, const std::string &o2) : Instruction("div", o1, o2) {
    }
    void execute(Processor &p) override {
        int v1 = p.registers[op1];
        int v2 = getOperand(op2, p);
        if (v2 == 0) {
            throw std::runtime_error("Division by zero");
        }
        int val = v1 / v2;
        // round towards zero
        if (v1 < 0 && v1 % v2 != 0) {
            val = std::ceil((double)v1 / v2);
        } else {
            val = std::floor((double)v1 / v2);
        }
        p.registers[op1] = val;
    }
};

class Mod : public Instruction {
  public:
    Mod(const std::string &o1, const std::string &o2) : Instruction("mod", o1, o2) {
    }
    void execute(Processor &p) override {
        int v1 = p.registers[op1];
        int v2 = getOperand(op2, p);
        // if (v1 < 0 || v2 <= 0) {
        //     throw std::runtime_error("Invalid mod");
        // }
        p.registers[op1] = v1 % v2;
    }
};

class Eql : public Instruction {
  public:
    Eql(const std::string &o1, const std::string &o2) : Instruction("eql", o1, o2) {
    }
    void execute(Processor &p) override {
        int v1 = p.registers[op1];
        int v2 = getOperand(op2, p);
        p.registers[op1] = (v1 == v2) ? 1 : 0;
    }
};

// Implementation of Processor methods
Processor::Processor(const std::vector<std::string> &instructions) {
    for (const auto &line : instructions) {
        std::istringstream iss(line);
        std::string cmd, a, b;
        iss >> cmd >> a;
        if (cmd == "inp") {
            program.push_back(new Inp(a));
        } else {
            iss >> b;
            if (cmd == "add") {
                program.push_back(new Add(a, b));
            } else if (cmd == "mul") {
                program.push_back(new Mul(a, b));
            } else if (cmd == "div") {
                program.push_back(new Div(a, b));
            } else if (cmd == "mod") {
                program.push_back(new Mod(a, b));
            } else if (cmd == "eql") {
                program.push_back(new Eql(a, b));
            } else {
                throw std::runtime_error("Unknown instruction: " + cmd);
            }
        }
    }
}
Processor::~Processor() {
    for (auto *instr : program) {
        delete instr;
    }
}
void Processor::reset() {
    registers = {{"w", 0}, {"x", 0}, {"y", 0}, {"z", 0}};
    input.clear();
    ip = 0;
}

void Processor::executeProgram(const std::vector<int> &in) {
    input = in;
    for (auto *instr : program) {
        instr->execute(*this);
        ip++;
    }
}

static std::map<std::string, std::chrono::high_resolution_clock::time_point> start_times;

void start_take_time(const std::string &label) {
    start_times[label] = std::chrono::high_resolution_clock::now();
}

void end_take_time(const std::string &label) {
    auto end = std::chrono::high_resolution_clock::now();
    auto it = start_times.find(label);
    if (it != start_times.end()) {
        std::chrono::duration<double> elapsed = end - it->second;
        std::cout << label << " took " << elapsed.count() << " seconds\n"
                  << std::endl;
        start_times.erase(it);
    } else {
        std::cout << "No start time recorded for label: " << label << std::endl;
    }
}

bool has_zero_digit(long long num) {
    while (num > 0) {
        if (num % 10 == 0) {
            return true;
        }
        num /= 10;
    }
    return false;
}

void check_pseudocode(Processor &processor) {
    start_take_time("CHECK_PSEUDOCODE");

    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(1, 9);
    for (int i = 0; i < 50000; ++i) {
        std::vector<int> inputDigits(14);
        for (int &d : inputDigits) {
            d = dis(gen);
        }
        processor.reset();
        processor.executeProgram(inputDigits);
        int z1 = processor.registers["z"];
        int z2 = pseudocode(inputDigits);
        if (z1 != z2) {
            std::cout << "Discrepancy found for input ";
            for (int d : inputDigits) {
                std::cout << d;
            }
            std::cout << ": processor z=" << z1 << ", pseudocode z=" << z2 << std::endl;
            throw std::runtime_error("Discrepancy found");
        }
    }

    std::cout << "Pseudocode check passed!" << std::endl;

    end_take_time("CHECK_PSEUDOCODE");
}

std::mutex out_mutex;

std::string digits_to_string(const std::vector<int> &digits) {
    std::string s;
    for (int d : digits) s += ('0' + d);
    return s;
}

long long digits_to_number(const std::vector<int> &digits) {
    long long num = 0;
    for (int d : digits) {
        num = num * 10 + d;
    }
    return num;
}

void print_digits(std::string text, const std::vector<int> &digits) {
    std::lock_guard<std::mutex> lock(out_mutex);

    std::cout << text << ": " << digits_to_string(digits) << std::endl;
}

#ifdef SAFETLY_CHECKS

void check_loop_end(std::vector<int> &inputDigits, long long chunk_end) {
    // Safety check: inputDigits should now be chunk_end -1
    long long curr_input = digits_to_number(inputDigits);

    // because we ended one after we add 1 and consider 0s as 1s
    curr_input++;
    std::string curr_input_str = std::to_string(curr_input);
    for (char &c : curr_input_str) {
        if (c == '0') {
            c = '1';
        }
    }
    curr_input = std::stoll(curr_input_str);

    if (curr_input != chunk_end) {
        std::lock_guard<std::mutex> lock(out_mutex);
        std::cerr << "Safety check failed: expected inputDigits to be " << chunk_end << ", got " << curr_input << std::endl;
        throw std::runtime_error("Safety check failed");
    }
}

void check_chuck_size(std::vector<int> &inputDigits, long long chunk_start, long long chunk_end, const long long chunk_size) {
    // Precompute number of valid (no zero) numbers in chunk for validation
    print_digits("starting with model number", inputDigits);
    long long valid_count = 0;
    std::vector<int> testDigits = inputDigits;
    long long testNum = chunk_start;
    while (testNum >= chunk_end) {
        bool has_zero = false;
        for (int d : testDigits) {
            if (d == 0) {
                has_zero = true;
                break;
            }
        }
        if (!has_zero) {
            ++valid_count;
        }
        int pos = 13;
        while (pos >= 8) {
            if (testDigits[pos] > 1) {
                testDigits[pos]--;
                break;
            } else {
                testDigits[pos] = 9;
                pos--;
            }
        }
        if (pos < 8) {
            break;
        }
        testNum = 0;
        for (int d : testDigits) {
            testNum = testNum * 10 + d;
        }
    }
    if (valid_count != chunk_size) {
        std::lock_guard<std::mutex> lock(out_mutex);
        std::cerr << "[Thread] Chunk at " << chunk_start << " has valid_count=" << valid_count << ", expected " << chunk_size << std::endl;
        throw std::runtime_error("Safety check failed");
    }
}

#endif

// Pseudocode function
int pseudocode(const std::vector<int> &input) {
    int x = 0;
    int z = 0;
    int w = 0;

    w = input[0];
    x = z % 26 + 12;
    if (x != w) {
        z = 26 * z + w + 7;
    }

    w = input[1];
    x = z % 26 + 12;
    if (x != w) {
        z = 26 * z + w + 8;
    }

    w = input[2];
    x = z % 26 + 13;
    if (x != w) {
        z = 26 * z + w + 2;
    }

    w = input[3];
    x = z % 26 + 12;
    if (x != w) {
        z = 26 * z + w + 11;
    }

    w = input[4];
    x = z % 26 - 3;
    z = z / 26;
    if (x != w) {
        FAIL_EARLY(z = 26 * z + w + 6);
    }

    w = input[5];
    x = z % 26 + 10;
    if (x != w) {
        z = 26 * z + w + 12;
    }

    w = input[6];
    x = z % 26 + 14;
    if (x != w) {
        z = 26 * z + w + 14;
    }

    w = input[7];
    x = z % 26 - 16;
    z = z / 26;
    if (x != w) {
        FAIL_EARLY(z = 26 * z + w + 13);
    }

    w = input[8];
    x = z % 26 + 12;
    if (x != w) {
        z = 26 * z + w + 15;
    }

    w = input[9];
    x = z % 26 - 8;
    z = z / 26;
    if (x != w) {
        FAIL_EARLY(z = 26 * z + w + 10);
    }

    w = input[10];
    x = z % 26 - 12;
    z = z / 26;
    if (x != w) {
        FAIL_EARLY(z = 26 * z + w + 6);
    }

    w = input[11];
    x = z % 26 - 7;
    z = z / 26;
    if (x != w) {
        FAIL_EARLY(z = 26 * z + w + 10);
    }

    w = input[12];
    x = z % 26 - 6;
    z = z / 26;
    if (x != w) {
        FAIL_EARLY(z = 26 * z + w + 8);
    }

    w = input[13];
    x = z % 26 - 11;
    z = z / 26;
    if (x != w) {
        FAIL_EARLY(z = 26 * z + w + 5);
    }

    return z;
}

int main() {
    // Read instructions from input.txt
    std::ifstream infile("input.txt");
    std::vector<std::string> lines;
    std::string line;
    while (std::getline(infile, line)) {
        if (!line.empty()) {
            lines.push_back(line);
        }
    }
    Processor processor(lines);
    processor.logging = false;

#ifdef CHECK_PSEUDOCODE
    check_pseudocode(processor);
    exit(0);
#endif

    // --------------------- 01234567890123
    std::string start_val = "97999999999999";

    // parallelized main search loop
    unsigned int num_cores = std::thread::hardware_concurrency();
    const int num_threads = num_cores - 1;
    const long long chunk_size = 531441LL; // 9^6
    std::atomic<long long> next_chunk(0);

    long long start_num = std::stoll(start_val);
    long long end_num = 11111111111111LL;

    // find the first chunk boundary below or equal to start_num
    long long boundary = start_num - (start_num % 1000000LL) + 999999LL;
    if (boundary > start_num) {
        boundary -= 1000000LL;
    }
    if (boundary < end_num) {
        boundary = end_num;
    }

    auto worker = [&]() {
        int last = -1;

        std::vector<int> inputDigits(14);
        while (true) {
            long long chunk_idx = next_chunk.fetch_add(1);
            long long chunk_start = boundary - chunk_idx * 1000000LL;
            long long chunk_end = chunk_start - 888888LL; // 999999 to 111111
            if (chunk_start < end_num) {
                break;
            }
            if (has_zero_digit(chunk_start)) {
                continue;
            }

            // Set inputDigits to chunk_start
            long long tmp = chunk_start;
            for (int i = 13; i >= 0; --i) {
                inputDigits[i] = tmp % 10;
                tmp /= 10;
            }

            int curr = inputDigits[2];
            if (curr != last) {
                print_digits("Starting new chunk at ", inputDigits);
                last = curr;
            }

#ifdef SAFETLY_CHECKS
            check_chuck_size(inputDigits, chunk_start, chunk_end, chunk_size);
#endif

            // process exactly 531441 numbers (all digits 1-9)
            for (long long iter = 0; iter < chunk_size; ++iter) {
                // print_digits("Checking model number", inputDigits);
                int z = pseudocode(inputDigits);
                if (z == 0) {
                    std::lock_guard<std::mutex> lock(out_mutex);
                    std::cout << "Found valid model number: " << digits_to_string(inputDigits) << std::endl;
                }

                // decrement last digits
                int pos = 13;
                while (pos >= 0) {
                    if (inputDigits[pos] > 1) {
                        inputDigits[pos]--;
                        break;
                    } else {
                        inputDigits[pos] = 9;
                        pos--;
                    }
                }
            }

#ifdef SAFETLY_CHECKS
            check_loop_end(inputDigits, chunk_end);
#endif
        }
    };

    start_take_time("MAIN_SEARCH");

    std::vector<std::thread> threads;

    for (int t = 0; t < num_threads; ++t) {
        threads.emplace_back(worker);
    }
    for (auto &th : threads) {
        th.join();
    }

    end_take_time("MAIN_SEARCH");

    return 0;
}
