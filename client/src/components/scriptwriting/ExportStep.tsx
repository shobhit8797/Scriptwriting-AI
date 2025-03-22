import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Download } from 'lucide-react';
import { Script, ScriptIteration, ExportSettings } from '@shared/schema';
import { exportFormSchema, ExportFormValues } from '@/types/scriptTypes';

interface ExportStepProps {
  script?: Script;
  iterations: ScriptIteration[];
  onBack: () => void;
  onExport: (settings: ExportSettings) => void;
  isLoading: boolean;
}

export default function ExportStep({
  script,
  iterations,
  onBack,
  onExport,
  isLoading
}: ExportStepProps) {
  const form = useForm<ExportFormValues>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      format: 'google_docs',
      includeMetadata: true,
      includeTimestamps: true,
      includeSections: true,
      formatForTalent: false,
      enableSharing: true,
      sendEmail: false,
      email: '',
    },
  });

  const showEmailField = form.watch('sendEmail');

  const handleSubmit = (data: ExportFormValues) => {
    onExport(data);
  };

  // Find the latest completed iteration to show in preview
  const latestCompletedIteration = iterations
    .filter(it => it.status === 'completed')
    .sort((a, b) => b.iterationNumber - a.iterationNumber)[0];

  if (!script) {
    return <div>No script available for export.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Export Your Script</h2>
        <p className="text-sm text-muted-foreground">Save your finalized script in your preferred format.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Options */}
            <div className="space-y-6">
              {/* Format Selection */}
              <div className="card p-4 border rounded-lg">
                <h3 className="font-medium text-sm mb-3">Export Format</h3>
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-3"
                        >
                          <div className="flex items-center">
                            <RadioGroupItem value="google_docs" id="format-google-docs" />
                            <label htmlFor="format-google-docs" className="ml-2 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4285F4" className="w-5 h-5 mr-2">
                                <path d="M14 2H6C4.9 2 4 2.9 4.01 4L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm1.04 17H7.03c-.55 0-1-.45-1-1s.45-1 1-1h8.01c.55 0 1 .45 1 1s-.45 1-1 1zM16 14H7.03c-.55 0-1-.45-1-1s.45-1 1-1H16c.55 0 1 .45 1 1s-.45 1-1 1zM16 10H7.03c-.55 0-1-.45-1-1s.45-1 1-1H16c.55 0 1 .45 1 1s-.45 1-1 1z" />
                              </svg>
                              Google Docs
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Recommended</span>
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <RadioGroupItem value="word" id="format-word" />
                            <label htmlFor="format-word" className="ml-2 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2B579A" className="w-5 h-5 mr-2">
                                <path d="M21.17 3.25q.33 0 .59.25.24.25.24.58v15.84q0 .33-.24.58-.26.25-.59.25H7.83q-.33 0-.59-.25-.24-.25-.24-.58V14.5H2.83q-.33 0-.59-.24-.24-.25-.24-.58V9.33q0-.33.24-.59.26-.24.59-.24H7V4.08q0-.33.24-.58.26-.25.59-.25h13.34M14.67 14.17l2.5-7.67h2.33l-3.66 10.5h-2.34l-3.66-10.5H12.17l2.5 7.67Z" />
                              </svg>
                              Microsoft Word
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <RadioGroupItem value="text" id="format-txt" />
                            <label htmlFor="format-txt" className="ml-2 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-gray-600">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 8V3l5 5h-5zm0 5.5v-2h4v2h-4zm0 4.5v-2h4v2h-4z" />
                              </svg>
                              Plain Text
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <RadioGroupItem value="markdown" id="format-markdown" />
                            <label htmlFor="format-markdown" className="ml-2 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-gray-600">
                                <path d="M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6h17.12c.79 0 1.44.63 1.44 1.41v9.18c0 .78-.65 1.41-1.44 1.41M6.81 15.19v-3.66l1.92 2.35 1.92-2.35v3.66h1.93V8.81h-1.93l-1.92 2.35-1.92-2.35H4.89v6.38h1.92M19.69 12h-1.92V8.81h-1.92V12h-1.93l2.89 3.28L19.69 12Z" />
                              </svg>
                              Markdown
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Export Options */}
              <div className="card p-4 border rounded-lg">
                <h3 className="font-medium text-sm mb-3">Export Options</h3>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="includeMetadata"
                    render={({ field }) => (
                      <div className="flex items-center">
                        <Checkbox 
                          id="include-metadata" 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label htmlFor="include-metadata" className="ml-2 text-sm">
                          Include metadata (date, AI model, etc.)
                        </label>
                      </div>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="includeTimestamps"
                    render={({ field }) => (
                      <div className="flex items-center">
                        <Checkbox 
                          id="include-timestamps" 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label htmlFor="include-timestamps" className="ml-2 text-sm">
                          Include estimated timestamps
                        </label>
                      </div>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="includeSections"
                    render={({ field }) => (
                      <div className="flex items-center">
                        <Checkbox 
                          id="include-sections" 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label htmlFor="include-sections" className="ml-2 text-sm">
                          Use section headers
                        </label>
                      </div>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="formatForTalent"
                    render={({ field }) => (
                      <div className="flex items-center">
                        <Checkbox 
                          id="format-for-talent" 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label htmlFor="format-for-talent" className="ml-2 text-sm">
                          Format for voice talent (add pauses, emphasis)
                        </label>
                      </div>
                    )}
                  />
                </div>
              </div>
              
              {/* Sharing Options */}
              <div className="card p-4 border rounded-lg">
                <h3 className="font-medium text-sm mb-3">Sharing Options</h3>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="enableSharing"
                    render={({ field }) => (
                      <div className="flex items-center">
                        <Checkbox 
                          id="enable-sharing" 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label htmlFor="enable-sharing" className="ml-2 text-sm">
                          Generate shareable link
                        </label>
                      </div>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sendEmail"
                    render={({ field }) => (
                      <div className="flex items-center">
                        <Checkbox 
                          id="send-email" 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label htmlFor="send-email" className="ml-2 text-sm">
                          Send to my email
                        </label>
                      </div>
                    )}
                  />
                  
                  {showEmailField && (
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="mt-2">
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="Enter your email"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Script Preview */}
            <div className="card p-4 border rounded-lg h-[500px] overflow-auto">
              <div className="mb-2 flex justify-between items-center">
                <h3 className="font-medium text-sm">Preview</h3>
                <span className="text-xs text-muted-foreground">
                  Last Updated: {latestCompletedIteration ? new Date(latestCompletedIteration.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              {latestCompletedIteration ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center mb-4">
                    <h4 className="font-bold">{script.title}</h4>
                    <p className="text-sm text-muted-foreground">Format: {form.getValues().format.replace('_', ' ')}</p>
                    <p className="text-xs mt-2">
                      {latestCompletedIteration.metrics?.wordCount || 0} words | 
                      {latestCompletedIteration.metrics?.estimatedDuration 
                        ? ` ${Math.round(Number(latestCompletedIteration.metrics.estimatedDuration) / 60)} mins` 
                        : ' Unknown duration'}
                    </p>
                  </div>
                  <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
                    <p className="text-muted-foreground text-center px-4">
                      Preview will be generated when you export the document.<br />
                      Click "Export Script" below to download your script.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No completed script available for preview.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between pt-4 border-t">
            <Button type="button" variant="outline" onClick={onBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Review
            </Button>
            <Button type="submit" disabled={isLoading || !latestCompletedIteration}>
              <Download className="mr-2 h-4 w-4" />
              {isLoading ? 'Exporting...' : 'Export Script'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
