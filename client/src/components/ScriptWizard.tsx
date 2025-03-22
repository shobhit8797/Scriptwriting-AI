import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import WizardProgress from "@/components/wizard/WizardProgress";
import InputStep from "@/components/wizard/InputStep";
import GenerationStep from "@/components/wizard/GenerationStep";
import ReviewStep from "@/components/wizard/ReviewStep";
import ExportStep from "@/components/wizard/ExportStep";
import {
  Script,
  ScriptIteration,
  CreateScriptInput,
  ExportOptions,
} from "@/types/script";

// Wizard steps
type WizardStep = "input" | "generation" | "review" | "export";

export default function ScriptWizard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [currentStep, setCurrentStep] = useState<WizardStep>("input");
  const [script, setScript] = useState<Script | null>(null);
  const [iterations, setIterations] = useState<ScriptIteration[]>([]);
  const [currentIteration, setCurrentIteration] = useState<number>(0);
  const [generationComplete, setGenerationComplete] = useState<boolean>(false);
  
  // Create script mutation
  const createScriptMutation = useMutation({
    mutationFn: async (scriptData: CreateScriptInput) => {
      const res = await apiRequest("POST", "/api/scripts", {
        ...scriptData,
        createdAt: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: (newScript: Script) => {
      setScript(newScript);
      // Immediately start generation after creating script
      generateScriptMutation.mutate(newScript.id);
      setCurrentStep("generation");
      
      toast({
        title: "Script created",
        description: "Your script has been created and generation has started.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating script",
        description: "There was an error creating your script. Please try again.",
        variant: "destructive",
      });
      console.error("Create script error:", error);
    },
  });
  
  // Generate initial script mutation
  const generateScriptMutation = useMutation({
    mutationFn: async (scriptId: number) => {
      const res = await apiRequest("POST", `/api/scripts/${scriptId}/generate`, {});
      return res.json();
    },
    onSuccess: (data) => {
      // Add the first iteration
      if (data.iteration) {
        setIterations([data.iteration]);
        setCurrentIteration(1);
        
        // If script exists, update it
        if (script) {
          setScript({
            ...script,
            currentIteration: 1,
            status: "in_progress",
          });
        }
      }
      
      toast({
        title: "Initial script generated",
        description: "First script draft created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: "Failed to generate the initial script. Please try again.",
        variant: "destructive",
      });
      console.error("Generate script error:", error);
    },
  });
  
  // Improve script mutation (next iteration)
  const improveScriptMutation = useMutation({
    mutationFn: async (scriptId: number) => {
      const res = await apiRequest("POST", `/api/scripts/${scriptId}/improve`, {});
      return res.json();
    },
    onSuccess: (data) => {
      // Add the new iteration
      if (data.iteration) {
        setIterations(prev => [...prev, data.iteration]);
        setCurrentIteration(data.iteration.iterationNumber);
        
        // If script exists, update it
        if (script) {
          setScript({
            ...script,
            currentIteration: data.iteration.iterationNumber,
            status: data.isComplete ? "completed" : "in_progress",
          });
        }
        
        // Check if generation is complete
        if (data.isComplete) {
          setGenerationComplete(true);
        }
      }
      
      toast({
        title: "Script improved",
        description: `Iteration ${data.iteration.iterationNumber} completed successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Improvement failed",
        description: "Failed to generate the next iteration. Please try again.",
        variant: "destructive",
      });
      console.error("Improve script error:", error);
    },
  });
  
  // Update iteration mutation (after manual edits)
  const updateIterationMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      const res = await apiRequest("PATCH", `/api/iterations/${id}`, { content });
      return res.json();
    },
    onSuccess: (updatedIteration) => {
      // Update the iteration in the local state
      setIterations(prev => 
        prev.map(iter => 
          iter.id === updatedIteration.id ? updatedIteration : iter
        )
      );
      
      toast({
        title: "Script updated",
        description: "Your edits have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Failed to save your edits. Please try again.",
        variant: "destructive",
      });
      console.error("Update iteration error:", error);
    },
  });
  
  // Export script mutation
  const exportScriptMutation = useMutation({
    mutationFn: async ({
      scriptId,
      options,
    }: {
      scriptId: number;
      options: ExportOptions;
    }) => {
      const res = await apiRequest("POST", `/api/scripts/${scriptId}/export`, {
        format: options.format,
        options: {
          includeTimestamps: options.includeTimestamps,
          formatSections: options.formatSections,
          includeMetadata: options.includeMetadata,
          addCameraNotes: options.addCameraNotes,
          fileName: options.fileName,
          googleAccount: options.googleAccount,
        },
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Script exported",
        description: `Your script has been exported as ${data.format}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Export failed",
        description: "Failed to export your script. Please try again.",
        variant: "destructive",
      });
      console.error("Export script error:", error);
    },
  });
  
  // Continue to next iteration handler
  const handleNextIteration = () => {
    if (script) {
      improveScriptMutation.mutate(script.id);
    }
  };
  
  // Step navigation handlers
  const handleGoToGeneration = (scriptData: CreateScriptInput) => {
    createScriptMutation.mutate(scriptData);
  };
  
  const handleGoToReview = () => {
    setCurrentStep("review");
  };
  
  const handleGoToExport = () => {
    setCurrentStep("export");
  };
  
  const handleRequestAnotherIteration = () => {
    if (script && script.currentIteration < script.totalIterations) {
      setCurrentStep("generation");
      handleNextIteration();
    } else {
      toast({
        title: "Maximum iterations reached",
        description: "You've reached the maximum number of iterations.",
      });
    }
  };
  
  // Handle manual script update
  const handleUpdateScript = (iterationId: number, content: string) => {
    updateIterationMutation.mutate({ id: iterationId, content });
  };
  
  // Export script handler
  const handleExportScript = (options: ExportOptions) => {
    if (script) {
      exportScriptMutation.mutate({
        scriptId: script.id,
        options,
      });
    }
  };
  
  // Get the current active iteration
  const activeIteration = iterations.find(
    (iteration) => iteration.iterationNumber === currentIteration
  );
  
  // Determine if continue buttons should be enabled
  const isGenerating = 
    generateScriptMutation.isPending || 
    improveScriptMutation.isPending;
  
  const canContinueToReview = 
    !isGenerating && 
    iterations.length > 0 && 
    (generationComplete || script?.currentIteration === script?.totalIterations);
  
  // Render the appropriate step
  return (
    <div className="mx-auto">
      <WizardProgress currentStep={currentStep} />
      
      <div className="card mt-8 overflow-hidden rounded-lg border bg-white shadow">
        {currentStep === "input" && (
          <InputStep onSubmit={handleGoToGeneration} />
        )}
        
        {currentStep === "generation" && (
          <GenerationStep
            script={script}
            iterations={iterations}
            isGenerating={isGenerating}
            onRequestNextIteration={handleNextIteration}
            onContinueToReview={handleGoToReview}
            canContinueToReview={canContinueToReview}
          />
        )}
        
        {currentStep === "review" && (
          <ReviewStep
            script={script}
            iterations={iterations}
            currentIterationNumber={currentIteration}
            onSelectIteration={setCurrentIteration}
            onUpdateScript={handleUpdateScript}
            onRequestAnotherIteration={handleRequestAnotherIteration}
            onContinueToExport={handleGoToExport}
            isUpdating={updateIterationMutation.isPending}
          />
        )}
        
        {currentStep === "export" && (
          <ExportStep
            script={script}
            iterations={iterations}
            onExport={handleExportScript}
            onBackToReview={() => setCurrentStep("review")}
            isExporting={exportScriptMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}
