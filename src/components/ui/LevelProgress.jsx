import React from 'react';

export default function LevelProgress({ level, xp, progress, needed, have, start, end }) {
  const pct = Math.min(100, Math.max(0, progress || 0));
  const levelPoints = end - start;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16">
            <svg className="absolute inset-0" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="currentColor" strokeWidth="3"
              />
              <path
                className="text-cyan-500"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="currentColor" strokeWidth="3"
                strokeDasharray={`${pct}, 100`} strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-gray-500">LIV</span>
              <span className="text-2xl font-bold text-gray-800">{level}</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">Punti totali</div>
            <div className="text-2xl font-bold text-cyan-500">{xp} pt</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-800">Prossimo: LIV {level + 1}</div>
          <div className="text-lg font-bold text-gray-600">{needed} pt mancanti</div>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
        <div
          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-4 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-end text-xs text-gray-500 mt-1">
        <span>{end} pt</span>
      </div>
    </div>
  );
}