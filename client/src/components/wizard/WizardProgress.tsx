import { Check } from "lucide-react";

interface WizardProgressProps {
  currentStep: "input" | "generation" | "review" | "export";
}

export default function WizardProgress({ currentStep }: WizardProgressProps) {
  // Define step order for indexing
  const steps = ["input", "generation", "review", "export"];
  const currentIndex = steps.indexOf(currentStep);
  
  return (
    <div className="mb-8">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-between">
          {/* Input Step */}
          <div 
            className="flex items-center" 
            aria-current={currentStep === "input" ? "step" : undefined}
          >
            <div 
              className={`flex h-8 w-8 items-center justify-center rounded-full
                ${currentIndex >= 0 
                  ? "bg-primary text-primary-foreground" 
                  : "border-2 border-gray-300 bg-white text-gray-500"
                }`}
            >
              {currentIndex > 0 ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm font-semibold">1</span>
              )}
            </div>
            <span 
              className={`ml-2 text-sm font-medium
                ${currentIndex >= 0 ? "text-gray-900" : "text-gray-500"}
              `}
            >
              Input
            </span>
          </div>
          
          {/* Generation Step */}
          <div 
            className="flex items-center" 
            aria-current={currentStep === "generation" ? "step" : undefined}
          >
            <div 
              className={`flex h-8 w-8 items-center justify-center rounded-full
                ${currentIndex > 0 
                  ? "bg-primary text-primary-foreground" 
                  : currentIndex === 0 
                    ? "border-2 border-primary bg-white text-primary" 
                    : "border-2 border-gray-300 bg-white text-gray-500"
                }`}
            >
              {currentIndex > 1 ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm font-semibold">2</span>
              )}
            </div>
            <span 
              className={`ml-2 text-sm font-medium
                ${currentIndex >= 1 
                  ? "text-gray-900" 
                  : currentIndex === 0 
                    ? "text-gray-900" 
                    : "text-gray-500"
                }
              `}
            >
              Generation
            </span>
          </div>
          
          {/* Review Step */}
          <div 
            className="flex items-center" 
            aria-current={currentStep === "review" ? "step" : undefined}
          >
            <div 
              className={`flex h-8 w-8 items-center justify-center rounded-full
                ${currentIndex > 1 
                  ? "bg-primary text-primary-foreground" 
                  : currentIndex === 1 
                    ? "border-2 border-primary bg-white text-primary" 
                    : "border-2 border-gray-300 bg-white text-gray-500"
                }`}
            >
              {currentIndex > 2 ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm font-semibold">3</span>
              )}
            </div>
            <span 
              className={`ml-2 text-sm font-medium
                ${currentIndex >= 2 
                  ? "text-gray-900" 
                  : currentIndex === 1 
                    ? "text-gray-900" 
                    : "text-gray-500"
                }
              `}
            >
              Review
            </span>
          </div>
          
          {/* Export Step */}
          <div 
            className="flex items-center" 
            aria-current={currentStep === "export" ? "step" : undefined}
          >
            <div 
              className={`flex h-8 w-8 items-center justify-center rounded-full
                ${currentIndex > 2 
                  ? "bg-primary text-primary-foreground" 
                  : currentIndex === 2 
                    ? "border-2 border-primary bg-white text-primary" 
                    : "border-2 border-gray-300 bg-white text-gray-500"
                }`}
            >
              <span className="text-sm font-semibold">4</span>
            </div>
            <span 
              className={`ml-2 text-sm font-medium
                ${currentIndex >= 3 
                  ? "text-gray-900" 
                  : currentIndex === 2 
                    ? "text-gray-900" 
                    : "text-gray-500"
                }
              `}
            >
              Export
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
