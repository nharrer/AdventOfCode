import networkx as nx  # pip install networkx
import re

INPUT_FILE = 'input.txt'
INPUT_FILE_TEST = 'input.test.txt'
DEBUG = False


class Part:
    def __init__(self, rateingmap):
        self.rateingmap = rateingmap
        self.sum = sum(rateingmap.values())

    def __repr__(self):
        return f'Part(x={self.rateingmap["x"]},m={self.rateingmap["m"]},a={self.rateingmap["a"]},s={self.rateingmap["s"]})'

    def __str__(self):
        return self.__repr__()


class Workflow:
    def __init__(self, name, rules):
        self.name = name
        self.rules = rules

    def __repr__(self):
        return f'Workflow({self.name}={self.rules})'

    def __str__(self):
        return self.__repr__()


class Rule:
    def __init__(self, name, parameter, condition, value, destination):
        self.name = name
        self.parameter = parameter
        self.condition = condition
        self.value = value
        self.destination = destination

    def evaluate(self, value, invert=False):
        if self.condition == '<':
            result = value < self.value
        elif self.condition == '>':
            result = value > self.value
        elif self.condition == 'F':
            result = True
        return not result if invert else result

    def __repr__(self):
        if self.condition == 'F':
            return f'Rule(->{self.destination})'
        return f'Rule({self.parameter}{self.condition}{self.value}->{self.destination})'

    def __str__(self):
        return self.__repr__()


class Processor:
    def __init__(self, filename):
        self.workflows = {}
        self.rules = {}
        self.parts = []

        with open(filename) as f:
            lines = [line.rstrip() for line in f]
            while lines[0] != '':
                line = lines.pop(0)
                subs = re.split('[{,}]', line)
                subs.pop()
                workflowname = subs[0]
                rules = []
                r = 1
                for sub in subs[1:]:
                    if ':' in sub:
                        partsr = sub.split(':')
                        param = partsr[0][0]
                        condition = partsr[0][1]
                        value = int(partsr[0][2:])
                        rule = Rule(f'R{workflowname}{r}', param, condition, value, partsr[1])
                    else:
                        rule = Rule(f'R{workflowname}{r}', 'F', 'F', 0, sub)

                    rules.append(rule)
                    self.rules[rule.name] = rule

                    r += 1
                self.workflows[workflowname] = Workflow(workflowname, rules)
            self.start_workflow = self.workflows['in']
            lines.pop(0)

            for line in lines:
                subs = line[1:-1].split(',')
                rateingmap = {}
                for sub in subs:
                    subs2 = sub.split('=')
                    rateingmap[subs2[0]] = int(subs2[1])
                self.parts.append(Part(rateingmap))

    def process(self, part):
        workflow_list = []
        workflow = self.start_workflow
        while workflow is not None:
            workflow_list.append(workflow.name)
            next = None
            for rule in workflow.rules:
                value = part.rateingmap.get(rule.parameter)
                if rule.evaluate(value):
                    next = rule.destination
                    break
            if next == 'R':
                self.dump(part, workflow_list, 'REJECT')
                return False
            if next == 'A':
                self.dump(part, workflow_list, 'ACCEPT')
                return True
            workflow = self.workflows[next]

    def dump(self, part, workflow_list, result):
        if DEBUG:
            print(f'{part}: ', end='')
            for workflow in workflow_list:
                print(f'{workflow} -> ', end='')
            print(result)

    def solve1(self):
        return sum(map(lambda part: part.sum if self.process(part) else 0, self.parts))

    def solve2(self):
        G = self.build_graph()

        # find all paths from node IN to node A
        summe = 0
        for path in nx.all_simple_edge_paths(G, 'IN', 'A'):
            debug = []
            space = {'x': set(range(1, 4000 + 1)), 'm': set(range(1, 4000 + 1)), 'a': set(range(1, 4000 + 1)), 's': set(range(1, 4000 + 1))}
            for edge in path:
                attr = G[edge[0]][edge[1]]
                rulename = attr.get('rule')
                rule = self.rules[rulename] if rulename is not None else None
                if rule and rule.condition != 'F':
                    invert = attr.get('invert') is True
                    rr = space[rule.parameter]
                    rr = self.filter_range(rr, rule, invert, debug)
                    space[rule.parameter] = rr
            debug.append('A:  ')

            vspace = 1
            for key in ['x', 'm', 'a', 's']:
                rr = space[key]
                rstr = '-'
                if len(rr) > 0:
                    rmin = min(rr)
                    rmax = max(rr)
                    rstr = f'{rmin}-{rmax}'
                debug.append(f'{key}={rstr} ')
                vspace *= len(rr)
            summe += vspace

            debug.append(f': Value Space={vspace}')
            if DEBUG:
                print(''.join(debug))

        return summe

    def build_graph(self):
        G = nx.DiGraph()
        G.add_node('IN')
        G.add_node('A')
        G.add_node('R')
        for rule in self.rules.values():
            G.add_node(rule.name)

        G.add_edge('IN', self.start_workflow.rules[0].name)
        for workflow in self.workflows.values():
            lastrule = None
            for rule in workflow.rules:
                if lastrule is not None:
                    G.add_edge(lastrule.name, rule.name, rule=lastrule.name, invert=True)
                if rule.destination == 'A':
                    G.add_edge(rule.name, 'A', rule=rule.name)
                elif rule.destination == 'R':
                    G.add_edge(rule.name, 'R', rule=rule.name)
                else:
                    G.add_edge(rule.name, self.workflows[rule.destination].rules[0].name, rule=rule.name)
                lastrule = rule

        nx.write_graphml(G, 'graph.graphml')  # for visualization in cytoscape
        return G

    def filter_range(self, prange, rule, invert, debug):
        # Here we could use lower and upper bounds instead of sets, in order to improve performance. But mehh.
        prange = set(filter(lambda v: rule.evaluate(v, invert), prange))
        debug.append(f'{rule.parameter}{rule.condition}{rule.value}{"(invert)" if invert else ""} -> ')
        return prange


processor = Processor(INPUT_FILE)
print(f'Solution 1: {processor.solve1()}')
print(f'Solution 2: {processor.solve2()}')
