import React from 'react';
import Initial from './Initial.jsx';
import LevelBadge from './LevelBadge.jsx';

const medalFor = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
};

export default function LeaderboardRow({ rank, user, scope, topScore, prog }) {
  const medal = medalFor(rank);
  const userScore = scope === 'weekly' ? user.weekly : user.points;
  const pct = topScore > 0 ? Math.round((userScore / topScore) * 100) : 0;
  const levelInfo = prog ? prog(user.points || 0) : { lvl: 1, pct: 0 };

  return (
    <div className={`card p-3 flex items-center justify-between ${medal ? 'bg-yellow-50 border-yellow-200' : ''}`}>
      <div className="flex items-center gap-3 flex-grow">
        <div className="font-bold text-lg text-gray-400 w-6 text-center">{rank}</div>
        <div className="relative">
          <Initial s={user.name} />
          {medal && <span className="absolute -top-2 -right-2 text-xl">{medal}</span>}
        </div>
        <div className="flex-grow">
          <div className="text-sm font-semibold text-gray-800">{user.name}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {prog && <LevelBadge level={levelInfo.lvl} progress={levelInfo.pct} />}
        <div className="text-right flex-shrink-0 w-28">
          <div className="font-bold text-gray-800 text-sm">{userScore} pt</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}