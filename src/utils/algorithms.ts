import { Graph, AlgorithmResult, AlgorithmStep } from '../types';
import { getNeighbors, getNodeById } from './graphUtils';

// BFS - Breadth First Search
export function bfs(graph: Graph, startId: string, endId?: string): AlgorithmResult {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const parents = new Map<string, string | null>();
  const queue: string[] = [startId];
  
  parents.set(startId, null);
  
  steps.push({
    type: 'visit',
    nodeId: startId,
    message: `Starting BFS from node ${getNodeById(graph, startId)?.label}`,
    visited: new Set(visited),
    queue: [...queue],
  });

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    
    const currentNode = getNodeById(graph, currentId);
    
    steps.push({
      type: 'visit',
      nodeId: currentId,
      message: `Visiting node ${currentNode?.label}`,
      visited: new Set(visited),
      queue: [...queue],
    });

    if (endId && currentId === endId) {
      // Reconstruct path
      const path = reconstructPath(parents, endId);
      steps.push({
        type: 'complete',
        message: `Found target node ${getNodeById(graph, endId)?.label}! Path length: ${path.length - 1}`,
        currentPath: path,
        visited: new Set(visited),
      });
      return { steps, shortestPath: path };
    }

    const neighbors = getNeighbors(graph, currentId);
    for (const { node, edge } of neighbors) {
      if (!visited.has(node.id)) {
        steps.push({
          type: 'explore',
          nodeId: node.id,
          edgeId: edge.id,
          message: `Exploring edge to ${node.label}`,
          visited: new Set(visited),
          queue: [...queue, node.id],
        });
        
        if (!parents.has(node.id)) {
          parents.set(node.id, currentId);
          queue.push(node.id);
        }
      }
    }
  }

  steps.push({
    type: 'complete',
    message: endId ? `Target node not reachable from start` : `BFS traversal complete`,
    visited: new Set(visited),
  });

  return { steps };
}

