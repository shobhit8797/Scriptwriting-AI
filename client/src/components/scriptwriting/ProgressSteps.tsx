import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressSteps({ currentStep, totalSteps }: ProgressStepsProps) {
  const steps = [
    { number: 1, label: 'Input' },
    { number: 2, label: 'Generate' },
    { number: 3, label: 'Review' },
    { number: 4, label: 'Export' },
  ];

  // Calculate progress percentage
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="relative flex justify-between w-full mb-8">
      {/* Background line */}
      <div className="absolute top-4 h-[2px] bg-muted left-0 right-0 -z-10"></div>
      
      {/* Active progress line */}
      <div 
        className="absolute top-4 h-[2px] bg-primary left-0 -z-10 transition-all duration-300"
        style={{ width: `${progressPercentage}%` }}
      ></div>
      
      {/* Step indicators */}
      {steps.map((step) => (
        <div key={step.number} className="flex flex-col items-center">
          <div 
            className={cn(
              "flex items-center justify-center rounded-full h-8 w-8 text-sm font-medium",
              step.number < currentStep ? "bg-green-600 text-white" : // completed
              step.number === currentStep ? "bg-primary text-primary-foreground" : // active
              "bg-secondary text-secondary-foreground" // inactive
            )}
          >
            {step.number}
          </div>
          <span className="text-xs mt-2 font-medium">{step.label}</span>
        </div>
      ))}
    </div>
  );
}
