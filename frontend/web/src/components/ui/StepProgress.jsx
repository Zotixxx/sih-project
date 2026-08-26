import React from "react";
import { cn } from "@/lib/utils";

export default function StepProgress({ steps, currentStep, onStepClick }) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={step.id || idx}
              onClick={() => onStepClick && isCompleted && onStepClick(stepNumber)}
              className={cn(
                "relative z-10 flex flex-col items-center group",
                isCompleted && onStepClick && "cursor-pointer"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border-2 bg-white",
                  isCompleted
                    ? "bg-slate-900 border-slate-900 text-white"
                    : isCurrent
                    ? "border-slate-900 text-slate-900 ring-4 ring-slate-100"
                    : "border-slate-300 text-slate-400"
                )}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-[18px]">check</span>
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-semibold tracking-wide whitespace-nowrap text-center",
                  isCurrent
                    ? "text-slate-900"
                    : isCompleted
                    ? "text-slate-700"
                    : "text-slate-400"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
