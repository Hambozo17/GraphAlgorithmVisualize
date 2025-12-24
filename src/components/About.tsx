interface AboutProps {
  onClose: () => void;
}

export default function About({ onClose }: AboutProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="card max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold gradient-text mb-2">About This Project</h2>
            <p className="text-slate-400">Graph Algorithm Visualizer</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Project Description */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-2xl">📚</span>
              Project Overview
            </h3>
            <p className="text-slate-300 leading-relaxed">
              An interactive web-based visualization tool for understanding and analyzing graph algorithms. 
              This project demonstrates the step-by-step execution of classic graph traversal and shortest 
              path algorithms including BFS, DFS, Dijkstra's, Bellman-Ford, and A*.
            </p>
          </section>

          {/* Features */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              Key Features
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-primary-400">▸</span>
                <span>Interactive graph drawing and editing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400">▸</span>
                <span>Five classic algorithms implemented</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400">▸</span>
                <span>Step-by-step animation with controls</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400">▸</span>
                <span>Pan, zoom, and navigate large graphs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400">▸</span>
                <span>Adjacency and distance matrix views</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400">▸</span>
                <span>Algorithm complexity analysis</span>
              </li>
            </ul>
          </section>

          {/* Team Members */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">👥</span>
              Team Members
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 rounded-lg p-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xl mb-3">
                  MM
                </div>
                <h4 className="font-semibold text-white">Mohamed Mohsen</h4>
                <p className="text-sm text-primary-400 mono">221001411</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl mb-3">
                  FK
                </div>
                <h4 className="font-semibold text-white">Farah Khaled</h4>
                <p className="text-sm text-purple-400 mono">221001643</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xl mb-3">
                  OA
                </div>
                <h4 className="font-semibold text-white">Omar Ahmed</h4>
                <p className="text-sm text-green-400 mono">221001335</p>
              </div>
            </div>
          </section>

          {/* Course Information */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              Course Information
            </h3>
            <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700/50">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-primary-400 font-semibold min-w-[100px]">Course:</span>
                  <span className="text-slate-300">CSCI208: Design and Analysis of Algorithms</span>
                </div>
                <div className="border-t border-slate-700/50 pt-3">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-primary-400 font-semibold min-w-[100px]">Instructors:</span>
                    <div className="text-slate-300">
                      <div className="mb-1">Dr. Shereen Aly</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary-400 font-semibold min-w-[100px]">TAs:</span>
                    <div className="text-slate-300">
                      <div>Eng. Ganat Elsayed</div>
                      <div>Eng. Bassant Ahmed Farouk</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-2xl">🛠️</span>
              Technologies Used
            </h3>
            <div className="flex flex-wrap gap-2">
              {['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'HTML5 Canvas', 'Git'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded-full text-sm text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-700/50">
            <p className="text-center text-sm text-slate-500">
              Built with ❤️ for CSCI208 • Fall 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
