import { AlgorithmStep } from '../types';

interface StepLogProps {
  steps: AlgorithmStep[];
  currentStep: number;
}

export default function StepLog({ steps, currentStep }: StepLogProps) {
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'visit': return '🔵';
      case 'explore': return '🟡';
      case 'relax': return '🟢';
      case 'path': return '✅';
      case 'complete': return '🏁';
      case 'cycle-detected': return '🔴';
      default: return '⚪';
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'visit': return 'border-blue-500';
      case 'explore': return 'border-yellow-500';
      case 'relax': return 'border-green-500';
      case 'path': return 'border-emerald-500';
      case 'complete': return 'border-purple-500';
      case 'cycle-detected': return 'border-red-500';
      default: return 'border-slate-500';
    }
  };

  if (steps.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        Run an algorithm to see the execution steps
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
      {steps.slice(0, currentStep + 1).map((step, index) => (
        <div
          key={index}
          className={`
            flex items-start gap-2 p-2 rounded-lg border-l-4 transition-all
            ${index === currentStep ? 'bg-slate-700/50' : 'bg-slate-800/30'}
            ${getStepColor(step.type)}
          `}
        >
          <span className="text-lg">{getStepIcon(step.type)}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">#{index + 1}</span>
              <span className="text-xs px-1.5 py-0.5 bg-slate-700 rounded capitalize">
                {step.type}
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1">{step.message}</p>
            
            {/* Show distances if available */}
            {step.distances && step.distances.size > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {Array.from(step.distances.entries()).slice(0, 6).map(([, dist]) => (
                  <span key={Math.random()} className="text-xs px-1.5 py-0.5 bg-slate-800 rounded mono">
                    {dist === Infinity ? '∞' : dist.toFixed?.(1) || dist}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
