import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Script, ScriptIteration } from '@shared/schema';
import { IterationProgressInfo } from '@/types/scriptTypes';

interface GenerationStepProps {
  script?: Script;
  iterations: ScriptIteration[];
  onBack: () => void;
  onGenerateNext: () => void;
  onSkipToReview: () => void;
  isLoading: boolean;
}

export default function GenerationStep({
  script,
  iterations,
  onBack,
  onGenerateNext,
  onSkipToReview,
  isLoading
}: GenerationStepProps) {
  // Calculate current iteration information
  const iterationInfo = useMemo(() => {
    if (!script) return null;

    const inProgressIndex = iterations.findIndex(it => it.status === 'in_progress');
    let currentIteration: IterationProgressInfo;

    if (inProgressIndex >= 0) {
      // There's an iteration in progress
      currentIteration = {
        iterationNumber: iterations[inProgressIndex].iterationNumber,
        total: script.iterations,
        percentComplete: 0, // We don't know the progress percentage
        status: 'in-progress'
      };
    } else if (iterations.length < script.iterations) {
      // All current iterations are complete, but we haven't reached the total yet
      currentIteration = {
        iterationNumber: iterations.length + 1,
        total: script.iterations,
        percentComplete: 0,
        status: 'pending'
      };
    } else {
      // All iterations are complete
      currentIteration = {
        iterationNumber: script.iterations,
        total: script.iterations,
        percentComplete: 100,
        status: 'complete'
      };
    }

    return currentIteration;
  }, [script, iterations]);

  // Generate progress bar for each iteration
  const progressBars = useMemo(() => {
    if (!script) return [];

    const bars = [];
    for (let i = 1; i <= script.iterations; i++) {
      const iteration = iterations.find(it => it.iterationNumber === i);
      
      let status: 'complete' | 'in-progress' | 'pending' = 'pending';
      let progress = 0;
      
      if (iteration) {
        if (iteration.status === 'completed') {
          status = 'complete';
          progress = 100;
        } else if (iteration.status === 'in_progress') {
          status = 'in-progress';
          progress = 73; // Hardcoded for design; in a real app would be dynamic
        } else {
          status = 'pending';
        }
      }
      
      bars.push({
        iterationNumber: i,
        status,
        progress
      });
    }
    
    return bars;
  }, [script, iterations]);

  // Determine if we can skip to review (all iterations complete or at least one is)
  const canSkipToReview = useMemo(() => {
    if (!script) return false;
    
    const completedIterations = iterations.filter(it => it.status === 'completed');
    return completedIterations.length > 0;
  }, [script, iterations]);

  if (!script) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Generating Your Script</h2>
        <p className="text-sm text-muted-foreground">
          The AI is working through multiple iterations to create your script.
        </p>
      </div>
      
      <div className="py-10">
        {/* Current Iteration */}
        <div className="text-center mb-8">
          <span className="text-sm font-medium text-muted-foreground">Currently working on</span>
          <h3 className="text-2xl font-bold text-primary">
            {iterationInfo ? 
              `Iteration ${iterationInfo.iterationNumber} of ${iterationInfo.total}` : 
              'Preparing...'}
          </h3>
        </div>
        
        {/* Progress Bars */}
        <div className="max-w-md mx-auto space-y-4">
          {progressBars.map((bar) => (
            <div key={bar.iterationNumber} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Iteration {bar.iterationNumber}</span>
                <span>
                  {bar.status === 'complete' ? 'Complete' : 
                   bar.status === 'in-progress' ? `${bar.progress}%` : 
                   'Pending'}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    bar.status === 'complete' ? 'bg-green-500' : 
                    bar.status === 'in-progress' ? 'bg-primary' : 
                    'bg-gray-400'
                  }`}
                  style={{ width: `${bar.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Current Action */}
        <div className="mt-10 text-center text-sm text-muted-foreground">
          {iterations.some(it => it.status === 'in_progress') ? (
            <>
              <p>Currently refining content and reducing redundancy...</p>
              <div className="inline-flex items-center mt-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            </>
          ) : iterations.length === script.iterations ? (
            <p>All iterations complete. Ready for review.</p>
          ) : (
            <Button 
              onClick={onGenerateNext}
              disabled={isLoading}
              variant="outline"
              className="mt-2"
            >
              {isLoading ? 'Generating...' : 'Generate Next Iteration'}
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Configuration
        </Button>
        <Button 
          variant="secondary" 
          onClick={onSkipToReview}
          disabled={!canSkipToReview}
          className={!canSkipToReview ? "opacity-50 cursor-not-allowed" : ""}
        >
          Skip to Review
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
