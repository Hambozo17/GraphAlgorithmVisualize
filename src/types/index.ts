// Graph data types
export interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
  isDirected: boolean;
  isWeighted: boolean;
}

// Algorithm types
export type AlgorithmType = 'bfs' | 'dfs' | 'dijkstra' | 'bellman-ford' | 'astar';

export interface AlgorithmStep {
  type: 'visit' | 'explore' | 'relax' | 'path' | 'complete' | 'cycle-detected';
  nodeId?: string;
  edgeId?: string;
  message: string;
  distances?: Map<string, number>;
  parents?: Map<string, string | null>;
  visited?: Set<string>;
  queue?: string[];
  stack?: string[];
  currentPath?: string[];
}

export interface AlgorithmResult {
  steps: AlgorithmStep[];
  shortestPath?: string[];
  distances?: Map<string, number>;
  hasCycle?: boolean;
  hasNegativeCycle?: boolean;
}

// Visualization state
export interface VisualizationState {
  isRunning: boolean;
  isPaused: boolean;
  currentStep: number;
  speed: number; // ms per step
  highlightedNodes: Set<string>;
  highlightedEdges: Set<string>;
  visitedNodes: Set<string>;
  pathNodes: Set<string>;
  pathEdges: Set<string>;
}

// UI state
export type ToolMode = 'select' | 'addNode' | 'addEdge' | 'delete' | 'move';

export interface AppState {
  graph: Graph;
  selectedNodes: string[];
  selectedEdges: string[];
  tool: ToolMode;
  algorithm: AlgorithmType;
  startNode: string | null;
  endNode: string | null;
  visualization: VisualizationState;
}

// Algorithm info for display
export interface AlgorithmInfo {
  name: string;
  description: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  useCases: string[];
  pseudocode: string[];
  supportsWeighted: boolean;
  supportsNegative: boolean;
  findsShortestPath: boolean;
}
