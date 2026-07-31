"use client";

import React from "react";
import { SeoCategoryResult } from "@/types/seo";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface CategoryCardProps {
  category: SeoCategoryResult;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  icon,
  isSelected,
  onClick,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 bg-emerald-500";
    if (score >= 60) return "text-amber-600 bg-amber-500";
    return "text-red-600 bg-red-500";
  };

  return (
    <div
      onClick={onClick}
      className={`liquid-glass-card rounded-2xl p-5 cursor-pointer transition-all border ${
        isSelected
          ? "border-blue-500/80 shadow-md ring-2 ring-blue-500/20 bg-white/95"
          : "border-slate-200/80 hover:border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">{icon}</div>
          <h3 className="font-semibold text-slate-900 text-sm">{category.name}</h3>
        </div>

        <div className="flex items-baseline gap-1">
          <span className={`text-xl font-bold font-mono ${getScoreColor(category.score).split(" ")[0]}`}>
            {category.score}
          </span>
          <span className="text-xs text-slate-400 font-mono">/100</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getScoreColor(category.score).split(" ")[1]}`}
          style={{ width: `${category.score}%` }}
        />
      </div>

      {/* Issue counts */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>{category.passedCount} Passed</span>
        </div>
        {category.warningCount > 0 && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>{category.warningCount} Warnings</span>
          </div>
        )}
        {category.criticalCount > 0 && (
          <div className="flex items-center gap-1 font-medium text-red-600">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <span>{category.criticalCount} Critical</span>
          </div>
        )}
      </div>
    </div>
  );
};