// DFS - Depth First Search
export function dfs(graph: Graph, startId: string, endId?: string, detectCycles: boolean = true): AlgorithmResult {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const parents = new Map<string, string | null>();
  let hasCycle = false;
  let foundEnd = false;

  function dfsRecursive(nodeId: string, parentId: string | null): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    parents.set(nodeId, parentId);
    
    const node = getNodeById(graph, nodeId);
    
    steps.push({
      type: 'visit',
      nodeId,
      message: `Visiting node ${node?.label}`,
      visited: new Set(visited),
      stack: Array.from(recursionStack),
    });

    // Check if we reached the end node
    if (endId && nodeId === endId) {
      foundEnd = true;
      const path = reconstructPath(parents, endId);
      steps.push({
        type: 'complete',
        message: `Found target node ${node?.label}! Path length: ${path.length - 1}`,
        currentPath: path,
        visited: new Set(visited),
      });
      return true;
    }

    const neighbors = getNeighbors(graph, nodeId);
    for (const { node: neighbor, edge } of neighbors) {
      steps.push({
        type: 'explore',
        nodeId: neighbor.id,
        edgeId: edge.id,
        message: `Exploring edge to ${neighbor.label}`,
        visited: new Set(visited),
        stack: Array.from(recursionStack),
      });

      if (!visited.has(neighbor.id)) {
        if (dfsRecursive(neighbor.id, nodeId)) {
          return true;
        }
      } else if (detectCycles && recursionStack.has(neighbor.id)) {
        // For undirected graphs, ignore the parent
        if (graph.isDirected || neighbor.id !== parentId) {
          hasCycle = true;
          steps.push({
            type: 'cycle-detected',
            nodeId: neighbor.id,
            edgeId: edge.id,
            message: `Cycle detected! Back edge to ${neighbor.label}`,
            visited: new Set(visited),
          });
        }
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  parents.set(startId, null);
  dfsRecursive(startId, null);

  if (!foundEnd) {
    steps.push({
      type: 'complete',
      message: hasCycle 
        ? 'DFS complete - Cycle detected!' 
        : endId 
          ? `DFS complete - Target node not reachable`
          : 'DFS traversal complete - No cycle found',
      visited: new Set(visited),
    });
  }

  return { steps, hasCycle };
}

// Dijkstra's Algorithm
export function dijkstra(graph: Graph, startId: string, endId?: string): AlgorithmResult {
  const steps: AlgorithmStep[] = [];
  const distances = new Map<string, number>();
  const parents = new Map<string, string | null>();
  const visited = new Set<string>();
  const pq: { id: string; dist: number }[] = [];

  // Initialize distances
  for (const node of graph.nodes) {
    distances.set(node.id, node.id === startId ? 0 : Infinity);
  }
  parents.set(startId, null);
  pq.push({ id: startId, dist: 0 });

  steps.push({
    type: 'visit',
    nodeId: startId,
    message: `Starting Dijkstra from ${getNodeById(graph, startId)?.label}`,
    distances: new Map(distances),
    visited: new Set(visited),
  });

  while (pq.length > 0) {
    // Get minimum distance node
    pq.sort((a, b) => a.dist - b.dist);
    const { id: currentId, dist: currentDist } = pq.shift()!;

    if (visited.has(currentId)) continue;
    if (currentDist === Infinity) break;
    
    visited.add(currentId);
    const currentNode = getNodeById(graph, currentId);

    steps.push({
      type: 'visit',
      nodeId: currentId,
      message: `Processing ${currentNode?.label} with distance ${currentDist}`,
      distances: new Map(distances),
      visited: new Set(visited),
    });

    if (endId && currentId === endId) {
      const path = reconstructPath(parents, endId);
      steps.push({
        type: 'complete',
        message: `Shortest path found! Distance: ${distances.get(endId)}`,
        currentPath: path,
        distances: new Map(distances),
      });
      return { steps, shortestPath: path, distances };
    }

    const neighbors = getNeighbors(graph, currentId);
    for (const { node, edge, weight } of neighbors) {
      if (visited.has(node.id)) continue;

      const newDist = currentDist + weight;
      const oldDist = distances.get(node.id)!;

      steps.push({
        type: 'explore',
        nodeId: node.id,
        edgeId: edge.id,
        message: `Checking ${node.label}: current=${oldDist === Infinity ? '∞' : oldDist}, new=${newDist}`,
        distances: new Map(distances),
      });

      if (newDist < oldDist) {
        distances.set(node.id, newDist);
        parents.set(node.id, currentId);
        pq.push({ id: node.id, dist: newDist });

        steps.push({
          type: 'relax',
          nodeId: node.id,
          edgeId: edge.id,
          message: `Updated distance to ${node.label}: ${newDist}`,
          distances: new Map(distances),
        });
      }
    }
  }

  if (endId) {
    const path = reconstructPath(parents, endId);
    const dist = distances.get(endId);
    steps.push({
      type: 'complete',
      message: dist === Infinity ? 'No path exists' : `Shortest path found! Distance: ${dist}`,
      currentPath: dist === Infinity ? undefined : path,
      distances: new Map(distances),
    });
    return { steps, shortestPath: dist === Infinity ? undefined : path, distances };
  }

  steps.push({
    type: 'complete',
    message: 'Dijkstra complete - All shortest paths computed',
    distances: new Map(distances),
  });

  return { steps, distances };
}

// Bellman-Ford Algorithm
export function bellmanFord(graph: Graph, startId: string, endId?: string): AlgorithmResult {
  const steps: AlgorithmStep[] = [];
  const distances = new Map<string, number>();
  const parents = new Map<string, string | null>();
  const n = graph.nodes.length;

  // Initialize distances
  for (const node of graph.nodes) {
    distances.set(node.id, node.id === startId ? 0 : Infinity);
  }
  parents.set(startId, null);

  steps.push({
    type: 'visit',
    nodeId: startId,
    message: `Starting Bellman-Ford from ${getNodeById(graph, startId)?.label}`,
    distances: new Map(distances),
  });

  // Relax edges n-1 times
  for (let i = 0; i < n - 1; i++) {
    let updated = false;
    
    steps.push({
      type: 'visit',
      message: `Iteration ${i + 1} of ${n - 1}`,
      distances: new Map(distances),
    });

    for (const edge of graph.edges) {
      // Process edge in both directions for undirected graphs
      const edgesToProcess = graph.isDirected 
        ? [{ from: edge.source, to: edge.target }]
        : [{ from: edge.source, to: edge.target }, { from: edge.target, to: edge.source }];

      for (const { from, to } of edgesToProcess) {
        const fromDist = distances.get(from)!;
        const toDist = distances.get(to)!;
        const newDist = fromDist + edge.weight;

        if (fromDist !== Infinity && newDist < toDist) {
          distances.set(to, newDist);
          parents.set(to, from);
          updated = true;

          const toNode = getNodeById(graph, to);
          steps.push({
            type: 'relax',
            nodeId: to,
            edgeId: edge.id,
            message: `Relaxed edge: distance to ${toNode?.label} = ${newDist}`,
            distances: new Map(distances),
          });
        }
      }
    }

    if (!updated) {
      steps.push({
        type: 'visit',
        message: `No updates in iteration ${i + 1}, terminating early`,
        distances: new Map(distances),
      });
      break;
    }
  }

  // Check for negative cycles
  let hasNegativeCycle = false;
  for (const edge of graph.edges) {
    const edgesToCheck = graph.isDirected 
      ? [{ from: edge.source, to: edge.target }]
      : [{ from: edge.source, to: edge.target }, { from: edge.target, to: edge.source }];

    for (const { from, to } of edgesToCheck) {
      const fromDist = distances.get(from)!;
      const toDist = distances.get(to)!;
      
      if (fromDist !== Infinity && fromDist + edge.weight < toDist) {
        hasNegativeCycle = true;
        steps.push({
          type: 'cycle-detected',
          edgeId: edge.id,
          message: 'Negative cycle detected!',
          distances: new Map(distances),
        });
        break;
      }
    }
    if (hasNegativeCycle) break;
  }

  if (hasNegativeCycle) {
    steps.push({
      type: 'complete',
      message: 'Algorithm complete - Negative cycle exists!',
      distances: new Map(distances),
    });
    return { steps, hasNegativeCycle: true, distances };
  }

  if (endId) {
    const path = reconstructPath(parents, endId);
    const dist = distances.get(endId);
    steps.push({
      type: 'complete',
      message: dist === Infinity ? 'No path exists' : `Shortest path: ${dist}`,
      currentPath: dist === Infinity ? undefined : path,
      distances: new Map(distances),
    });
    return { steps, shortestPath: dist === Infinity ? undefined : path, distances };
  }

  steps.push({
    type: 'complete',
    message: 'Bellman-Ford complete',
    distances: new Map(distances),
  });

  return { steps, distances, hasNegativeCycle: false };
}

// A* Algorithm
export function aStar(graph: Graph, startId: string, endId: string): AlgorithmResult {
  const steps: AlgorithmStep[] = [];
  const startNode = getNodeById(graph, startId)!;
  const endNode = getNodeById(graph, endId)!;

  // Heuristic: Euclidean distance
  const heuristic = (nodeId: string): number => {
    const node = getNodeById(graph, nodeId)!;
    const dx = node.x - endNode.x;
    const dy = node.y - endNode.y;
    return Math.sqrt(dx * dx + dy * dy) / 50; // Scale factor
  };

  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const parents = new Map<string, string | null>();
  const openSet: string[] = [startId];
  const closedSet = new Set<string>();

  for (const node of graph.nodes) {
    gScore.set(node.id, node.id === startId ? 0 : Infinity);
    fScore.set(node.id, node.id === startId ? heuristic(startId) : Infinity);
  }
  parents.set(startId, null);

  steps.push({
    type: 'visit',
    nodeId: startId,
    message: `Starting A* from ${startNode.label} to ${endNode.label}`,
    distances: new Map(gScore),
  });

  while (openSet.length > 0) {
    // Get node with lowest fScore
    openSet.sort((a, b) => (fScore.get(a) || Infinity) - (fScore.get(b) || Infinity));
    const currentId = openSet.shift()!;
    const currentNode = getNodeById(graph, currentId)!;

    steps.push({
      type: 'visit',
      nodeId: currentId,
      message: `Processing ${currentNode.label} (g=${gScore.get(currentId)?.toFixed(1)}, f=${fScore.get(currentId)?.toFixed(1)})`,
      distances: new Map(gScore),
      visited: new Set(closedSet),
    });

    if (currentId === endId) {
      const path = reconstructPath(parents, endId);
      steps.push({
        type: 'complete',
        message: `Path found! Distance: ${gScore.get(endId)?.toFixed(1)}`,
        currentPath: path,
        distances: new Map(gScore),
      });
      return { steps, shortestPath: path, distances: gScore };
    }

    closedSet.add(currentId);

    const neighbors = getNeighbors(graph, currentId);
    for (const { node, edge, weight } of neighbors) {
      if (closedSet.has(node.id)) continue;

      const tentativeG = (gScore.get(currentId) || 0) + weight;

      steps.push({
        type: 'explore',
        nodeId: node.id,
        edgeId: edge.id,
        message: `Exploring ${node.label}: g=${tentativeG.toFixed(1)}, h=${heuristic(node.id).toFixed(1)}`,
        distances: new Map(gScore),
      });

      if (tentativeG < (gScore.get(node.id) || Infinity)) {
        parents.set(node.id, currentId);
        gScore.set(node.id, tentativeG);
        fScore.set(node.id, tentativeG + heuristic(node.id));

        if (!openSet.includes(node.id)) {
          openSet.push(node.id);
        }

        steps.push({
          type: 'relax',
          nodeId: node.id,
          edgeId: edge.id,
          message: `Updated ${node.label}: g=${tentativeG.toFixed(1)}, f=${fScore.get(node.id)?.toFixed(1)}`,
          distances: new Map(gScore),
        });
      }
    }
  }

  steps.push({
    type: 'complete',
    message: 'No path exists between start and end nodes',
    distances: new Map(gScore),
  });

  return { steps };
}

// Helper function to reconstruct path
function reconstructPath(parents: Map<string, string | null>, endId: string): string[] {
  const path: string[] = [];
  let current: string | null = endId;
  
  while (current !== null) {
    path.unshift(current);
    current = parents.get(current) || null;
  }
  
  return path;
}

// Run algorithm by type
export function runAlgorithm(
  type: string,
  graph: Graph,
  startId: string,
  endId?: string
): AlgorithmResult {
  switch (type) {
    case 'bfs':
      return bfs(graph, startId, endId);
    case 'dfs':
      return dfs(graph, startId, endId, true);
    case 'dijkstra':
      return dijkstra(graph, startId, endId);
    case 'bellman-ford':
      return bellmanFord(graph, startId, endId);
    case 'astar':
      if (!endId) throw new Error('A* requires an end node');
      return aStar(graph, startId, endId);
    default:
      throw new Error(`Unknown algorithm: ${type}`);
  }
}
