# Graph Algorithm Visualizer

An interactive web application for visualizing graph algorithms. Built with React, TypeScript, and Tailwind CSS.

![Graph Algorithm Visualizer](https://via.placeholder.com/800x400?text=Graph+Algorithm+Visualizer)

## ✨ Features

### Graph Creation & Editing
- **Draw nodes** by clicking on the canvas
- **Connect nodes** with edges (weighted or unweighted)
- **Drag nodes** to rearrange the graph layout
- **Delete** nodes and edges
- Toggle between **directed** and **undirected** graphs
- **Load sample graphs** for quick testing

### Supported Algorithms
| Algorithm | Description | Supports Weighted | Supports Negative |
|-----------|-------------|-------------------|-------------------|
| **BFS** | Breadth-First Search - finds shortest path in unweighted graphs | ❌ | ❌ |
| **DFS** | Depth-First Search - detects cycles in graphs | ❌ | ❌ |
| **Dijkstra** | Finds shortest path with non-negative weights | ✅ | ❌ |
| **Bellman-Ford** | Handles negative weights, detects negative cycles | ✅ | ✅ |
| **A*** | Heuristic-based shortest path finding | ✅ | ❌ |

### Visualization Features
- **Step-by-step animation** with adjustable speed
- **Play, pause, step forward/backward** controls
- **Color-coded visualization**:
  - 🔵 Blue: Visited nodes
  - 🟠 Orange: Currently processing
  - 🟢 Green: Final path
- **Execution log** showing each step's details
- **Adjacency & Distance matrices** display

### Educational Content
- Algorithm descriptions and use cases
- Time & space complexity analysis
- Pseudocode reference
- Real-world application examples

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone or navigate to the project
cd GraphAlgorithmVisualize

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder, ready for deployment.

## 🎮 How to Use

1. **Create a graph**:
   - Select "Add Node" tool and click on the canvas
   - Select "Add Edge" tool, click source node, then target node
   - Enter weight when prompted (for weighted graphs)

2. **Configure the algorithm**:
   - Choose an algorithm from the right panel
   - Select start node (and end node for path-finding)
   - Adjust animation speed

3. **Run visualization**:
   - Click "Run" to start the animation
   - Use playback controls to pause, step through, or stop
   - Watch the execution steps in the bottom panel

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `V` | Select tool |
| `M` | Move tool |
| `N` | Add Node tool |
| `E` | Add Edge tool |
| `D` / `Delete` | Delete tool |
| `Space` | Play/Pause |
| `Escape` | Stop visualization |

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Canvas API** - Graph rendering

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.tsx         # App header
│   ├── Toolbar.tsx        # Tool selection bar
│   ├── GraphCanvas.tsx    # Main canvas for graph
│   ├── AlgorithmPanel.tsx # Algorithm controls
│   ├── MatrixDisplay.tsx  # Adjacency/Distance matrix
│   └── StepLog.tsx        # Execution steps log
├── utils/
│   ├── graphUtils.ts      # Graph operations
│   ├── algorithms.ts      # Algorithm implementations
│   └── algorithmInfo.ts   # Algorithm metadata
├── types/
│   └── index.ts           # TypeScript types
├── App.tsx                # Main application
├── main.tsx               # Entry point
└── index.css              # Global styles
```

## 🚀 Deployment to GitHub Pages

1. Update `vite.config.ts` base path if needed
2. Build the project: `npm run build`
3. Deploy the `dist` folder to GitHub Pages

## 📄 License

MIT License - feel free to use this for educational purposes!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Add more algorithms
- Improve the UI/UX

---

Built with ❤️ for learning graph algorithms
