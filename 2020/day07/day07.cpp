#include <fstream>
#include <regex>
#include <set>
#include <string>

#include "../../cpp/startup.h"

#define FILE "input.txt"

class Bag {
   public:
    std::string name;
    std::map<Bag*, int> children;
    std::vector<Bag*> parents;

    Bag() = default;
    Bag(const std::string n) : name(n) {
    }

    void add_child(Bag* child, int amount) {
        children[child] = amount;
        child->parents.push_back(this);
    }

    int count_parents(Bag* bag, std::set<std::string>& visited) {
        for (Bag* parent : bag->parents) {
            if (visited.find(parent->name) == visited.end()) {
                visited.insert(parent->name);
                count_parents(parent, visited);
            }
        }
        return visited.size();
    }

    int count_children(Bag* bag) {
        int total = 0;
        for (const auto& [child, amount] : bag->children) {
            total += amount * count_children(child);
        }
        return total + 1;
    }

    static Bag* get_bag(std::map<std::string, Bag>& bags, const std::string& name) {
        if (bags.find(name) == bags.end()) {
            bags[name] = Bag(name);
        }
        return &bags[name];
    }
};

SolutionType solve() {
    std::ifstream infile(FILE);
    std::string line;
    std::regex pattern1("(.*) bags contain (.*)");
    std::regex pattern2("(\\d+) (.*?) bag");
    std::map<std::string, Bag> bags;
    std::set<std::string> visited;

    while (std::getline(infile, line)) {
        std::smatch match1;
        if (std::regex_search(line, match1, pattern1)) {
            std::string bag_name = match1[1];
            std::string rest = match1[2];
            Bag* b = Bag::get_bag(bags, bag_name);
            for (std::sregex_iterator it(line.begin(), line.end(), pattern2), end_it; it != end_it; ++it) {
                std::smatch match = *it;
                Bag* child_bag = Bag::get_bag(bags, match[2]);
                b->add_child(child_bag, std::stoi(match[1]));
            }
        }
    }

    Bag* shiny_gold = Bag::get_bag(bags, "shiny gold");
    int sol1 = shiny_gold->count_parents(shiny_gold, visited);
    int sol2 = shiny_gold->count_children(shiny_gold) - 1;

    return {std::make_pair(sol1, sol2)};
}
