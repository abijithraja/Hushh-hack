"use client";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return oldProgress + 5;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
      <div className="text-center w-64">
        <div className="mb-6">
          <span className="text-2xl font-bold text-[#0F172A]">
            Skill<span className="text-blue-600">Gig</span>
          </span>
        </div>

        <h1 className="text-lg font-semibold text-[#0F172A] mb-2">
          Setting up your workspace
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Preparing your personalized dashboard...
        </p>

        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-slate-400">{progress}%</p>
      </div>
    </div>
  );
}
