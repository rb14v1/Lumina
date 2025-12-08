import React from "react";
 
export default function PromptSkeleton({ count = 9 }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="h-4 w-2/3 mb-3 bg-gray-200 rounded" />
          <div className="h-3 w-full mb-2 bg-gray-200 rounded" />
          <div className="h-3 w-5/6 mb-4 bg-gray-200 rounded" />
 
          <div className="h-3 w-20 mb-2 bg-gray-200 rounded" />
 
          <div className="flex justify-between mt-4">
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
 
 