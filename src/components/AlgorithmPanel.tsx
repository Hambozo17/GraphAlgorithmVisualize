
import { algorithmInfo } from '../utils/algorithmInfo';

interface AlgorithmPanelProps {
  selectedAlgorithm: string;
  onSelectAlgorithm: (algo: string) => void;
  startNode: string | null;
  endNode: string | null;
  nodes: { id: string; label: string }[];
  onSetStartNode: (nodeId: string | null) => void;
  onSetEndNode: (nodeId: string | null) => void;
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  isRunning: boolean;
  isPaused: boolean;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentStep: number;
  totalSteps: number;
  onCompareMode: () => void;
}

const algorithms = [
  { id: 'bfs', name: 'BFS', color: 'from-blue-500 to-cyan-500' },
  { id: 'dfs', name: 'DFS', color: 'from-purple-500 to-pink-500' },
  { id: 'dijkstra', name: 'Dijkstra', color: 'from-green-500 to-emerald-500' },
  { id: 'bellman-ford', name: 'Bellman-Ford', color: 'from-orange-500 to-amber-500' },
  { id: 'astar', name: 'A*', color: 'from-red-500 to-rose-500' },
];

export default function AlgorithmPanel({
  selectedAlgorithm,
  onSelectAlgorithm,
  startNode,
  endNode,
  nodes,
  onSetStartNode,
  onSetEndNode,
  onRun,
  onPause,
  onResume,
  onStop,
  onStepForward,
  onStepBackward,
  isRunning,
  isPaused,
  speed,
  onSpeedChange,
  currentStep,
  totalSteps,
  onCompareMode,
}: AlgorithmPanelProps) {
  const info = algorithmInfo[selectedAlgorithm];
  const needsEndNode = selectedAlgorithm === 'astar' || selectedAlgorithm === 'dijkstra' || selectedAlgorithm === 'bfs';

  return (
    <div className="w-80 h-full overflow-y-auto glass border-l border-slate-700/50">
      <div className="p-4 space-y-6">
        {/* Algorithm Selection */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Select Algorithm
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {algorithms.map(algo => (
              <button
                key={algo.id}
                onClick={() => onSelectAlgorithm(algo.id)}
                disabled={isRunning}
                className={`
                  py-2 px-3 rounded-lg font-medium text-sm transition-all
                  ${selectedAlgorithm === algo.id
                    ? `bg-gradient-to-r ${algo.color} text-white shadow-lg`
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }
                  ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {algo.name}
              </button>
            ))}
          </div>
        </div>

        {/* Node Selection */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Configure
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Start Node</label>
              <select
                value={startNode || ''}
                onChange={e => onSetStartNode(e.target.value || null)}
                disabled={isRunning}
                className="input"
              >
                <option value="">Select start node...</option>
                {nodes.map(node => (
                  <option key={node.id} value={node.id}>{node.label}</option>
                ))}
              </select>
            </div>
            
            {needsEndNode && (
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  End Node {selectedAlgorithm === 'astar' ? '(Required)' : '(Optional)'}
                </label>
                <select
                  value={endNode || ''}
                  onChange={e => onSetEndNode(e.target.value || null)}
                  disabled={isRunning}
                  className="input"
                >
                  <option value="">Select end node...</option>
                  {nodes.filter(n => n.id !== startNode).map(node => (
                    <option key={node.id} value={node.id}>{node.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Speed Control */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Animation Speed
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Fast</span>
            <input
              type="range"
              min={100}
              max={2000}
              step={100}
              value={speed}
              onChange={e => onSpeedChange(Number(e.target.value))}
              className="flex-1 accent-primary-500"
            />
            <span className="text-xs text-slate-500">Slow</span>
          </div>
          <p className="text-center text-sm text-slate-400 mt-1">{speed}ms per step</p>
        </div>

        {/* Playback Controls */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Controls
          </h3>
          
          {/* Progress bar */}
          {totalSteps > 0 && (
            <div className="mb-3">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
              <p className="text-center text-xs text-slate-500 mt-1">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onStepBackward}
              disabled={currentStep <= 0 || (isRunning && !isPaused)}
              className="btn btn-secondary flex-1"
              title="Step Backward"
            >
              ⏮️
            </button>
            
            {!isRunning ? (
              <button
                onClick={onRun}
                disabled={!startNode || (selectedAlgorithm === 'astar' && !endNode)}
                className="btn btn-primary flex-1"
              >
                ▶️ Run
              </button>
            ) : isPaused ? (
              <button onClick={onResume} className="btn btn-primary flex-1">
                ▶️ Resume
              </button>
            ) : (
              <button onClick={onPause} className="btn btn-secondary flex-1">
                ⏸️ Pause
              </button>
            )}
            
            <button
              onClick={onStepForward}
              disabled={currentStep >= totalSteps - 1 || (isRunning && !isPaused)}
              className="btn btn-secondary flex-1"
              title="Step Forward"
            >
              ⏭️
            </button>
          </div>
          
          {isRunning && (
            <button
              onClick={onStop}
              className="btn btn-ghost w-full mt-2 text-red-400"
            >
              ⏹️ Stop
            </button>
          )}
          
          {/* Compare Mode Button */}
          <button
            onClick={onCompareMode}
            disabled={isRunning || nodes.length === 0}
            className="btn w-full mt-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⚔️ Compare Algorithms
          </button>
        </div>

        {/* Algorithm Info */}
        {info && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">
                About {info.name}
              </h3>
              <p className="text-sm text-slate-300">{info.description}</p>
            </div>

            {/* Complexity */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">
                Time Complexity
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-green-500/20 text-green-400 p-2 rounded text-center">
                  <div className="font-medium">Best</div>
                  <div className="mono">{info.timeComplexity.best}</div>
                </div>
                <div className="bg-yellow-500/20 text-yellow-400 p-2 rounded text-center">
                  <div className="font-medium">Avg</div>
                  <div className="mono">{info.timeComplexity.average}</div>
                </div>
                <div className="bg-red-500/20 text-red-400 p-2 rounded text-center">
                  <div className="font-medium">Worst</div>
                  <div className="mono">{info.timeComplexity.worst}</div>
                </div>
              </div>
              <div className="mt-2 bg-slate-700/50 p-2 rounded text-center text-xs">
                <span className="text-slate-400">Space: </span>
                <span className="mono text-slate-300">{info.spaceComplexity}</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex gap-2 flex-wrap">
              {info.findsShortestPath && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  ✓ Shortest Path
                </span>
              )}
              {info.supportsWeighted && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  ✓ Weighted
                </span>
              )}
              {info.supportsNegative && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                  ✓ Negative Weights
                </span>
              )}
            </div>

            {/* Pseudocode */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">
                Pseudocode
              </h4>
              <pre className="bg-slate-900 p-3 rounded-lg text-xs overflow-x-auto">
                <code className="text-slate-300 mono">
                  {info.pseudocode.join('\n')}
                </code>
              </pre>
            </div>

            {/* Use Cases */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">
                Use Cases
              </h4>
              <ul className="text-xs text-slate-400 space-y-1">
                {info.useCases.map((use, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary-400">•</span>
                    {use}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
