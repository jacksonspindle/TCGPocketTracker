'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="sku-button p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <div className="w-5 h-5 relative">
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'light' ? (
            <motion.svg
              key="moon"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-5 h-5 absolute inset-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-5 h-5 absolute inset-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
    </button>
  )
}
