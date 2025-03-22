import { useState } from "react";
import ScriptWizard from "@/components/ScriptWizard";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Create YouTube Script</h1>
        <p className="text-sm text-muted-foreground">
          AI-powered script generation with multiple iterations for quality improvement
        </p>
      </div>
      
      <ScriptWizard />
    </div>
  );
}
