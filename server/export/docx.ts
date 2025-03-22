import { ExportSettings } from "@shared/schema";

// Function to convert script content to HTML format for document export
export function scriptToHtml(
  script: string,
  title: string,
  settings: ExportSettings,
  metadata?: Record<string, any>
): string {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .metadata { color: #666; font-size: 12px; margin-bottom: 20px; }
    .script { font-family: 'Courier New', monospace; line-height: 1.5; white-space: pre-wrap; }
    .timestamp { color: #0066cc; font-weight: bold; }
    .section { font-weight: bold; margin-top: 20px; }
    .talent-note { color: #cc6600; font-style: italic; }
  </style>
</head>
<body>
  <h1>${title}</h1>`;

  // Add metadata if needed
  if (settings.includeMetadata && metadata) {
    html += `<div class="metadata">`;
    for (const [key, value] of Object.entries(metadata)) {
      html += `<div><strong>${key}</strong>: ${value}</div>`;
    }
    html += `</div>`;
  }

  // Format the script content
  let formattedScript = script;

  // Process sections if needed
  if (settings.includeSections) {
    // Keep section headers as is
  } else {
    // Remove section markers (assuming sections are marked with ## in markdown-like format)
    formattedScript = formattedScript.replace(/^##\s.*$/gm, '');
  }

  // Process timestamps if needed
  if (settings.includeTimestamps) {
    // Wrap timestamps in spans (assuming timestamps are in format like (0:00-1:00))
    formattedScript = formattedScript.replace(/\(\d+:\d+(?:-\d+:\d+)?\)/g, match => 
      `<span class="timestamp">${match}</span>`);
  } else {
    // Remove timestamps
    formattedScript = formattedScript.replace(/\(\d+:\d+(?:-\d+:\d+)?\)/g, '');
  }

  // Format for talent if needed
  if (settings.formatForTalent) {
    // Add emphasis and pause markers
    formattedScript = formattedScript
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
      .replace(/\[pause\]/gi, '<span class="talent-note">[PAUSE]</span>')
      .replace(/\[emphasis\]/gi, '<span class="talent-note">[EMPHASIS]</span>');
  }

  // Add the formatted script to the HTML
  html += `<div class="script">${formattedScript}</div>
</body>
</html>`;

  return html;
}

// Function to convert script to plain text format
export function scriptToText(
  script: string,
  title: string,
  settings: ExportSettings,
  metadata?: Record<string, any>
): string {
  let text = `${title}\n`;
  text += "=".repeat(title.length) + "\n\n";

  // Add metadata if needed
  if (settings.includeMetadata && metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      text += `${key}: ${value}\n`;
    }
    text += "\n";
  }

  // Format the script content
  let formattedScript = script;

  // Process sections if needed
  if (!settings.includeSections) {
    // Remove section markers
    formattedScript = formattedScript.replace(/^##\s.*$/gm, '');
  }

  // Process timestamps if needed
  if (!settings.includeTimestamps) {
    // Remove timestamps
    formattedScript = formattedScript.replace(/\(\d+:\d+(?:-\d+:\d+)?\)/g, '');
  }

  // Add the formatted script to the text
  text += formattedScript;

  return text;
}

// Function to convert script to markdown format
export function scriptToMarkdown(
  script: string,
  title: string,
  settings: ExportSettings,
  metadata?: Record<string, any>
): string {
  let markdown = `# ${title}\n\n`;

  // Add metadata if needed
  if (settings.includeMetadata && metadata) {
    markdown += "## Metadata\n\n";
    for (const [key, value] of Object.entries(metadata)) {
      markdown += `**${key}**: ${value}\n`;
    }
    markdown += "\n";
  }

  // Format the script content
  let formattedScript = script;

  // Process sections if needed
  if (!settings.includeSections && formattedScript.includes("##")) {
    // Convert section markers to plain text if they should be kept but not as markdown headers
    formattedScript = formattedScript.replace(/^##\s(.*?)$/gm, '**$1**');
  }

  // Process timestamps if needed
  if (!settings.includeTimestamps) {
    // Remove timestamps
    formattedScript = formattedScript.replace(/\(\d+:\d+(?:-\d+:\d+)?\)/g, '');
  }

  // Add the formatted script to the markdown
  markdown += formattedScript;

  return markdown;
}

// Main export function to generate document content based on format
export function exportScript(
  script: string,
  title: string,
  format: string,
  settings: ExportSettings,
  metadata?: Record<string, any>
): string {
  switch (format) {
    case 'google_docs':
    case 'word':
      return scriptToHtml(script, title, settings, metadata);
    case 'text':
      return scriptToText(script, title, settings, metadata);
    case 'markdown':
      return scriptToMarkdown(script, title, settings, metadata);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}
