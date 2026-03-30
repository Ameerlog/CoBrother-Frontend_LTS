import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

/**
 * Reusable filter bar.
 * Props:
 *   search, onSearch
 *   category, onCategory, categoryOptions — [{value, label}]
 *   minPrice, maxPrice, onMinPrice, onMaxPrice — pass null to hide price filter
 *   sortBy, onSort, sortOptions — [{value, label}] (optional, uses defaults if omitted)
 *   onClear, activeFilterCount
 *   placeholder — search input placeholder
 */

const DEFAULT_SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First'   },
  { value: 'oldest',     label: 'Oldest First'   },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'most_liked', label: 'Most Liked'     },
  { value: 'most_viewed',label: 'Most Viewed'    },
];

export default function FilterBar({
  search, onSearch,
  category, onCategory, categoryOptions = [],
  minPrice, maxPrice, onMinPrice, onMaxPrice,
  sortBy, onSort, sortOptions,
  onClear, activeFilterCount = 0,
  placeholder = 'Search…',
  theme = 'dark',
}) {
  const [searchInput, setSearchInput] = useState(search || '');
  const debounceRef = useRef(null);

  // Debounce search 300ms
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(searchInput), 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // Sync if parent clears
  useEffect(() => { if (!search) setSearchInput(''); }, [search]);

  const sorts = sortOptions || DEFAULT_SORT_OPTIONS;
  const showPrice = onMinPrice !== undefined && onMinPrice !== null;
  const isLight = theme === 'light';

  return (
    <div className={`filter-bar ${isLight ? 'filter-bar-light' : ''}`}>
      {/* Row 1: search + sort */}
      <div className="filter-bar-row">
        {/* Search */}
        <div className="filter-search-wrap">
          <span className="filter-search-icon">
            <Search size={15} className="filter-search-icon-svg" />
          </span>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder={placeholder}
            className="filter-search-input"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => onSort(e.target.value)}
          className="filter-sort-select"
        >
          {sorts.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Row 2: category + price + clear */}
      <div className="filter-bar-row filter-bar-row-bottom">
        {/* Category */}
        {categoryOptions.length > 0 && (
          <select
            value={category}
            onChange={e => onCategory(e.target.value)}
            className="filter-category-select"
          >
            <option value="">All Categories</option>
            {categoryOptions.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        )}

        {/* Price range */}
        {showPrice && (
          <div className="filter-price-wrap">
            <input
              type="number" min="0"
              value={minPrice}
              onChange={e => onMinPrice(e.target.value)}
              placeholder="Min ₹"
              className="filter-price-input"
            />
            <span className="filter-price-sep">—</span>
            <input
              type="number" min="0"
              value={maxPrice}
              onChange={e => onMaxPrice(e.target.value)}
              placeholder="Max ₹"
              className="filter-price-input"
            />
          </div>
        )}

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={onClear}
            className="filter-clear-btn"
          >
            ✕ Clear
            <span className="filter-clear-count">
              {activeFilterCount}
            </span>
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="filter-chip-row">
          {searchInput && (
            <Chip label={`"${searchInput}"`} onRemove={() => { setSearchInput(''); onSearch(''); }} light={isLight} />
          )}
          {category && (
            <Chip label={category.replace(/_/g, ' ')} onRemove={() => onCategory('')} light={isLight} />
          )}
          {minPrice && (
            <Chip label={`Min ₹${Number(minPrice).toLocaleString('en-IN')}`}
                  onRemove={() => onMinPrice('')} light={isLight} />
          )}
          {maxPrice && (
            <Chip label={`Max ₹${Number(maxPrice).toLocaleString('en-IN')}`}
                  onRemove={() => onMaxPrice('')} light={isLight} />
          )}
        </div>
      )}
    </div>
  );
}

function Chip({ label, onRemove, light }) {
  return (
    <span className={`filter-chip ${light ? 'filter-chip-light' : ''}`}>
      {label}
      <span onClick={onRemove} className="filter-chip-remove">✕</span>
    </span>
  );
}