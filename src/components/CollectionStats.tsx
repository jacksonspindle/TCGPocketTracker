'use client'

import { Card } from '../types'
import { useCollection } from '../context/CollectionContext'

interface CollectionStatsProps {
  cards: Card[];
  setName: string;
}

export default function CollectionStats({ cards, setName }: CollectionStatsProps) {
  const { getOwnedCount } = useCollection();

  const cardIds = cards.map((c) => c.id);
  const ownedCount = getOwnedCount(cardIds);
  const totalCount = cards.length;
  const percentage = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

  return (
    <div className="sku-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{setName}</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
              <svg className="w-3 h-3 text-gray-500 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-gray-700 dark:text-gray-200">{ownedCount}/{totalCount}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar mb-4">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-teal-400 to-teal-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Owned: <span className="font-bold text-gray-800 dark:text-gray-100">{ownedCount}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-500 dark:to-gray-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Missing: <span className="font-bold text-gray-800 dark:text-gray-100">{totalCount - ownedCount}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">Progress: <span className="font-bold text-teal-600 dark:text-teal-400">{percentage}%</span></span>
        </div>
      </div>
    </div>
  );
}
