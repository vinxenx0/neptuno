
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="relative">
        <div className="overflow-hidden h-2 mb-6 text-xs flex rounded-full bg-slate-100">
          <div
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-400 to-accent transition-all duration-500 ease-in-out rounded-full"
          />
        </div>
        <div className="flex justify-between">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium border-2 transition-all duration-300",
                i < currentStep
                  ? "bg-blue-50 border-accent text-accent"
                  : i === currentStep - 1
                  ? "bg-gradient-to-r from-blue-400 to-accent text-white border-transparent shadow-md"
                  : "bg-white border-slate-200 text-slate-400"
              )}
            >
              {i < currentStep ? (
                <CheckIcon className="h-5 w-5" />
              ) : (
                <span>{i + 1}</span>
              )}
              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-slate-500 whitespace-nowrap">
                {i === 0 ? "Project" : 
                 i === 1 ? "Environment" : 
                 i === 2 ? "Server" : 
                 i === 3 ? "Auth" : 
                 i === 4 ? "Redis" : "Frontend"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
