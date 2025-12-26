'use client'

interface BinderControlsProps {
  currentSpread: number
  totalSpreads: number
  onPrevious: () => void
  onNext: () => void
  canGoPrevious: boolean
  canGoNext: boolean
  isAnimating: boolean
}

export default function BinderControls({
  currentSpread,
  totalSpreads,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  isAnimating
}: BinderControlsProps) {
  const leftPage = currentSpread * 2 + 1
  const rightPage = currentSpread * 2 + 2
  const totalPages = totalSpreads * 2

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-10">
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious || isAnimating}
        className="sku-button px-4 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        title="Previous page (Left Arrow)"
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Indicator */}
      <div className="sku-card px-4 py-2 min-w-[140px] text-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Pages {leftPage}-{Math.min(rightPage, totalPages)} of {totalPages}
        </span>
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!canGoNext || isAnimating}
        className="sku-button px-4 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        title="Next page (Right Arrow)"
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
