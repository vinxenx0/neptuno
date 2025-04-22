
import React, { useState } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Resource {
  title: string;
  url: string;
}

interface HelpBubbleProps {
  resources: Resource[];
}

export const HelpBubble = ({ resources }: HelpBubbleProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleTooltip = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <TooltipProvider>
        <Tooltip open={isOpen} onOpenChange={setIsOpen}>
          <TooltipTrigger asChild onClick={toggleTooltip}>
            <Button 
              size="icon" 
              className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-accent shadow-md hover:shadow-lg transition-all"
            >
              <HelpCircle className="h-6 w-6 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent 
            side="right" 
            align="start" 
            className="w-72 p-4 bg-white rounded-lg shadow-xl border-0"
          >
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Help Resources</h3>
              <ul className="space-y-2">
                {resources.map((resource, i) => (
                  <li key={i}>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span className="mr-1.5">•</span> {resource.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
