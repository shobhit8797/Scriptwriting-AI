import { ScriptIteration, ScriptLength } from "@/types/script";

// Estimate script reading time in minutes
export function estimateReadingTime(content: string): number {
  // Average speaking rate is ~150 words per minute for scripted content
  const words = content.split(/\s+/).length;
  const minutes = words / 150;
  return Math.max(1, Math.round(minutes));
}

// Format a timestamp from seconds to MM:SS format
export function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Get average length in minutes based on script length selection
export function getAverageLength(length: ScriptLength): number {
  switch (length) {
    case 'short':
      return 4; // 3-5 minutes
    case 'medium':
      return 10; // 8-12 minutes
    case 'long':
      return 18; // 15+ minutes
    default:
      return 10;
  }
}

// Analyze iterations to find improvements between versions
export function analyzeImprovements(
  iterations: ScriptIteration[]
): { iterationNumber: number; improvements: string }[] {
  return iterations
    .filter(iteration => iteration.improvements)
    .map(iteration => ({
      iterationNumber: iteration.iterationNumber,
      improvements: iteration.improvements || "No specific improvements listed."
    }));
}

// Check if a script has redundant content
export function detectRedundancy(content: string): boolean {
  const paragraphs = content.split('\n\n');
  
  // Look for repeated phrases across paragraphs
  const phrases: Set<string> = new Set();
  const significantPhrases = paragraphs.flatMap(para => {
    // Extract phrases of 5+ words
    const words = para.split(/\s+/);
    const result: string[] = [];
    
    for (let i = 0; i <= words.length - 5; i++) {
      const phrase = words.slice(i, i + 5).join(' ').toLowerCase();
      if (phrase.length >= 20) { // Only check substantial phrases
        result.push(phrase);
      }
    }
    
    return result;
  });
  
  // Check for repeated significant phrases
  for (const phrase of significantPhrases) {
    if (phrases.has(phrase)) {
      return true; // Redundancy detected
    }
    phrases.add(phrase);
  }
  
  return false;
}

// Extract sections from script content
export function extractSections(content: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const lines = content.split('\n');
  
  let currentSection: { title: string; content: string } | null = null;
  
  for (const line of lines) {
    // Check for section headers (all caps with optional timestamps)
    const sectionMatch = line.match(/^([A-Z][A-Z\s\d]+:?)(\s+\[\d+:\d+\s*-\s*\d+:\d+\])?$/);
    
    if (sectionMatch) {
      // If we have a current section, save it
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Start a new section
      currentSection = {
        title: sectionMatch[1].trim(),
        content: ''
      };
    } else if (currentSection) {
      // Add content to current section
      if (currentSection.content) {
        currentSection.content += '\n' + line;
      } else {
        currentSection.content = line;
      }
    } else if (line.trim()) {
      // Content before any section (intro)
      currentSection = {
        title: 'INTRO',
        content: line
      };
    }
  }
  
  // Add the last section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}

// Generate mockup document preview content
export function generatePreviewContent(title: string, content: string, includeMeta: boolean): string {
  const readingTime = estimateReadingTime(content);
  const firstSection = content.split('\n\n')[0]?.substring(0, 150) + '...';
  
  return `${title}
${includeMeta ? `Script Length: ${readingTime} minutes | Created: ${new Date().toLocaleDateString()}` : ''}

${firstSection}`;
}
