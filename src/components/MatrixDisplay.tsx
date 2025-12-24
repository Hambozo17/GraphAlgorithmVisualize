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
      <div className="p-4 text-center text-slate-500">
        Add nodes to see the matrix
      </div>
    );
  }

  const { matrix, nodeLabels } = showDistance 
    ? getDistanceMatrix(graph) 
    : getAdjacencyMatrix(graph);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-400">
          {showDistance ? 'Distance Matrix' : 'Adjacency Matrix'}
        </h3>
        <button
          onClick={onToggle}
          className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
        >
          Show {showDistance ? 'Adjacency' : 'Distance'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-2 text-slate-500"></th>
              {nodeLabels.map((label, i) => (
                <th key={i} className="p-2 text-center text-primary-400 font-mono">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className="p-2 text-center text-primary-400 font-mono font-medium">
                  {nodeLabels[i]}
                </td>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`
                      p-2 text-center font-mono text-xs
                      ${i === j ? 'bg-slate-800' : ''}
                      ${cell !== null && cell !== 0 && i !== j
                        ? 'text-green-400'
                        : 'text-slate-500'
                      }
                    `}
                  >
                    {cell === null ? '∞' : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
