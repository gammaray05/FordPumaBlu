import React from 'react';

export default function LevelBadge({ level, progress }) {
  const pct = Math.min(100, Math.max(0, progress || 0));

  return (
    <div className="relative h-10 w-10">
      <svg className="absolute inset-0" viewBox="0 0 36 36">
        <path
          className="text-gray-200"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          className="text-pink-500"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray={`${pct}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[0.6rem] text-gray-500 -mb-1">LIV</span>
        <span className="text-base font-bold text-gray-800">{level}</span>
      </div>
    </div>
  );
}
