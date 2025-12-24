import { Graph, Node, Edge } from '../types';

export function createEmptyGraph(): Graph {
  return {
    nodes: [],
    edges: [],
    isDirected: false,
    isWeighted: true,
  };
}

export function generateNodeId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateEdgeId(): string {
  return `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function addNode(graph: Graph, x: number, y: number, label?: string): Graph {
  const id = generateNodeId();
  const newNode: Node = {
    id,
    x,
    y,
    label: label || String.fromCharCode(65 + graph.nodes.length), // A, B, C, ...
  };
  return {
    ...graph,
    nodes: [...graph.nodes, newNode],
  };
}

export function addEdge(graph: Graph, sourceId: string, targetId: string, weight: number = 1): Graph {
  // Check if edge already exists
  const exists = graph.edges.some(
    e => (e.source === sourceId && e.target === targetId) ||
         (!graph.isDirected && e.source === targetId && e.target === sourceId)
  );
  
  if (exists || sourceId === targetId) return graph;

  const id = generateEdgeId();
  const newEdge: Edge = {
    id,
    source: sourceId,
    target: targetId,
    weight,
  };
  return {
    ...graph,
    edges: [...graph.edges, newEdge],
  };
}

export function removeNode(graph: Graph, nodeId: string): Graph {
  return {
    ...graph,
    nodes: graph.nodes.filter(n => n.id !== nodeId),
    edges: graph.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
  };
}

export function removeEdge(graph: Graph, edgeId: string): Graph {
  return {
    ...graph,
    edges: graph.edges.filter(e => e.id !== edgeId),
  };
}

export function updateNode(graph: Graph, nodeId: string, updates: Partial<Node>): Graph {
  return {
    ...graph,
    nodes: graph.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n),
  };
}

export function updateEdge(graph: Graph, edgeId: string, updates: Partial<Edge>): Graph {
  return {
    ...graph,
    edges: graph.edges.map(e => e.id === edgeId ? { ...e, ...updates } : e),
  };
}

export function getNodeById(graph: Graph, nodeId: string): Node | undefined {
  return graph.nodes.find(n => n.id === nodeId);
}

export function getEdgeById(graph: Graph, edgeId: string): Edge | undefined {
  return graph.edges.find(e => e.id === edgeId);
}

export function getNeighbors(graph: Graph, nodeId: string): { node: Node; edge: Edge; weight: number }[] {
  const neighbors: { node: Node; edge: Edge; weight: number }[] = [];
  
  for (const edge of graph.edges) {
    let neighborId: string | null = null;
    
    if (edge.source === nodeId) {
      neighborId = edge.target;
    } else if (!graph.isDirected && edge.target === nodeId) {
      neighborId = edge.source;
    }
    
    if (neighborId) {
      const node = getNodeById(graph, neighborId);
      if (node) {
        neighbors.push({ node, edge, weight: edge.weight });
      }
    }
  }
  
  return neighbors;
}

export function getAdjacencyMatrix(graph: Graph): { matrix: (number | null)[][]; nodeLabels: string[] } {
  const n = graph.nodes.length;
  const nodeLabels = graph.nodes.map(node => node.label);
  const nodeIndexMap = new Map(graph.nodes.map((node, index) => [node.id, index]));
  
  const matrix: (number | null)[][] = Array(n).fill(null).map(() => Array(n).fill(null));
  
  // Set diagonal to 0
  for (let i = 0; i < n; i++) {
    matrix[i][i] = 0;
  }
  
  // Fill in edge weights
  for (const edge of graph.edges) {
    const sourceIndex = nodeIndexMap.get(edge.source);
    const targetIndex = nodeIndexMap.get(edge.target);
    
    if (sourceIndex !== undefined && targetIndex !== undefined) {
      matrix[sourceIndex][targetIndex] = edge.weight;
      if (!graph.isDirected) {
        matrix[targetIndex][sourceIndex] = edge.weight;
      }
    }
  }
  
  return { matrix, nodeLabels };
}

export function getDistanceMatrix(graph: Graph): { matrix: (number | null)[][]; nodeLabels: string[] } {
  const { matrix, nodeLabels } = getAdjacencyMatrix(graph);
  const n = matrix.length;
  
  // Floyd-Warshall algorithm
  const dist = matrix.map(row => row.map(val => val === null ? Infinity : val));
  
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }
  
  // Convert Infinity back to null
  const result = dist.map(row => row.map(val => val === Infinity ? null : val));
  
  return { matrix: result, nodeLabels };
}

// Sample graphs for demonstration
export function createSampleGraph(): Graph {
  const nodes: Node[] = [
    { id: 'n1', x: 150, y: 100, label: 'A' },
    { id: 'n2', x: 350, y: 100, label: 'B' },
    { id: 'n3', x: 550, y: 100, label: 'C' },
    { id: 'n4', x: 150, y: 300, label: 'D' },
    { id: 'n5', x: 350, y: 300, label: 'E' },
    { id: 'n6', x: 550, y: 300, label: 'F' },
  ];

  const edges: Edge[] = [
    { id: 'e1', source: 'n1', target: 'n2', weight: 4 },
    { id: 'e2', source: 'n1', target: 'n4', weight: 2 },
    { id: 'e3', source: 'n2', target: 'n3', weight: 3 },
    { id: 'e4', source: 'n2', target: 'n5', weight: 1 },
    { id: 'e5', source: 'n3', target: 'n6', weight: 5 },
    { id: 'e6', source: 'n4', target: 'n5', weight: 3 },
    { id: 'e7', source: 'n5', target: 'n6', weight: 2 },
  ];

  return {
    nodes,
    edges,
    isDirected: false,
    isWeighted: true,
  };
}

export function createGridGraph(rows: number, cols: number, spacing: number = 100): Graph {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nodeCount = 0;
  
  const offsetX = 100;
  const offsetY = 100;
  
  // Create nodes
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      nodes.push({
        id: `grid_${r}_${c}`,
        x: offsetX + c * spacing,
        y: offsetY + r * spacing,
        label: String.fromCharCode(65 + nodeCount),
      });
      nodeCount++;
    }
  }
  
  // Create edges
  let edgeCount = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const currentId = `grid_${r}_${c}`;
      
      // Right neighbor
      if (c < cols - 1) {
        edges.push({
          id: `grid_edge_${edgeCount++}`,
          source: currentId,
          target: `grid_${r}_${c + 1}`,
          weight: Math.floor(Math.random() * 9) + 1,
        });
      }
      
      // Bottom neighbor
      if (r < rows - 1) {
        edges.push({
          id: `grid_edge_${edgeCount++}`,
          source: currentId,
          target: `grid_${r + 1}_${c}`,
          weight: Math.floor(Math.random() * 9) + 1,
        });
      }
    }
  }
  
  return {
    nodes,
    edges,
    isDirected: false,
    isWeighted: true,
  };
}
