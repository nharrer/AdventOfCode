import networkx as nx
import re


class Machine:
    def __init__(self, filename):
        self.nodes = dict()
        self.G = nx.Graph()
        with open(filename) as f:
            lines = [line.strip() for line in f.readlines()]

        for line in lines:
            parts = re.split('[: ]+', line)
            self.G.add_node(parts[0])
            for name in parts[1:]:
                self.G.add_node(name)
                self.G.add_edge(parts[0], name)

        # export graph for visualization in cytoscape
        nx.write_graphml(self.G, 'graph.graphml')

    def solve(self, edges):
        self.G.remove_edges_from(edges)
        connected = list(nx.connected_components(self.G))
        return len(connected[0]) * len(connected[1])


machine = Machine('input.txt')
# looking at the graph, we can easily see the 3 edges, that need to be removed
print(f"Solution 1: {machine.solve([('klj', 'scr'), ('mxv', 'sdv'), ('vbk', 'gqr')])}")
