import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Edit, Plus, ArrowRight, FileText, Type } from 'lucide-react';
import { Script, ScriptIteration } from '@shared/schema';
import ScriptPreview from './ScriptPreview';
import { formatTimeFromSeconds } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface ReviewStepProps {
  script?: Script;
  iterations: ScriptIteration[];
  activeIterationId?: number;
  onSelectIteration: (id: number) => void;
  onUpdateIteration: (id: number, content: string) => void;
  onBack: () => void;
  onContinue: () => void;
  isLoading: boolean;
}

export default function ReviewStep({
  script,
  iterations,
  activeIterationId,
  onSelectIteration,
  onUpdateIteration,
  onBack,
  onContinue,
  isLoading
}: ReviewStepProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  // Find completed iterations
  const completedIterations = useMemo(() => {
    return iterations.filter(it => it.status === 'completed')
      .sort((a, b) => a.iterationNumber - b.iterationNumber);
  }, [iterations]);

  // Calculate the active iteration
  const activeIteration = useMemo(() => {
    if (activeIterationId) {
      return iterations.find(it => it.id === activeIterationId);
    }
    // Default to the last completed iteration
    return completedIterations.length > 0 ? completedIterations[completedIterations.length - 1] : undefined;
  }, [activeIterationId, iterations, completedIterations]);

  // Calculate script analysis
  const scriptAnalysis = useMemo(() => {
    if (!activeIteration || !activeIteration.metrics) return null;
    
    const metrics = activeIteration.metrics as any;
    return {
      estimatedDuration: metrics.estimatedDuration || 0,
      wordCount: metrics.wordCount || 0,
      readabilityScore: metrics.readabilityScore,
      redundancyReduction: metrics.redundancyReduction,
    };
  }, [activeIteration]);

  // Handle starting edit mode
  const handleStartEditing = () => {
    if (activeIteration) {
      setEditedContent(activeIteration.content);
      setIsEditing(true);
    }
  };

  // Handle saving edits
  const handleSaveEdits = () => {
    if (activeIteration) {
      onUpdateIteration(activeIteration.id, editedContent);
      setIsEditing(false);
    }
  };

  // Handle cancelling edits
  const handleCancelEdits = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  // Return early if no script exists yet
  if (!script || completedIterations.length === 0) {
    return <div>No completed iterations available for review.</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Review & Edit Your Script</h2>
        <p className="text-sm text-muted-foreground">Compare iterations and make any final adjustments.</p>
      </div>
      
      {/* Iteration Tabs */}
      <Tabs defaultValue="final" className="w-full">
        <TabsList className="border-b w-full rounded-none justify-start">
          <TabsTrigger value="final">Final Version</TabsTrigger>
          {completedIterations.map((iteration) => (
            <TabsTrigger 
              key={iteration.id} 
              value={`iteration-${iteration.id}`}
              onClick={() => onSelectIteration(iteration.id)}
            >
              Iteration {iteration.iterationNumber}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Content for each tab */}
        <TabsContent value="final">
          {activeIteration && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Script Preview */}
              {isEditing ? (
                <div className="card p-4 border rounded-lg h-[500px] overflow-auto">
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-full font-mono text-sm leading-relaxed"
                  />
                </div>
              ) : (
                <div className="card p-4 border rounded-lg h-[500px] overflow-auto">
                  <div className="mb-2 flex justify-between items-center">
                    <h3 className="font-medium text-sm">Final Version</h3>
                    {scriptAnalysis?.redundancyReduction && (
                      <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full">
                        Redundancy reduced by {scriptAnalysis.redundancyReduction.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <ScriptPreview content={activeIteration.content} />
                </div>
              )}
              
              {/* Edit Tools */}
              <div className="space-y-4">
                {/* Analysis Card */}
                <div className="card p-4 border rounded-lg">
                  <h3 className="font-medium text-sm mb-3">Script Analysis</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Estimated Length:</span>
                      <span className="font-medium">
                        {scriptAnalysis?.estimatedDuration 
                          ? formatTimeFromSeconds(scriptAnalysis.estimatedDuration) 
                          : 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Tone:</span>
                      <span className="font-medium">{script.tone}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Word Count:</span>
                      <span className="font-medium">
                        {scriptAnalysis?.wordCount?.toLocaleString() || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Reading Level:</span>
                      <span className="font-medium">
                        {scriptAnalysis?.readabilityScore 
                          ? `General Audience (${scriptAnalysis.readabilityScore}/10)` 
                          : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Refinement Options */}
                <div className="card p-4 border rounded-lg">
                  <h3 className="font-medium text-sm mb-3">Refinement Options</h3>
                  
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Make it more concise
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Add more examples
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Simplify technical language
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Strengthen call-to-action
                    </Button>
                  </div>
                </div>
                
                {/* Manual Editing */}
                <div className="card p-4 border rounded-lg">
                  <h3 className="font-medium text-sm mb-3">Manual Editing</h3>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdits} disabled={isLoading} className="flex-1">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdits} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button onClick={handleStartEditing} className="w-full mb-2">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Script Directly
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Make specific changes to the content, structure, or phrasing.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Iteration tabs */}
        {completedIterations.map((iteration) => (
          <TabsContent key={iteration.id} value={`iteration-${iteration.id}`}>
            <div className="card p-4 border rounded-lg">
              <h3 className="font-medium text-sm mb-3">Iteration {iteration.iterationNumber}</h3>
              <ScriptPreview content={iteration.content} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Generation
        </Button>
        <Button onClick={onContinue}>
          Continue to Export
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
