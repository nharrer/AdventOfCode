import math
import networkx as nx  # pip install networkx

INPUT_FILE = 'input.txt'
INPUT_FILE_TEST1 = 'input.test1.txt'
INPUT_FILE_TEST2 = 'input.test2.txt'


class Gate:
    def __init__(self, type, name):
        self.type = type
        self.name = name
        self.inputstates = {}

    def add_input(self, inputname):
        self.inputstates[inputname] = 0

    def __str__(self) -> str:
        return self.__repr__()

    def __repr__(self) -> str:
        return f'{self.type}{self.name}: {self.inputstates}'


class Broadcaster(Gate):
    def input_pulse(self, inputname, pulse):
        return pulse


class FlipFlop(Gate):
    internalstate = 0

    def input_pulse(self, inputname, pulse):
        self.inputstates[inputname] = pulse
        if pulse == 0:
            self.internalstate = (self.internalstate + 1) % 2
            return self.internalstate
        return None


class Conjunction(Gate):
    def input_pulse(self, inputname, pulse):
        self.inputstates[inputname] = pulse
        if len(list(filter(lambda x: x == 0, self.inputstates.values()))) == 0:  # all inputs are 1
            return 0
        else:
            return 1


class System:
    def __init__(self, filename):
        self.gates = {}
        self.count = [0, 0]

        lines = self.readfile(filename)
        for line in lines:
            parts = line.split(' -> ')
            name = parts[0]
            if name == 'broadcaster':
                gate = Broadcaster('', name)
                gate.add_input('button')
            elif name[0] == '%':
                gate = FlipFlop(name[0], name[1:])
            elif name[0] == '&':
                gate = Conjunction(name[0], name[1:])
            else:
                raise Exception(f'Unknown gate type: {name}')
            self.gates[gate.name] = gate

        for line in lines:
            parts = line.split(' -> ')
            input = parts[0]
            if input[0] in ('%', '&'):
                input = input[1:]
            parts2 = parts[1].split(', ')
            for part in parts2:
                gate = self.gates.get(part)
                if gate is None:
                    gate = Broadcaster('', part)
                    self.gates[part] = gate
                gate.add_input(input)

    def push_button(self, detect_gates_low=None):
        pulses = [('button', 0)]
        while len(pulses) > 0:
            inp, pulse = pulses.pop(0)
            if detect_gates_low and inp in detect_gates_low.keys() and pulse == 1:
                detect_gates_low[inp] = 1
            for gate in filter(lambda g: inp in g.inputstates.keys(), self.gates.values()):
                self.count[pulse] += 1
                result = gate.input_pulse(inp, pulse)
                if result is not None:
                    next_pulse = (gate.name, result)
                    pulses.append(next_pulse)
                    # print(f'{inp} -{"high" if pulse else "low"} -> {gate.name}')

    def readfile(self, filename):
        with open(filename) as f:
            lines = f.readlines()
            lines = [line.strip() for line in lines]
            return lines

    def solve1(self):
        for _ in range(0, 1000):
            self.push_button()
        return self.count[0] * self.count[1]

    def solve2(self):
        # There is a nand gate before the rx gate. Find all inputs to that nand.
        gate_rx = self.gates['rx']
        parent_nand_name = list(gate_rx.inputstates.keys())[0]
        parent_nand = self.gates[parent_nand_name]
        counter_exits = list(parent_nand.inputstates.keys())
        detect_gates_low = {}
        for counter_exit in counter_exits:
            detect_gates_low[counter_exit] = 0

        # We monitor the cycles until each gate transitions to a low state for the first time.
        # This transition occurs periodically for every input. The first time when all inputs
        # are simultaneously low can be determined by finding the smallest common multiple of the
        # individual cycle counts.
        btn_count = 1
        while True:
            self.push_button(detect_gates_low)
            detected = next(map(lambda i: i[0], filter(lambda i: i[1] == 1, detect_gates_low.items())), None)
            if detected:
                detect_gates_low[detected] = btn_count
                if not any(list(filter(lambda i: i[1] == 0, detect_gates_low.items()))):
                    return math.lcm(*detect_gates_low.values())
            btn_count += 1

    def export_graph(self):
        # This is not needed for the solution. It just exports the graph to a file for visualization.
        G = nx.DiGraph()
        G.add_node('button')
        for gate in self.gates.values():
            G.add_node(f'{gate.type}{gate.name}')

        for gate in self.gates.values():
            for input in gate.inputstates.keys():
                if input == 'button':
                    name1 = input
                else:
                    gate1 = self.gates.get(input)
                    name1 = f'{gate1.type}{gate1.name}'
                G.add_edge(name1, f'{gate.type}{gate.name}')

        nx.write_graphml(G, 'graph.graphml')  # for visualization in cytoscape
        return G


system = System(INPUT_FILE)
print(f'Solution 1: {system.solve1()}')
system = System(INPUT_FILE)  # important: reset all states
print(f'Solution 2: {system.solve2()}')
