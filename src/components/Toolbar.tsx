import { useState } from 'react';

interface ToolbarProps {
  tool: string;
  onToolChange: (tool: string) => void;
  isDirected: boolean;
  isWeighted: boolean;
  onToggleDirected: () => void;
  onToggleWeighted: () => void;
  onClearGraph: () => void;
  onLoadSample: () => void;
}

const tools = [
  { id: 'select', icon: '👆', label: 'Select', shortcut: 'V' },
  { id: 'move', icon: '✋', label: 'Move', shortcut: 'M' },
  { id: 'addNode', icon: '⭕', label: 'Add Node', shortcut: 'N' },
  { id: 'addEdge', icon: '↗️', label: 'Add Edge', shortcut: 'E' },
  { id: 'delete', icon: '🗑️', label: 'Delete', shortcut: 'D' },
];

export default function Toolbar({
  tool,
  onToolChange,
  isDirected,
  isWeighted,
  onToggleDirected,
  onToggleWeighted,
  onClearGraph,
  onLoadSample,
}: ToolbarProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClear = () => {
    if (showClearConfirm) {
      onClearGraph();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 glass border-b border-slate-700/50">
      {/* Tools */}
      <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
        {tools.map(t => (
          <button
            key={t.id}
            onClick={() => onToolChange(t.id)}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-all
              flex items-center gap-2
              ${tool === t.id
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'text-slate-300 hover:bg-slate-700/50'
              }
            `}
            title={`${t.label} (${t.shortcut})`}
          >
            <span>{t.icon}</span>
            <span className="hidden lg:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="w-px h-8 bg-slate-700 mx-2" />

      {/* Graph type toggles */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={isDirected}
              onChange={onToggleDirected}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-700 rounded-full peer-checked:bg-primary-500 transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
          </div>
          <span className="text-sm text-slate-300">Directed</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={isWeighted}
              onChange={onToggleWeighted}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-700 rounded-full peer-checked:bg-primary-500 transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
          </div>
          <span className="text-sm text-slate-300">Weighted</span>
        </label>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <button
        onClick={onLoadSample}
        className="btn btn-secondary text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span className="hidden lg:inline">Sample Graph</span>
      </button>
      <button
        onClick={handleClear}
        className={`btn text-sm ${showClearConfirm ? 'btn-primary animate-pulse' : 'btn-ghost text-red-400 hover:text-red-300'}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span className="hidden lg:inline">{showClearConfirm ? 'Click to Confirm' : 'Clear All'}</span>
      </button>
    </div>
  );
}
