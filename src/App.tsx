import { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import GraphCanvas from './components/GraphCanvas';
import AlgorithmPanel from './components/AlgorithmPanel';
import MatrixDisplay from './components/MatrixDisplay';
import StepLog from './components/StepLog';
import About from './components/About';
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
  const [activeBottomTab, setActiveBottomTab] = useState<'matrix' | 'steps'>('steps');
  
  // About modal
  const [showAbout, setShowAbout] = useState(false);
  
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
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
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
          
          {/* Bottom panel */}
          <div className="h-72 glass border-t border-slate-700/50">
            <div className="flex border-b border-slate-700/50">
              <button
                onClick={() => setActiveBottomTab('steps')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeBottomTab === 'steps'
                    ? 'text-white border-b-2 border-primary-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📋 Execution Steps
              </button>
              <button
                onClick={() => setActiveBottomTab('matrix')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeBottomTab === 'matrix'
                    ? 'text-white border-b-2 border-primary-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📊 Matrix View
              </button>
            </div>
            
            <div className="h-[calc(100%-41px)] overflow-auto">
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
        />
      </div>
      
      {/* About Modal */}
      {showAbout && <About onClose={() => setShowAbout(false)} />}
    </div>
  );
}
