import { useState, useCallback } from 'react';

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

export default function SearchFilters({ categories, filters, onChange }) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Debounce search input
  const handleSearchChange = useCallback(
    (value) => {
      setLocalSearch(value);
      clearTimeout(window._searchTimer);
      window._searchTimer = setTimeout(() => {
        onChange({ search: value, page: 1 });
      }, 350);
    },
    [onChange]
  );

  const handleCategory = (cat) => {
    onChange({ category: cat, page: 1 });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name, specialty, or keyword…"
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D0CCC7] rounded-md
            focus:outline-none focus:ring-2 focus:ring-[#2C7F91] focus:border-[#2C7F91]
            hover:border-[#A7BED3] transition-colors placeholder:text-[#9CA3AF]"
        />
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all duration-150 ${
                filters.category === cat || (cat === 'All' && !filters.category)
                  ? 'bg-[#003049] text-white border-[#003049]'
                  : 'bg-white text-[#4B5563] border-[#D0CCC7] hover:border-[#2C7F91] hover:text-[#2C7F91]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
