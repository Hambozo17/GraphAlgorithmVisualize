import { Graph } from '../types';
import { getAdjacencyMatrix, getDistanceMatrix } from '../utils/graphUtils';

interface MatrixDisplayProps {
  graph: Graph;
  showDistance: boolean;
  onToggle: () => void;
}

export default function MatrixDisplay({ graph, showDistance, onToggle }: MatrixDisplayProps) {
  if (graph.nodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8">
        <svg className="w-16 h-16 mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <p className="text-lg font-medium text-slate-400">No Nodes Yet</p>
        <p className="text-sm mt-1">Add nodes to see the adjacency matrix</p>
        <p className="text-xs mt-3 text-slate-600">Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">N</kbd> or use the toolbar</p>
      </div>
    );
  }

  const { matrix, nodeLabels } = showDistance 
    ? getDistanceMatrix(graph) 
    : getAdjacencyMatrix(graph);

  return (
    <div className="p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-300">
            {showDistance ? '📏 Distance Matrix' : '🔗 Adjacency Matrix'}
          </h3>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
            {graph.nodes.length}×{graph.nodes.length}
          </span>
          {graph.isDirected && (
            <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
              Directed
            </span>
          )}
          {graph.isWeighted && (
            <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
              Weighted
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Show {showDistance ? 'Adjacency' : 'Distance'}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700/50">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-800/70">
              <th className="p-2 text-slate-600 border-r border-b border-slate-700/50 sticky left-0 bg-slate-800/70 z-10"></th>
              {nodeLabels.map((label, i) => (
                <th key={i} className="p-2 text-center text-primary-400 font-mono font-bold border-b border-slate-700/50 min-w-[40px]">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-2 text-center text-primary-400 font-mono font-bold border-r border-slate-700/50 bg-slate-800/50 sticky left-0">
                  {nodeLabels[i]}
                </td>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`
                      p-2 text-center font-mono text-sm transition-colors
                      ${i === j 
                        ? 'bg-slate-800/80 text-slate-600' 
                        : cell !== null && cell !== 0
                          ? 'text-green-400 bg-green-400/5 hover:bg-green-400/10'
                          : 'text-slate-600 hover:bg-slate-700/30'
                      }
                      border-b border-slate-700/30
                    `}
                  >
                    {cell === null ? (
                      <span className="text-slate-600">∞</span>
                    ) : cell === 0 && i === j ? (
                      <span className="text-slate-700">—</span>
                    ) : (
                      <span className={cell !== 0 ? 'font-semibold' : ''}>{cell}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-400/20 border border-green-400/50"></span>
          <span>Connected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-700 border border-slate-600"></span>
          <span>No edge</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-600">∞</span>
          <span>= Unreachable</span>
        </div>
      </div>
    </div>
  );
}
