import networkx as nx
from solve_day23 import INPUT_FILE, INPUT_FILE_TEST, Maze


def init_distances(maze):
    G = create_grapth()
    end = (maze.end.x, maze.end.y)
    for node in maze.complexnodes:
        if node != maze.end:
            p1 = (node.x, node.y)
            node.mindistance = nx.shortest_path_length(G, p1, end, 'weight', 'dijkstra')


def create_grapth(maze):
    # This is not needed for the solution. It just exports the graph to a file for visualization.
    G = nx.Graph()
    for node in maze.complexnodes:
        G.add_node((node.x, node.y))
    for node in maze.complexnodes:
        for neighbor, weight in node.edges.items():
            G.add_edge((node.x, node.y), (neighbor.x, neighbor.y), weight=weight)
    nx.write_graphml(G, 'graph.graphml')  # for visualization in cytoscape
    return G


def print(maze, nodeway=None):
    for y in range(maze.height):
        for x in range(maze.width):
            node = maze.nodes.get((x, y))
            if node is not None:
                if nodeway is not None and node in nodeway:
                    print('O', end='')
                else:
                    print(node.slope if node.slope else '.', end='')
            else:
                print('#', end='')
        print()
    print()


if __name__ == '__main__':
    maze = Maze(INPUT_FILE_TEST)
    create_grapth(maze)
