import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronRight } from 'lucide-react';

import { CreateScriptInput, createScriptSchema, ScriptSettings } from '@shared/schema';
import { ScriptTone, AIModel } from '@/types/scriptTypes';

interface InputStepProps {
  onSubmit: (data: CreateScriptInput) => void;
  isLoading: boolean;
}

export default function InputStep({ onSubmit, isLoading }: InputStepProps) {
  // Define tone options
  const toneOptions: { value: ScriptTone; label: string }[] = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'educational', label: 'Educational' },
    { value: 'entertaining', label: 'Entertaining' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'inspirational', label: 'Inspirational' },
  ];

  // Setup form
  const form = useForm<CreateScriptInput>({
    resolver: zodResolver(createScriptSchema),
    defaultValues: {
      title: '',
      instructions: '',
      structure: '',
      aiModel: 'gpt-4',
      tone: 'conversational',
      length: 2,
      iterations: 3,
      settings: {
        reduceRedundancy: true,
        enhanceClarity: true,
        improveEngagement: true,
      },
    },
  });

  // Get selected tone from form
  const selectedTone = form.watch('tone');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Configure Your Script</h2>
        <p className="text-sm text-muted-foreground">Set up your initial script requirements and AI preferences.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Input Column */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Script Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter a title for your script" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="h-40" 
                        placeholder="Provide detailed instructions for your script. The more specific you are, the better the results will be."
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="structure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Script Structure</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="h-32" 
                        placeholder="Define the structure of your script (intro, main points, conclusion, etc.)"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            {/* Configuration Column */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="aiModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Model</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select AI model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4 (Most powerful, slower)</SelectItem>
                        <SelectItem value="gpt-3.5">GPT-3.5 (Balanced)</SelectItem>
                        <SelectItem value="claude">Claude (Creative, narrative-focused)</SelectItem>
                        <SelectItem value="grok">Grok (Fast, concise)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel>Script Tone</FormLabel>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {toneOptions.map((option) => (
                    <Button 
                      key={option.value}
                      type="button"
                      variant={selectedTone === option.value ? "default" : "outline"}
                      onClick={() => form.setValue('tone', option.value)}
                      className="justify-center"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </FormItem>
              
              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Script Length</FormLabel>
                    <div className="space-y-4 mt-2">
                      <div className="flex justify-between">
                        <span className="text-xs">Short (~3 min)</span>
                        <span className="text-xs">Medium (~7 min)</span>
                        <span className="text-xs">Long (~12 min)</span>
                      </div>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          min={1}
                          max={3}
                          step={1}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="iterations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Iterations</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(val) => field.onChange(parseInt(val))}
                        defaultValue={field.value.toString()}
                        className="grid grid-cols-3 gap-2 mt-2"
                      >
                        <div className="flex items-center">
                          <RadioGroupItem value="2" id="iterations-2" />
                          <label htmlFor="iterations-2" className="ml-2 text-sm">2</label>
                        </div>
                        <div className="flex items-center">
                          <RadioGroupItem value="3" id="iterations-3" />
                          <label htmlFor="iterations-3" className="ml-2 text-sm">3</label>
                        </div>
                        <div className="flex items-center">
                          <RadioGroupItem value="4" id="iterations-4" />
                          <label htmlFor="iterations-4" className="ml-2 text-sm">4</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel>Advanced Options</FormLabel>
                <div className="space-y-2 mt-2">
                  <FormField
                    control={form.control}
                    name="settings.reduceRedundancy"
                    render={({ field }) => (
                      <div className="flex items-center">
                        <Checkbox 
                          id="reduce-redundancy" 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label htmlFor="reduce-redundancy" className="ml-2 text-sm">
                          Reduce redundancy between iterations
                        </label>
                      </div>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="settings.enhanceClarity"
                    render={({ field }) => (
                      <div className="flex items-center">
                        <Checkbox 
                          id="enhance-clarity" 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label htmlFor="enhance-clarity" className="ml-2 text-sm">
                          Enhance clarity and coherence
                        </label>
                      </div>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="settings.improveEngagement"
                    render={({ field }) => (
                      <div className="flex items-center">
                        <Checkbox 
                          id="improve-engagement" 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label htmlFor="improve-engagement" className="ml-2 text-sm">
                          Improve engagement and flow
                        </label>
                      </div>
                    )}
                  />
                </div>
              </FormItem>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Start Generation'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
