import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

import AppLayout from '@/components/layout/AppLayout';
import ProgressSteps from '@/components/scriptwriting/ProgressSteps';
import InputStep from '@/components/scriptwriting/InputStep';
import GenerationStep from '@/components/scriptwriting/GenerationStep';
import ReviewStep from '@/components/scriptwriting/ReviewStep';
import ExportStep from '@/components/scriptwriting/ExportStep';

import { WizardStep, ScriptState } from '@/types/scriptTypes';
import { CreateScriptInput, ExportSettings } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export default function Home() {
  const { toast } = useToast();
  const [scriptState, setScriptState] = useState<ScriptState>({
    iterations: [],
    currentStep: 'input',
    isLoading: false,
  });

  // Create script mutation
  const createScriptMutation = useMutation({
    mutationFn: async (data: CreateScriptInput) => {
      const res = await apiRequest('POST', '/api/scripts', data);
      return res.json();
    },
    onSuccess: (data) => {
      setScriptState({
        ...scriptState,
        script: data.script,
        iterations: [data.iteration],
        currentStep: 'generate',
      });
      
      // Poll for iteration completion
      queryClient.prefetchQuery({
        queryKey: ['/api/scripts', data.script.id],
        refetchInterval: 2000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create script',
        variant: 'destructive',
      });
    },
  });

  // Generate next iteration mutation
  const generateNextIterationMutation = useMutation({
    mutationFn: async () => {
      if (!scriptState.script) throw new Error("No active script");
      const res = await apiRequest('POST', `/api/scripts/${scriptState.script.id}/iterations`, {});
      return res.json();
    },
    onSuccess: (newIteration) => {
      setScriptState(prev => ({
        ...prev,
        iterations: [...prev.iterations, newIteration],
      }));
      
      // Poll for iteration completion
      if (scriptState.script) {
        queryClient.prefetchQuery({
          queryKey: ['/api/scripts', scriptState.script.id],
          refetchInterval: 2000,
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate next iteration',
        variant: 'destructive',
      });
    },
  });

  // Update iteration content mutation
  const updateIterationMutation = useMutation({
    mutationFn: async ({ iterationId, content }: { iterationId: number, content: string }) => {
      if (!scriptState.script) throw new Error("No active script");
      const res = await apiRequest('PUT', `/api/scripts/${scriptState.script.id}/iterations/${iterationId}`, { content });
      return res.json();
    },
    onSuccess: (updatedIteration) => {
      setScriptState(prev => ({
        ...prev,
        iterations: prev.iterations.map(it => 
          it.id === updatedIteration.id ? updatedIteration : it
        ),
      }));
      toast({
        title: 'Success',
        description: 'Script updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update script',
        variant: 'destructive',
      });
    },
  });

  // Fetch script with iterations (used for polling)
  const { data: scriptData } = useQuery({
    queryKey: scriptState.script ? ['/api/scripts', scriptState.script.id] : null,
    enabled: !!scriptState.script,
    refetchInterval: scriptState.currentStep === 'generate' ? 2000 : false,
    onSuccess: (data) => {
      // Update local state with fetched data
      setScriptState(prev => {
        const allComplete = data.iterations.every((it: any) => it.status === 'completed' || it.status === 'failed');
        
        // Auto advance to review step when all iterations are complete
        const nextStep = prev.currentStep === 'generate' && 
                        allComplete && 
                        data.iterations.length === data.script.iterations
                        ? 'review' 
                        : prev.currentStep;
        
        return {
          ...prev,
          script: data.script,
          iterations: data.iterations,
          currentStep: nextStep,
        };
      });
    },
  });

  // Export script handler
  const handleExport = async (settings: ExportSettings) => {
    if (!scriptState.script) return;
    
    try {
      setScriptState(prev => ({ ...prev, isLoading: true }));
      
      // Create a form to handle file download
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/api/scripts/${scriptState.script!.id}/export`;
      form.target = '_blank';
      
      // Add settings as hidden form fields
      for (const [key, value] of Object.entries(settings)) {
        if (value !== undefined) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = typeof value === 'object' ? JSON.stringify(value) : String(value);
          form.appendChild(input);
        }
      }
      
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      
      toast({
        title: 'Export Started',
        description: 'Your script is being exported',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export script',
        variant: 'destructive',
      });
    } finally {
      setScriptState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Navigate between steps
  const goToStep = (step: WizardStep) => {
    setScriptState(prev => ({ ...prev, currentStep: step }));
  };

  // Handle script creation from input step
  const handleCreateScript = (data: CreateScriptInput) => {
    createScriptMutation.mutate(data);
  };

  // Get step number for progress display
  const getStepNumber = (step: WizardStep): number => {
    const steps: WizardStep[] = ['input', 'generate', 'review', 'export'];
    return steps.indexOf(step) + 1;
  };

  // Current active step component
  const renderActiveStep = () => {
    switch (scriptState.currentStep) {
      case 'input':
        return (
          <InputStep 
            onSubmit={handleCreateScript} 
            isLoading={createScriptMutation.isPending} 
          />
        );
      case 'generate':
        return (
          <GenerationStep 
            script={scriptState.script}
            iterations={scriptState.iterations}
            onBack={() => goToStep('input')}
            onGenerateNext={() => generateNextIterationMutation.mutate()}
            onSkipToReview={() => goToStep('review')}
            isLoading={generateNextIterationMutation.isPending}
          />
        );
      case 'review':
        return (
          <ReviewStep 
            script={scriptState.script}
            iterations={scriptState.iterations}
            activeIterationId={scriptState.activeIterationId}
            onSelectIteration={(id) => setScriptState(prev => ({ ...prev, activeIterationId: id }))}
            onUpdateIteration={(id, content) => updateIterationMutation.mutate({ iterationId: id, content })}
            onBack={() => goToStep('generate')}
            onContinue={() => goToStep('export')}
            isLoading={updateIterationMutation.isPending}
          />
        );
      case 'export':
        return (
          <ExportStep 
            script={scriptState.script}
            iterations={scriptState.iterations}
            onBack={() => goToStep('review')}
            onExport={handleExport}
            isLoading={scriptState.isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="mb-10">
        <ProgressSteps 
          currentStep={getStepNumber(scriptState.currentStep)} 
          totalSteps={4} 
        />
      </div>
      
      <div className="card p-6 border rounded-lg shadow-sm bg-background">
        {renderActiveStep()}
      </div>
    </AppLayout>
  );
}
