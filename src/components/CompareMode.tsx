import { useState, useCallback, useEffect, useRef } from 'react';
import { Graph, AlgorithmStep } from '../types';
import { runAlgorithm } from '../utils/algorithms';
import { algorithmInfo } from '../utils/algorithmInfo';

interface CompareModeProps {
  graph: Graph;
  startNode: string | null;
  endNode: string | null;
  onClose: () => void;
}

interface AlgorithmState {
  steps: AlgorithmStep[];
  currentStep: number;
  highlightedNodes: Set<string>;
  highlightedEdges: Set<string>;
  visitedNodes: Set<string>;
  pathNodes: Set<string>;
  pathEdges: Set<string>;
}

const algorithms = [
  { id: 'bfs', name: 'BFS', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500' },
  { id: 'dfs', name: 'DFS', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-500' },
  { id: 'dijkstra', name: 'Dijkstra', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500' },
  { id: 'bellman-ford', name: 'Bellman-Ford', color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-500' },
  { id: 'astar', name: 'A*', color: 'from-red-500 to-rose-500', bgColor: 'bg-red-500' },
];

const createInitialState = (): AlgorithmState => ({
  steps: [],
  currentStep: 0,
  highlightedNodes: new Set(),
  highlightedEdges: new Set(),
  visitedNodes: new Set(),
  pathNodes: new Set(),
  pathEdges: new Set(),
});

export default function CompareMode({ graph, startNode, endNode, onClose }: CompareModeProps) {
  const [algorithm1, setAlgorithm1] = useState('bfs');
  const [algorithm2, setAlgorithm2] = useState('dfs');
  const [state1, setState1] = useState<AlgorithmState>(createInitialState());
  const [state2, setState2] = useState<AlgorithmState>(createInitialState());
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [hasRun, setHasRun] = useState(false);
  
  const animationRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  const updateVisualization = useCallback((
    steps: AlgorithmStep[],
    stepIndex: number,
    setState: React.Dispatch<React.SetStateAction<AlgorithmState>>
  ) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return;
    
    const step = steps[stepIndex];
    
    setState(prev => {
      const newState = { ...prev, currentStep: stepIndex };
      
      newState.highlightedNodes = new Set(step.nodeId ? [step.nodeId] : []);
      newState.highlightedEdges = new Set(step.edgeId ? [step.edgeId] : []);
      
      if (step.visited) {
        newState.visitedNodes = new Set(step.visited);
      }
      
      if (step.type === 'complete' && step.currentPath) {
        newState.pathNodes = new Set(step.currentPath);
        const pathEdgeIds = new Set<string>();
        for (let i = 0; i < step.currentPath.length - 1; i++) {
          const from = step.currentPath[i];
          const to = step.currentPath[i + 1];
          const edge = graph.edges.find(e => 
            (e.source === from && e.target === to) ||
            (!graph.isDirected && e.source === to && e.target === from)
          );
          if (edge) pathEdgeIds.add(edge.id);
        }
        newState.pathEdges = pathEdgeIds;
      }
      
      return newState;
    });
  }, [graph]);

  // Animation loop - synchronized stepping
  useEffect(() => {
    if (!isRunning || isPaused) return;
    
    pausedRef.current = isPaused;
    
    const animate = () => {
      if (pausedRef.current) return;
      
      const maxSteps = Math.max(state1.steps.length, state2.steps.length);
      const currentMax = Math.max(state1.currentStep, state2.currentStep);
      
      if (currentMax + 1 >= maxSteps) {
        setIsRunning(false);
        return;
      }
      
      const nextStep = currentMax + 1;
      
      if (nextStep < state1.steps.length) {
        updateVisualization(state1.steps, nextStep, setState1);
      }
      if (nextStep < state2.steps.length) {
        updateVisualization(state2.steps, nextStep, setState2);
      }
      
      animationRef.current = window.setTimeout(animate, speed);
    };
    
    animationRef.current = window.setTimeout(animate, speed);
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isRunning, isPaused, speed, state1.steps, state2.steps, state1.currentStep, state2.currentStep, updateVisualization]);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  const handleRun = useCallback(() => {
    if (!startNode) {
      alert('Please select a start node before entering compare mode');
      return;
    }

    try {
      const result1 = runAlgorithm(algorithm1, graph, startNode, endNode || undefined);
      const result2 = runAlgorithm(algorithm2, graph, startNode, endNode || undefined);
      
      setState1(prev => ({ ...prev, steps: result1.steps, currentStep: 0 }));
      setState2(prev => ({ ...prev, steps: result2.steps, currentStep: 0 }));
      
      // Reset visualization
      setState1(createInitialState());
      setState2(createInitialState());
      setState1(prev => ({ ...prev, steps: result1.steps }));
      setState2(prev => ({ ...prev, steps: result2.steps }));
      
      if (result1.steps.length > 0) {
        updateVisualization(result1.steps, 0, setState1);
      }
      if (result2.steps.length > 0) {
        updateVisualization(result2.steps, 0, setState2);
      }
      
      setIsRunning(true);
      setIsPaused(false);
      setHasRun(true);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [algorithm1, algorithm2, graph, startNode, endNode, updateVisualization]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  }, []);

  const getAlgoInfo = (id: string) => algorithmInfo[id];
  const getAlgoColor = (id: string) => algorithms.find(a => a.id === id)?.bgColor || 'bg-slate-500';

  // Calculate comparison metrics
  const getMetrics = (state: AlgorithmState, algoId: string) => {
    const info = getAlgoInfo(algoId);
    const lastStep = state.steps[state.steps.length - 1];
    return {
      totalSteps: state.steps.length,
      nodesVisited: state.visitedNodes.size,
      pathLength: state.pathNodes.size > 0 ? state.pathNodes.size - 1 : null,
      timeComplexity: info?.timeComplexity.worst || 'N/A',
      spaceComplexity: info?.spaceComplexity || 'N/A',
      finalDistance: lastStep?.distances?.get(endNode || '') ?? null,
      foundPath: state.pathNodes.size > 0,
    };
  };

  // Check if this is pathfinding mode (end node selected)
  const isPathfindingMode = !!endNode;

  const renderMiniCanvas = (state: AlgorithmState, algoId: string, label: string) => {
    const algoData = algorithms.find(a => a.id === algoId);
    
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <div className={`px-4 py-2 bg-gradient-to-r ${algoData?.color} text-white font-semibold text-center`}>
          {algoData?.name || label}
        </div>
        <div className="flex-1 relative bg-slate-900 border border-slate-700 overflow-hidden">
          {/* Mini graph visualization */}
          <svg className="w-full h-full" viewBox="0 0 400 300">
            {/* Edges */}
            {graph.edges.map(edge => {
              const source = graph.nodes.find(n => n.id === edge.source);
              const target = graph.nodes.find(n => n.id === edge.target);
              if (!source || !target) return null;
              
              const isPath = state.pathEdges.has(edge.id);
              const isHighlighted = state.highlightedEdges.has(edge.id);
              
              // Scale coordinates to fit viewBox
              const scaleX = 400 / 800;
              const scaleY = 300 / 600;
              
              return (
                <g key={edge.id}>
                  <line
                    x1={source.x * scaleX}
                    y1={source.y * scaleY}
                    x2={target.x * scaleX}
                    y2={target.y * scaleY}
                    stroke={isPath ? '#22c55e' : isHighlighted ? '#0ea5e9' : '#475569'}
                    strokeWidth={isPath ? 3 : isHighlighted ? 2.5 : 1.5}
                    className="transition-all duration-300"
                  />
                  {graph.isWeighted && (
                    <text
                      x={(source.x + target.x) * scaleX / 2}
                      y={(source.y + target.y) * scaleY / 2 - 5}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {edge.weight}
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* Nodes */}
            {graph.nodes.map(node => {
              const isVisited = state.visitedNodes.has(node.id);
              const isHighlighted = state.highlightedNodes.has(node.id);
              const isPath = state.pathNodes.has(node.id);
              const isStart = node.id === startNode;
              const isEnd = node.id === endNode;
              
              const scaleX = 400 / 800;
              const scaleY = 300 / 600;
              
              let fillColor = '#334155';
              if (isPath) fillColor = '#22c55e';
              else if (isHighlighted) fillColor = '#0ea5e9';
              else if (isVisited) fillColor = '#6366f1';
              else if (isStart) fillColor = '#22c55e';
              else if (isEnd) fillColor = '#ef4444';
              
              return (
                <g key={node.id}>
                  <circle
                    cx={node.x * scaleX}
                    cy={node.y * scaleY}
                    r={12}
                    fill={fillColor}
                    stroke={isHighlighted ? '#fff' : 'transparent'}
                    strokeWidth={2}
                    className="transition-all duration-300"
                  />
                  <text
                    x={node.x * scaleX}
                    y={node.y * scaleY + 4}
                    fill="white"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {/* Step counter overlay */}
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-slate-800/80 rounded text-xs text-slate-300">
            Step {state.currentStep + 1} / {state.steps.length || 1}
          </div>
        </div>
      </div>
    );
  };

  const metrics1 = getMetrics(state1, algorithm1);
  const metrics2 = getMetrics(state2, algorithm2);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold gradient-text">⚔️ Algorithm Comparison Mode</h2>
          <span className="text-sm text-slate-400">
            Compare two algorithms running on the same graph
          </span>
        </div>
        <button
          onClick={onClose}
          className="btn btn-ghost text-slate-400 hover:text-white"
        >
          ✕ Exit Compare Mode
        </button>
      </div>

      {/* Algorithm selectors */}
      <div className="flex items-center justify-center gap-8 px-6 py-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Algorithm 1:</span>
          <select
            value={algorithm1}
            onChange={e => setAlgorithm1(e.target.value)}
            disabled={isRunning}
            className="input w-40"
          >
            {algorithms.map(algo => (
              <option key={algo.id} value={algo.id}>{algo.name}</option>
            ))}
          </select>
        </div>
        
        <div className="text-2xl font-bold text-slate-500">VS</div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Algorithm 2:</span>
          <select
            value={algorithm2}
            onChange={e => setAlgorithm2(e.target.value)}
            disabled={isRunning}
            className="input w-40"
          >
            {algorithms.map(algo => (
              <option key={algo.id} value={algo.id}>{algo.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 ml-8">
          <span className="text-sm text-slate-400">Speed:</span>
          <input
            type="range"
            min={100}
            max={2000}
            step={100}
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            className="w-24 accent-primary-500"
          />
          <span className="text-xs text-slate-500 w-16">{speed}ms</span>
        </div>
      </div>

      {/* Main content - split view */}
      <div className="flex-1 flex min-h-0">
        {/* Left canvas */}
        {renderMiniCanvas(state1, algorithm1, 'Algorithm 1')}
        
        {/* Divider */}
        <div className="w-1 bg-slate-700" />
        
        {/* Right canvas */}
        {renderMiniCanvas(state2, algorithm2, 'Algorithm 2')}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-slate-700 bg-slate-800/50">
        {!isRunning ? (
          <button
            onClick={handleRun}
            disabled={!startNode}
            className="btn btn-primary px-8"
          >
            ▶️ Run Comparison
          </button>
        ) : isPaused ? (
          <button onClick={() => setIsPaused(false)} className="btn btn-primary px-8">
            ▶️ Resume
          </button>
        ) : (
          <button onClick={() => setIsPaused(true)} className="btn btn-secondary px-8">
            ⏸️ Pause
          </button>
        )}
        
        {isRunning && (
          <button onClick={handleStop} className="btn btn-ghost text-red-400">
            ⏹️ Stop
          </button>
        )}
      </div>

      {/* Comparison stats */}
      {hasRun && (
        <div className="border-t border-slate-700 bg-slate-800 px-6 py-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            📊 Comparison Results {!isPathfindingMode && <span className="text-slate-500 font-normal">(Traversal Mode - No End Node)</span>}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Stats for Algorithm 1 */}
            <div className={`p-4 rounded-lg border-l-4 ${getAlgoColor(algorithm1).replace('bg-', 'border-')} bg-slate-900/50`}>
              <h4 className="font-semibold text-white mb-2">{algorithms.find(a => a.id === algorithm1)?.name}</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Steps:</span>
                  <span className="ml-2 text-white font-mono">{metrics1.totalSteps}</span>
                </div>
                <div>
                  <span className="text-slate-500">Visited:</span>
                  <span className="ml-2 text-white font-mono">{metrics1.nodesVisited}</span>
                </div>
                {isPathfindingMode && (
                  <div>
                    <span className="text-slate-500">Path:</span>
                    <span className={`ml-2 font-mono ${metrics1.foundPath ? 'text-green-400' : 'text-red-400'}`}>
                      {metrics1.foundPath ? `${metrics1.pathLength} edges` : 'No path'}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Time:</span>
                  <span className="ml-2 text-green-400 font-mono text-xs">{metrics1.timeComplexity}</span>
                </div>
                <div>
                  <span className="text-slate-500">Space:</span>
                  <span className="ml-2 text-blue-400 font-mono text-xs">{metrics1.spaceComplexity}</span>
                </div>
                {metrics1.finalDistance !== null && (
                  <div>
                    <span className="text-slate-500">Distance:</span>
                    <span className="ml-2 text-yellow-400 font-mono">{metrics1.finalDistance === Infinity ? '∞' : metrics1.finalDistance}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Stats for Algorithm 2 */}
            <div className={`p-4 rounded-lg border-l-4 ${getAlgoColor(algorithm2).replace('bg-', 'border-')} bg-slate-900/50`}>
              <h4 className="font-semibold text-white mb-2">{algorithms.find(a => a.id === algorithm2)?.name}</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Steps:</span>
                  <span className="ml-2 text-white font-mono">{metrics2.totalSteps}</span>
                </div>
                <div>
                  <span className="text-slate-500">Visited:</span>
                  <span className="ml-2 text-white font-mono">{metrics2.nodesVisited}</span>
                </div>
                {isPathfindingMode && (
                  <div>
                    <span className="text-slate-500">Path:</span>
                    <span className={`ml-2 font-mono ${metrics2.foundPath ? 'text-green-400' : 'text-red-400'}`}>
                      {metrics2.foundPath ? `${metrics2.pathLength} edges` : 'No path'}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Time:</span>
                  <span className="ml-2 text-green-400 font-mono text-xs">{metrics2.timeComplexity}</span>
                </div>
                <div>
                  <span className="text-slate-500">Space:</span>
                  <span className="ml-2 text-blue-400 font-mono text-xs">{metrics2.spaceComplexity}</span>
                </div>
                {metrics2.finalDistance !== null && (
                  <div>
                    <span className="text-slate-500">Distance:</span>
                    <span className="ml-2 text-yellow-400 font-mono">{metrics2.finalDistance === Infinity ? '∞' : metrics2.finalDistance}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Winner indicator */}
          {state1.steps.length > 0 && state2.steps.length > 0 && !isRunning && (
            <div className="mt-4 text-center">
              {isPathfindingMode ? (
                // Pathfinding mode - compare by path found and steps
                metrics1.foundPath && !metrics2.foundPath ? (
                  <span className="text-green-400">
                    🏆 <strong>{algorithms.find(a => a.id === algorithm1)?.name}</strong> found a path! ({algorithms.find(a => a.id === algorithm2)?.name} did not)
                  </span>
                ) : !metrics1.foundPath && metrics2.foundPath ? (
                  <span className="text-green-400">
                    🏆 <strong>{algorithms.find(a => a.id === algorithm2)?.name}</strong> found a path! ({algorithms.find(a => a.id === algorithm1)?.name} did not)
                  </span>
                ) : metrics1.foundPath && metrics2.foundPath ? (
                  metrics1.totalSteps < metrics2.totalSteps ? (
                    <span className="text-green-400">
                      🏆 <strong>{algorithms.find(a => a.id === algorithm1)?.name}</strong> found the path in fewer steps!
                    </span>
                  ) : metrics2.totalSteps < metrics1.totalSteps ? (
                    <span className="text-green-400">
                      🏆 <strong>{algorithms.find(a => a.id === algorithm2)?.name}</strong> found the path in fewer steps!
                    </span>
                  ) : (
                    <span className="text-yellow-400">
                      🤝 Both algorithms found the path in the same number of steps!
                    </span>
                  )
                ) : (
                  <span className="text-red-400">
                    ❌ Neither algorithm found a path to the target
                  </span>
                )
              ) : (
                // Traversal mode - compare by nodes visited and steps
                metrics1.nodesVisited > metrics2.nodesVisited ? (
                  <span className="text-green-400">
                    🏆 <strong>{algorithms.find(a => a.id === algorithm1)?.name}</strong> visited more nodes ({metrics1.nodesVisited} vs {metrics2.nodesVisited})
                  </span>
                ) : metrics2.nodesVisited > metrics1.nodesVisited ? (
                  <span className="text-green-400">
                    🏆 <strong>{algorithms.find(a => a.id === algorithm2)?.name}</strong> visited more nodes ({metrics2.nodesVisited} vs {metrics1.nodesVisited})
                  </span>
                ) : metrics1.totalSteps < metrics2.totalSteps ? (
                  <span className="text-green-400">
                    🏆 <strong>{algorithms.find(a => a.id === algorithm1)?.name}</strong> completed traversal in fewer steps!
                  </span>
                ) : metrics2.totalSteps < metrics1.totalSteps ? (
                  <span className="text-green-400">
                    🏆 <strong>{algorithms.find(a => a.id === algorithm2)?.name}</strong> completed traversal in fewer steps!
                  </span>
                ) : (
                  <span className="text-yellow-400">
                    🤝 Both algorithms visited the same nodes in the same number of steps!
                  </span>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
