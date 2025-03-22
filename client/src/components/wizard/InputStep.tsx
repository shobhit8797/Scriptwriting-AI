import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AIModel, 
  ScriptLength, 
  ScriptTone, 
  ScriptStyle, 
  ScriptStructure,
  DEFAULT_SCRIPT_STRUCTURE,
  CreateScriptInput
} from "@/types/script";

// Validation schema for the form
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  model: z.enum(["gpt-4o", "claude-3-7-sonnet-20250219", "grok"]),
  length: z.enum(["short", "medium", "long"]),
  tone: z.enum(["informative", "casual", "professional", "enthusiastic"]),
  style: z.enum(["tutorial", "review", "storytelling", "explanatory"]),
  structure: z.object({
    introduction: z.boolean().default(true),
    hook: z.boolean().default(true),
    mainPoints: z.boolean().default(true),
    examples: z.boolean().default(true),
    conclusion: z.boolean().default(true),
    callToAction: z.boolean().default(true),
  }),
});

interface InputStepProps {
  onSubmit: (data: CreateScriptInput) => void;
}

export default function InputStep({ onSubmit }: InputStepProps) {
  const [structure, setStructure] = useState<ScriptStructure>(DEFAULT_SCRIPT_STRUCTURE);
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      model: "gpt-4o",
      length: "medium",
      tone: "informative",
      style: "explanatory",
      structure,
    },
  });
  
  // Handler for structure checkboxes
  const handleStructureChange = (key: keyof ScriptStructure, checked: boolean) => {
    const updatedStructure = { ...structure, [key]: checked };
    setStructure(updatedStructure);
    form.setValue("structure", updatedStructure);
  };
  
  // Handle form submission
  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Script Details</h2>
        <p className="text-sm text-muted-foreground">
          Provide instructions and parameters for your YouTube script
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Script Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter title for your YouTube video"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description & Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what you want in your script, including key points to cover"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="model"
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
                        <SelectItem value="gpt-4o">ChatGPT (GPT-4)</SelectItem>
                        <SelectItem value="claude-3-7-sonnet-20250219">Claude</SelectItem>
                        <SelectItem value="grok">Grok</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Script Length</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="short">Short (3-5 minutes)</SelectItem>
                        <SelectItem value="medium">Medium (8-12 minutes)</SelectItem>
                        <SelectItem value="long">Long (15+ minutes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tone</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="informative">Informative/Educational</SelectItem>
                        <SelectItem value="casual">Casual/Conversational</SelectItem>
                        <SelectItem value="professional">Professional/Formal</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic/Energetic</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tutorial">Tutorial/How-to</SelectItem>
                        <SelectItem value="review">Review/Analysis</SelectItem>
                        <SelectItem value="storytelling">Storytelling</SelectItem>
                        <SelectItem value="explanatory">Explanatory</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel>Script Structure</FormLabel>
              <div className="space-y-2 mt-1.5">
                <div className="flex items-center">
                  <Checkbox 
                    id="intro" 
                    checked={structure.introduction}
                    onCheckedChange={(checked) => 
                      handleStructureChange("introduction", !!checked)
                    }
                  />
                  <label htmlFor="intro" className="ml-2 text-sm">
                    Introduction
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="hook" 
                    checked={structure.hook}
                    onCheckedChange={(checked) => 
                      handleStructureChange("hook", !!checked)
                    }
                  />
                  <label htmlFor="hook" className="ml-2 text-sm">
                    Hook/Attention Grabber
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="main-points" 
                    checked={structure.mainPoints}
                    onCheckedChange={(checked) => 
                      handleStructureChange("mainPoints", !!checked)
                    }
                  />
                  <label htmlFor="main-points" className="ml-2 text-sm">
                    Main Content Points
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="examples" 
                    checked={structure.examples}
                    onCheckedChange={(checked) => 
                      handleStructureChange("examples", !!checked)
                    }
                  />
                  <label htmlFor="examples" className="ml-2 text-sm">
                    Examples/Case Studies
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="conclusion" 
                    checked={structure.conclusion}
                    onCheckedChange={(checked) => 
                      handleStructureChange("conclusion", !!checked)
                    }
                  />
                  <label htmlFor="conclusion" className="ml-2 text-sm">
                    Conclusion
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="cta" 
                    checked={structure.callToAction}
                    onCheckedChange={(checked) => 
                      handleStructureChange("callToAction", !!checked)
                    }
                  />
                  <label htmlFor="cta" className="ml-2 text-sm">
                    Call to Action
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <Button variant="outline" type="button">
              Save Draft
            </Button>
            <Button type="submit">Generate Script</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
