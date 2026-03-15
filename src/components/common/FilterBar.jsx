import { useState, useEffect, useRef } from 'react';

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

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14, padding: '1rem 1.25rem',
      marginBottom: '1.5rem',
      display: 'flex', flexDirection: 'column', gap: '0.875rem',
    }}>
      {/* Row 1: search + sort */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ flex: '1 1 220px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%',
                         transform: 'translateY(-50%)', color: '#666', fontSize: '0.9rem',
                         pointerEvents: 'none' }}>🔍</span>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder={placeholder}
            style={{ paddingLeft: '2.25rem', width: '100%' }}
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => onSort(e.target.value)}
          style={{ flex: '0 1 180px' }}
        >
          {sorts.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Row 2: category + price + clear */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Category */}
        {categoryOptions.length > 0 && (
          <select
            value={category}
            onChange={e => onCategory(e.target.value)}
            style={{ flex: '1 1 160px' }}
          >
            <option value="">All Categories</option>
            {categoryOptions.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        )}

        {/* Price range */}
        {showPrice && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center',
                        flex: '1 1 220px' }}>
            <input
              type="number" min="0"
              value={minPrice}
              onChange={e => onMinPrice(e.target.value)}
              placeholder="Min ₹"
              style={{ width: 90 }}
            />
            <span style={{ color: '#666', fontSize: '0.8rem' }}>—</span>
            <input
              type="number" min="0"
              value={maxPrice}
              onChange={e => onMaxPrice(e.target.value)}
              placeholder="Max ₹"
              style={{ width: 90 }}
            />
          </div>
        )}

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={onClear}
            style={{
              background: 'rgba(200,110,110,0.1)',
              border: '1px solid rgba(200,110,110,0.25)',
              borderRadius: 8, padding: '0.4rem 0.85rem',
              color: '#c86e6e', fontSize: '0.8rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              whiteSpace: 'nowrap',
            }}
          >
            ✕ Clear
            <span style={{
              background: '#c86e6e', color: '#fff', borderRadius: '50%',
              width: 18, height: 18, fontSize: '0.68rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {activeFilterCount}
            </span>
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {searchInput && (
            <Chip label={`"${searchInput}"`} onRemove={() => { setSearchInput(''); onSearch(''); }} />
          )}
          {category && (
            <Chip label={category.replace(/_/g, ' ')} onRemove={() => onCategory('')} />
          )}
          {minPrice && (
            <Chip label={`Min ₹${Number(minPrice).toLocaleString('en-IN')}`}
                  onRemove={() => onMinPrice('')} />
          )}
          {maxPrice && (
            <Chip label={`Max ₹${Number(maxPrice).toLocaleString('en-IN')}`}
                  onRemove={() => onMaxPrice('')} />
          )}
        </div>
      )}
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.72rem',
      background: 'rgba(200,169,110,0.12)', border: '1px solid rgba(200,169,110,0.25)',
      color: '#c8a96e',
    }}>
      {label}
      <span onClick={onRemove}
        style={{ cursor: 'pointer', opacity: 0.7, lineHeight: 1 }}>✕</span>
    </span>
  );
}