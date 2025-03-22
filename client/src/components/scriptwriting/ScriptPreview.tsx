import React from 'react';

interface ScriptPreviewProps {
  content: string;
}

export default function ScriptPreview({ content }: ScriptPreviewProps) {
  return (
    <div className="script-preview text-sm leading-relaxed">
      {content}
    </div>
  );
}
