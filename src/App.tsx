import { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import GraphCanvas from './components/GraphCanvas';
import AlgorithmPanel from './components/AlgorithmPanel';
import ResizableBottomPanel from './components/ResizableBottomPanel';
import About from './components/About';
import CompareMode from './components/CompareMode';
import { Graph, AlgorithmStep } from './types';
import { 
  createEmptyGraph, 
  addNode, 
  addEdge, 
  removeNode, 
  removeEdge, 
  updateNode,
  createSampleGraph 
} from './utils/graphUtils';
import { runAlgorithm } from './utils/algorithms';

export default function App() {
  // Graph state
  const [graph, setGraph] = useState<Graph>(createEmptyGraph());
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  
  // Tool state
  const [tool, setTool] = useState('select');
  
  // Algorithm state
  const [algorithm, setAlgorithm] = useState('bfs');
  const [startNode, setStartNode] = useState<string | null>(null);
  const [endNode, setEndNode] = useState<string | null>(null);
  
  // Visualization state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  
  // Visualization display
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [highlightedEdges, setHighlightedEdges] = useState<Set<string>>(new Set());
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set());
  const [pathNodes, setPathNodes] = useState<Set<string>>(new Set());
  const [pathEdges, setPathEdges] = useState<Set<string>>(new Set());
  
  // Matrix display
  const [showDistanceMatrix, setShowDistanceMatrix] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'matrix' | 'steps'>('matrix');
  
  // Bottom panel state
  const [bottomPanelHeight, setBottomPanelHeight] = useState(288); // 18rem = 288px
  const [isBottomPanelCollapsed, setIsBottomPanelCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const minPanelHeight = 120;
  const maxPanelHeight = 500;
  
  // About modal
  const [showAbout, setShowAbout] = useState(false);
  
  // Compare mode
  const [showCompareMode, setShowCompareMode] = useState(false);
  
  // Animation ref
  const animationRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      
      switch (e.key.toLowerCase()) {
        case 'v': setTool('select'); break;
        case 'm': setTool('move'); break;
        case 'n': setTool('addNode'); break;
        case 'e': setTool('addEdge'); break;
        case 'd': 
        case 'delete': setTool('delete'); break;
        case ' ':
          e.preventDefault();
          if (isRunning) {
            setIsPaused(p => !p);
          }
          break;
        case 'escape':
          handleStop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning]);

  // Update visualization based on current step
  const updateVisualization = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return;
    
    const step = steps[stepIndex];
    
    // Update highlighted nodes/edges
    setHighlightedNodes(new Set(step.nodeId ? [step.nodeId] : []));
    setHighlightedEdges(new Set(step.edgeId ? [step.edgeId] : []));
    
    // Accumulate visited nodes
    if (step.visited) {
      setVisitedNodes(new Set(step.visited));
    }
    
    // Show path when complete
    if (step.type === 'complete' && step.currentPath) {
      setPathNodes(new Set(step.currentPath));
      
      // Calculate path edges
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
      setPathEdges(pathEdgeIds);
    }
  }, [steps, graph]);

  // Animation loop
  useEffect(() => {
    if (!isRunning || isPaused) return;
    
    pausedRef.current = isPaused;
    
    const animate = () => {
      if (pausedRef.current) return;
      
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          setIsRunning(false);
          // Stay at the last step so user can review
          updateVisualization(prev);
          return prev;
        }
        updateVisualization(next);
        return next;
      });
      
      animationRef.current = window.setTimeout(animate, speed);
    };
    
    animationRef.current = window.setTimeout(animate, speed);
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isRunning, isPaused, speed, steps.length, updateVisualization]);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  // Graph operations
  const handleAddNode = useCallback((x: number, y: number) => {
    setGraph(g => addNode(g, x, y));
  }, []);

  const handleAddEdge = useCallback((sourceId: string, targetId: string) => {
    const weight = graph.isWeighted ? parseInt(prompt('Enter edge weight:', '1') || '1') || 1 : 1;
    setGraph(g => addEdge(g, sourceId, targetId, weight));
  }, [graph.isWeighted]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setGraph(g => removeNode(g, nodeId));
    setSelectedNodes(prev => prev.filter(id => id !== nodeId));
    if (startNode === nodeId) setStartNode(null);
    if (endNode === nodeId) setEndNode(null);
  }, [startNode, endNode]);

  const handleDeleteEdge = useCallback((edgeId: string) => {
    setGraph(g => removeEdge(g, edgeId));
    setSelectedEdges(prev => prev.filter(id => id !== edgeId));
  }, []);

  const handleMoveNode = useCallback((nodeId: string, x: number, y: number) => {
    setGraph(g => updateNode(g, nodeId, { x, y }));
  }, []);

  const handleSelectNode = useCallback((nodeId: string, multi: boolean) => {
    setSelectedNodes(prev => 
      multi ? (prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId])
            : [nodeId]
    );
    setSelectedEdges([]);
  }, []);

  const handleSelectEdge = useCallback((edgeId: string, multi: boolean) => {
    setSelectedEdges(prev =>
      multi ? (prev.includes(edgeId) ? prev.filter(id => id !== edgeId) : [...prev, edgeId])
            : [edgeId]
    );
    setSelectedNodes([]);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, []);

  const handleToggleDirected = useCallback(() => {
    setGraph(g => ({ ...g, isDirected: !g.isDirected }));
  }, []);

  const handleToggleWeighted = useCallback(() => {
    setGraph(g => ({ ...g, isWeighted: !g.isWeighted }));
  }, []);

  const handleClearGraph = useCallback(() => {
    if (confirm('Clear the entire graph?')) {
      setGraph(createEmptyGraph());
      setSelectedNodes([]);
      setSelectedEdges([]);
      setStartNode(null);
      setEndNode(null);
      handleStop();
    }
  }, []);

  const handleLoadSample = useCallback(() => {
    const sample = createSampleGraph();
    setGraph(sample);
    setStartNode(sample.nodes[0]?.id || null);
    setEndNode(sample.nodes[sample.nodes.length - 1]?.id || null);
    handleStop();
  }, []);

  // Algorithm controls
  const handleRun = useCallback(() => {
    if (!startNode) {
      alert('Please select a start node');
      return;
    }
    
    if (algorithm === 'astar' && !endNode) {
      alert('A* algorithm requires an end node');
      return;
    }

    try {
      const result = runAlgorithm(algorithm, graph, startNode, endNode || undefined);
      setSteps(result.steps);
      setCurrentStep(0);
      setIsRunning(true);
      setIsPaused(false);
      
      // Reset visualization
      setHighlightedNodes(new Set());
      setHighlightedEdges(new Set());
      setVisitedNodes(new Set());
      setPathNodes(new Set());
      setPathEdges(new Set());
      
      // Show first step
      if (result.steps.length > 0) {
        updateVisualization(0);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [algorithm, graph, startNode, endNode, updateVisualization]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep(0);
    setSteps([]);
    setHighlightedNodes(new Set());
    setHighlightedEdges(new Set());
    setVisitedNodes(new Set());
    setPathNodes(new Set());
    setPathEdges(new Set());
    
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  }, []);

  const handleStepForward = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      updateVisualization(next);
    }
  }, [currentStep, steps.length, updateVisualization]);

  const handleStepBackward = useCallback(() => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      // Recalculate visited nodes up to this step
      const visited = new Set<string>();
      for (let i = 0; i <= prev; i++) {
        if (steps[i].visited) {
          steps[i].visited!.forEach(v => visited.add(v));
        }
      }
      setVisitedNodes(visited);
      updateVisualization(prev);
    }
  }, [currentStep, steps, updateVisualization]);

  // Bottom panel resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.classList.add('resizing');
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const windowHeight = window.innerHeight;
      const newHeight = windowHeight - e.clientY;
      const clampedHeight = Math.min(Math.max(newHeight, minPanelHeight), maxPanelHeight);
      setBottomPanelHeight(clampedHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('resizing');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('resizing');
    };
  }, [isResizing]);

  const toggleBottomPanel = useCallback(() => {
    setIsBottomPanelCollapsed(prev => !prev);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <Header title="Graph Algorithm Visualizer" onShowAbout={() => setShowAbout(true)} />
      
      <Toolbar
        tool={tool}
        onToolChange={setTool}
        isDirected={graph.isDirected}
        isWeighted={graph.isWeighted}
        onToggleDirected={handleToggleDirected}
        onToggleWeighted={handleToggleWeighted}
        onClearGraph={handleClearGraph}
        onLoadSample={handleLoadSample}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main canvas area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 relative min-h-0">
            <GraphCanvas
              graph={graph}
              selectedNodes={selectedNodes}
              selectedEdges={selectedEdges}
              highlightedNodes={highlightedNodes}
              highlightedEdges={highlightedEdges}
              visitedNodes={visitedNodes}
              pathNodes={pathNodes}
              pathEdges={pathEdges}
              tool={tool}
              onAddNode={handleAddNode}
              onAddEdge={handleAddEdge}
              onSelectNode={handleSelectNode}
              onSelectEdge={handleSelectEdge}
              onMoveNode={handleMoveNode}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={handleDeleteEdge}
              onClearSelection={handleClearSelection}
            />
          </div>
          
          {/* Bottom panel - Resizable & Collapsible */}
          <div 
            className="glass border-t border-slate-700/50 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0"
            style={{ height: isBottomPanelCollapsed ? '40px' : `${bottomPanelHeight}px` }}
          >
            {/* Resize handle */}
            {!isBottomPanelCollapsed && (
              <div
                onMouseDown={handleResizeStart}
                className={`h-1 cursor-ns-resize bg-slate-700/50 hover:bg-primary-500/50 transition-colors flex items-center justify-center group ${isResizing ? 'bg-primary-500/70' : ''}`}
              >
                <div className="w-10 h-0.5 bg-slate-500 group-hover:bg-primary-400 rounded-full transition-colors" />
              </div>
            )}
            
            {/* Tab header with collapse toggle */}
            <div className="flex items-center border-b border-slate-700/50 bg-slate-800/50">
              <button
                onClick={toggleBottomPanel}
                className="px-3 py-2 text-slate-400 hover:text-white transition-colors hover:bg-slate-700/50"
                title={isBottomPanelCollapsed ? 'Expand panel' : 'Collapse panel'}
              >
                <svg 
                  className={`w-4 h-4 transition-transform duration-300 ${isBottomPanelCollapsed ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="flex flex-1">
                <button
                  onClick={() => { setActiveBottomTab('matrix'); if (isBottomPanelCollapsed) setIsBottomPanelCollapsed(false); }}
                  className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeBottomTab === 'matrix'
                      ? 'text-white border-b-2 border-primary-500 bg-slate-700/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/20'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Adjacency Matrix
                </button>
                <button
                  onClick={() => { setActiveBottomTab('steps'); if (isBottomPanelCollapsed) setIsBottomPanelCollapsed(false); }}
                  className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeBottomTab === 'steps'
                      ? 'text-white border-b-2 border-primary-500 bg-slate-700/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/20'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Execution Steps
                  {steps.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded-full">
                      {currentStep + 1}/{steps.length}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Panel size indicator */}
              {!isBottomPanelCollapsed && (
                <div className="px-3 text-xs text-slate-500">
                  {graph.nodes.length} nodes • {graph.edges.length} edges
                </div>
              )}
            </div>
            
            {/* Content area */}
            {!isBottomPanelCollapsed && (
              <div className="flex-1 overflow-auto">
                {activeBottomTab === 'steps' ? (
                  <StepLog steps={steps} currentStep={currentStep} />
                ) : (
                  <MatrixDisplay
                    graph={graph}
                    showDistance={showDistanceMatrix}
                    onToggle={() => setShowDistanceMatrix(!showDistanceMatrix)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Right panel - Algorithm controls */}
        <AlgorithmPanel
          selectedAlgorithm={algorithm}
          onSelectAlgorithm={setAlgorithm}
          startNode={startNode}
          endNode={endNode}
          nodes={graph.nodes.map(n => ({ id: n.id, label: n.label }))}
          onSetStartNode={setStartNode}
          onSetEndNode={setEndNode}
          onRun={handleRun}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          isRunning={isRunning}
          isPaused={isPaused}
          speed={speed}
          onSpeedChange={setSpeed}
          currentStep={currentStep}
          totalSteps={steps.length}
          onCompareMode={() => setShowCompareMode(true)}
        />
      </div>
      
      {/* About Modal */}
      {showAbout && <About onClose={() => setShowAbout(false)} />}
      
      {/* Compare Mode */}
      {showCompareMode && (
        <CompareMode
          graph={graph}
          startNode={startNode}
          endNode={endNode}
          onClose={() => setShowCompareMode(false)}
        />
      )}
    </div>
  );
}
