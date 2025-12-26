'use client'

import { FilterOptions, SortOptions, SortField } from '../types'
import Dropdown from './Dropdown'

type CollectionFilter = 'all' | 'owned' | 'missing' | 'wishlist'

interface FilterControlsProps {
  filters: FilterOptions;
  sort: SortOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onSortChange: (sort: SortOptions) => void;
  availableTypes: string[];
  availableRarities: string[];
  availableStages: string[];
  collectionFilter: CollectionFilter;
  onCollectionFilterChange: (filter: CollectionFilter) => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
}

export default function FilterControls({
  filters,
  sort,
  onFilterChange,
  onSortChange,
  availableTypes,
  availableRarities,
  availableStages,
  collectionFilter,
  onCollectionFilterChange,
  gridSize,
  onGridSizeChange,
}: FilterControlsProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleSortOrderChange = () => {
    onSortChange({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' });
  };

  const handleClearFilters = () => {
    onFilterChange({ search: '', rarity: '', type: '', stage: '' });
  };

  const hasActiveFilters = filters.search || filters.rarity || filters.type || filters.stage;

  const typeOptions = [
    { value: '', label: 'All Types' },
    ...availableTypes.map(type => ({ value: type, label: type }))
  ];

  const rarityOptions = [
    { value: '', label: 'All Rarities' },
    ...availableRarities.map(rarity => ({ value: rarity, label: rarity }))
  ];

  const stageOptions = [
    { value: '', label: 'All Stages' },
    ...availableStages.map(stage => ({ value: stage, label: stage }))
  ];

  const sortOptions = [
    { value: 'localId', label: 'Card #' },
    { value: 'name', label: 'Name' },
    { value: 'hp', label: 'HP' },
    { value: 'rarity', label: 'Rarity' },
  ];

  return (
    <div className="sku-card p-4 space-y-4">
      {/* Search and Display Toggle Row */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search cards..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 sku-inset text-gray-700 dark:text-gray-200 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Collection Filter Toggle */}
        <div className="flex items-center rounded-xl overflow-hidden sku-inset">
          <button
            onClick={() => onCollectionFilterChange('all')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              collectionFilter === 'all'
                ? 'bg-teal-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onCollectionFilterChange('owned')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              collectionFilter === 'owned'
                ? 'bg-teal-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            Owned
          </button>
          <button
            onClick={() => onCollectionFilterChange('missing')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              collectionFilter === 'missing'
                ? 'bg-teal-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            Missing
          </button>
          <button
            onClick={() => onCollectionFilterChange('wishlist')}
            className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
              collectionFilter === 'wishlist'
                ? 'bg-pink-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Wishlist
          </button>
        </div>

        {/* Grid Size Slider */}
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <input
            type="range"
            min="3"
            max="8"
            value={gridSize}
            onChange={(e) => onGridSizeChange(Number(e.target.value))}
            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-2">
        {/* Type Filter */}
        <Dropdown
          options={typeOptions}
          value={filters.type}
          onChange={(value) => onFilterChange({ ...filters, type: value })}
          placeholder="All Types"
        />

        {/* Rarity Filter */}
        <Dropdown
          options={rarityOptions}
          value={filters.rarity}
          onChange={(value) => onFilterChange({ ...filters, rarity: value })}
          placeholder="All Rarities"
        />

        {/* Stage Filter */}
        <Dropdown
          options={stageOptions}
          value={filters.stage}
          onChange={(value) => onFilterChange({ ...filters, stage: value })}
          placeholder="All Stages"
        />

        {/* Sort Field */}
        <Dropdown
          options={sortOptions}
          value={sort.field}
          onChange={(value) => onSortChange({ ...sort, field: value as SortField })}
          placeholder="Sort by"
        />

        {/* Sort Order Button */}
        <button
          onClick={handleSortOrderChange}
          className="sku-button px-4 py-2.5 text-gray-600 dark:text-gray-300 font-medium"
          title={sort.order === 'asc' ? 'Ascending' : 'Descending'}
        >
          {sort.order === 'asc' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
          )}
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="sku-button px-4 py-2.5 text-red-500 font-medium text-sm"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
