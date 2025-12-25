import { useState } from 'react';
import { Panel } from 'react-resizable-panels';
import MatrixDisplay from './MatrixDisplay';
import StepLog from './StepLog';
import { Graph, AlgorithmStep } from '../types';

interface ResizableBottomPanelProps {
  graph: Graph;
  steps: AlgorithmStep[];
  currentStep: number;
  showDistanceMatrix: boolean;
  onToggleMatrix: () => void;
}

type TabType = 'steps' | 'matrix';

export default function ResizableBottomPanel({
  graph,
  steps,
  currentStep,
  showDistanceMatrix,
  onToggleMatrix,
}: ResizableBottomPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('steps');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleMinimize = () => {
    if (!isMinimized) {
      setIsMinimized(true);
    } else {
      setIsMinimized(false);
    }
  };

  const handlePanelResize = () => {
    if (isMinimized) {
      setIsMinimized(false);
    }
  };

  return (
    <Panel
      id="bottom-panel"
      defaultSize={30}
      minSize={5}
      maxSize={70}
      collapsible={true}
      onResize={handlePanelResize}
      className="relative"
    >
      <div className="h-full flex flex-col bg-slate-900/50 border-t border-slate-700/50">
        {/* Header with tabs and controls */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/30 border-b border-slate-700/30">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('steps')}
              className={`
                px-4 py-1.5 text-sm font-medium rounded-md transition-all
                ${activeTab === 'steps'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Steps</span>
                {steps.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded">
                    {currentStep + 1}/{steps.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`
                px-4 py-1.5 text-sm font-medium rounded-md transition-all
                ${activeTab === 'matrix'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Matrix</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMinimize}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className={`flex-1 overflow-hidden transition-all duration-200 ${isMinimized ? 'h-0 opacity-0' : 'h-full opacity-100'}`}>
          {activeTab === 'steps' ? (
            <StepLog steps={steps} currentStep={currentStep} />
          ) : (
            <MatrixDisplay
              graph={graph}
              showDistance={showDistanceMatrix}
              onToggle={onToggleMatrix}
            />
          )}
        </div>
      </div>
    </Panel>
  );
}
