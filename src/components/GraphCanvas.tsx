import { useRef, useEffect, useState, useCallback } from 'react';
import { Graph, Node, Edge } from '../types';
import { getNodeById } from '../utils/graphUtils';

interface GraphCanvasProps {
  graph: Graph;
  selectedNodes: string[];
  selectedEdges: string[];
  highlightedNodes: Set<string>;
  highlightedEdges: Set<string>;
  visitedNodes: Set<string>;
  pathNodes: Set<string>;
  pathEdges: Set<string>;
  tool: string;
  onAddNode: (x: number, y: number) => void;
  onAddEdge: (sourceId: string, targetId: string) => void;
  onSelectNode: (nodeId: string, multi: boolean) => void;
  onSelectEdge: (edgeId: string, multi: boolean) => void;
  onMoveNode: (nodeId: string, x: number, y: number) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onClearSelection: () => void;
}

const NODE_RADIUS = 28;
const ARROW_SIZE = 12;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_SENSITIVITY = 0.001;

export default function GraphCanvas({
  graph,
  selectedNodes,
  selectedEdges,
  highlightedNodes,
  highlightedEdges,
  visitedNodes,
  pathNodes,
  pathEdges,
  tool,
  onAddNode,
  onAddEdge,
  onSelectNode,
  onSelectEdge,
  onMoveNode,
  onDeleteNode,
  onDeleteEdge,
  onClearSelection,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [edgeStart, setEdgeStart] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Pan and zoom state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Transform screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom,
    };
  }, [pan, zoom]);

  // Handle mouse wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom around mouse position
    const zoomFactor = 1 - e.deltaY * ZOOM_SENSITIVITY;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, MIN_ZOOM), MAX_ZOOM);

    if (newZoom !== zoom) {
      const scale = newZoom / zoom;
      setPan(prev => ({
        x: mouseX - (mouseX - prev.x) * scale,
        y: mouseY - (mouseY - prev.y) * scale,
      }));
      setZoom(newZoom);
    }
  }, [zoom]);

  // Get node color based on state
  const getNodeColor = useCallback((nodeId: string) => {
    if (pathNodes.has(nodeId)) return '#22c55e'; // Green for path
    if (highlightedNodes.has(nodeId)) return '#f97316'; // Orange for current
    if (visitedNodes.has(nodeId)) return '#0ea5e9'; // Blue for visited
    if (selectedNodes.includes(nodeId)) return '#d946ef'; // Purple for selected
    return '#475569'; // Default slate
  }, [pathNodes, highlightedNodes, visitedNodes, selectedNodes]);

  // Get edge color based on state
  const getEdgeColor = useCallback((edgeId: string) => {
    if (pathEdges.has(edgeId)) return '#22c55e';
    if (highlightedEdges.has(edgeId)) return '#f97316';
    if (selectedEdges.includes(edgeId)) return '#d946ef';
    return '#64748b';
  }, [pathEdges, highlightedEdges, selectedEdges]);

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = dimensions.width * window.devicePixelRatio;
    canvas.height = dimensions.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Apply transformations (pan and zoom)
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < dimensions.width / zoom; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, dimensions.height / zoom);
      ctx.stroke();
    }
    for (let y = 0; y < dimensions.height / zoom; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(dimensions.width / zoom, y);
      ctx.stroke();
    }

    // Draw edges
    for (const edge of graph.edges) {
      const source = getNodeById(graph, edge.source);
      const target = getNodeById(graph, edge.target);
      if (!source || !target) continue;

      const color = getEdgeColor(edge.id);
      const isPath = pathEdges.has(edge.id);
      const isHighlighted = highlightedEdges.has(edge.id);

      ctx.strokeStyle = color;
      ctx.lineWidth = isPath || isHighlighted ? 4 : 2;

      // Calculate edge direction
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / len;
      const ny = dy / len;

      // Adjust for node radius
      const startX = source.x + nx * NODE_RADIUS;
      const startY = source.y + ny * NODE_RADIUS;
      const endX = target.x - nx * NODE_RADIUS;
      const endY = target.y - ny * NODE_RADIUS;

      // Draw line
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Draw arrow for directed graphs
      if (graph.isDirected) {
        const angle = Math.atan2(dy, dx);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - ARROW_SIZE * Math.cos(angle - Math.PI / 6),
          endY - ARROW_SIZE * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - ARROW_SIZE * Math.cos(angle + Math.PI / 6),
          endY - ARROW_SIZE * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }

      // Draw weight
      if (graph.isWeighted) {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        
        // Background
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(midX, midY, 14, 0, Math.PI * 2);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Text
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.weight.toString(), midX, midY);
      }
    }

    // Draw edge being created
    if (edgeStart && mousePos) {
      const source = getNodeById(graph, edgeStart);
      if (source) {
        const canvasMousePos = screenToCanvas(mousePos.x, mousePos.y);
        ctx.strokeStyle = '#d946ef';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(canvasMousePos.x, canvasMousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw nodes
    for (const node of graph.nodes) {
      const color = getNodeColor(node.id);
      const isPath = pathNodes.has(node.id);
      const isHighlighted = highlightedNodes.has(node.id);

      // Glow effect
      if (isPath || isHighlighted) {
        const gradient = ctx.createRadialGradient(
          node.x, node.y, NODE_RADIUS,
          node.x, node.y, NODE_RADIUS * 2
        );
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Node circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = isPath || isHighlighted ? '#fff' : '#94a3b8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
    }

    ctx.restore();
  }, [graph, dimensions, selectedNodes, selectedEdges, highlightedNodes, highlightedEdges, visitedNodes, pathNodes, pathEdges, edgeStart, mousePos, getNodeColor, getEdgeColor, pan, zoom, screenToCanvas]);

  // Find node at position
  const findNodeAt = useCallback((x: number, y: number): Node | undefined => {
    const canvasPos = screenToCanvas(x, y);
    return graph.nodes.find(node => {
      const dx = node.x - canvasPos.x;
      const dy = node.y - canvasPos.y;
      return Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS;
    });
  }, [graph.nodes, screenToCanvas]);

  // Find edge at position
  const findEdgeAt = useCallback((x: number, y: number): Edge | undefined => {
    const canvasPos = screenToCanvas(x, y);
    for (const edge of graph.edges) {
      const source = getNodeById(graph, edge.source);
      const target = getNodeById(graph, edge.target);
      if (!source || !target) continue;

      // Check distance from point to line
      const A = canvasPos.x - source.x;
      const B = canvasPos.y - source.y;
      const C = target.x - source.x;
      const D = target.y - source.y;
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      if (lenSq !== 0) param = dot / lenSq;

      let xx, yy;
      if (param < 0) {
        xx = source.x;
        yy = source.y;
      } else if (param > 1) {
        xx = target.x;
        yy = target.y;
      } else {
        xx = source.x + param * C;
        yy = source.y + param * D;
      }

      const dx = canvasPos.x - xx;
      const dy = canvasPos.y - yy;
      if (Math.sqrt(dx * dx + dy * dy) <= 10) {
        return edge;
      }
    }
    return undefined;
  }, [graph, screenToCanvas]);

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const node = findNodeAt(x, y);
    const edge = findEdgeAt(x, y);

    // Pan with middle mouse button or Ctrl + left click
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    switch (tool) {
      case 'select':
      case 'move':
        if (node) {
          onSelectNode(node.id, e.shiftKey);
          if (tool === 'move') {
            setDragging(node.id);
          }
        } else if (edge) {
          onSelectEdge(edge.id, e.shiftKey);
        } else {
          onClearSelection();
        }
        break;
      case 'addNode':
        if (!node) {
          const canvasPos = screenToCanvas(x, y);
          onAddNode(canvasPos.x, canvasPos.y);
        }
        break;
      case 'addEdge':
        if (node) {
          if (!edgeStart) {
            setEdgeStart(node.id);
          } else if (edgeStart !== node.id) {
            onAddEdge(edgeStart, node.id);
            setEdgeStart(null);
          }
        } else {
          setEdgeStart(null);
        }
        break;
      case 'delete':
        if (node) {
          onDeleteNode(node.id);
        } else if (edge) {
          onDeleteEdge(edge.id);
        }
        break;
    }
  }, [tool, edgeStart, findNodeAt, findEdgeAt, onSelectNode, onSelectEdge, onClearSelection, onAddNode, onAddEdge, onDeleteNode, onDeleteEdge, pan, screenToCanvas]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (dragging) {
      const canvasPos = screenToCanvas(x, y);
      onMoveNode(dragging, canvasPos.x, canvasPos.y);
    }
  }, [dragging, isPanning, panStart, onMoveNode, screenToCanvas]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setIsPanning(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setDragging(null);
    setIsPanning(false);
    setMousePos(null);
  }, []);

  // Get cursor style
  const getCursor = () => {
    if (isPanning) return 'grabbing';
    switch (tool) {
      case 'addNode': return 'crosshair';
      case 'addEdge': return edgeStart ? 'crosshair' : 'pointer';
      case 'delete': return 'not-allowed';
      case 'move': return dragging ? 'grabbing' : 'grab';
      default: return 'default';
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          cursor: getCursor(),
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      />
      
      {/* Tool indicator */}
      <div className="absolute top-4 left-4 glass rounded-lg px-3 py-2 text-sm">
        <span className="text-slate-400">Tool: </span>
        <span className="text-white font-medium capitalize">{tool.replace('add', 'Add ')}</span>
        {edgeStart && (
          <span className="ml-2 text-accent-400">
            (Click target node)
          </span>
        )}
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom(Math.min(zoom * 1.2, MAX_ZOOM))}
          className="glass w-10 h-10 rounded-lg flex items-center justify-center text-white hover:bg-slate-700/50 transition-colors"
          title="Zoom In"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom / 1.2, MIN_ZOOM))}
          className="glass w-10 h-10 rounded-lg flex items-center justify-center text-white hover:bg-slate-700/50 transition-colors"
          title="Zoom Out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="glass w-10 h-10 rounded-lg flex items-center justify-center text-white hover:bg-slate-700/50 transition-colors"
          title="Reset View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        <div className="glass rounded-lg px-2 py-1 text-xs text-center text-slate-300">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Pan hint */}
      <div className="absolute bottom-4 left-4 glass rounded-lg px-3 py-2 text-xs text-slate-400">
        <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">Ctrl</kbd> + Drag or
        <kbd className="ml-1 px-1.5 py-0.5 bg-slate-700 rounded text-xs">Scroll</kbd> to pan/zoom
      </div>
    </div>
  );
}
