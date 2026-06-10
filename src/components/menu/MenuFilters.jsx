import GlassSelect from '../common/GlassSelect';
import Toggle from '../common/Toggle';
import { CATEGORIES } from '../../utils/constants';

export default function MenuFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  availableOnly,
  onAvailableOnlyChange,
}) {
  return (
    <div className="card mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-stone-600">Search</label>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search dishes..."
          className="input-field"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-stone-600">Category</label>
        <GlassSelect
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={[
            { value: '', label: 'All Categories' },
            ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
          ]}
        />
      </div>
      <div className="flex items-center sm:col-span-2 lg:col-span-1">
        <Toggle
          label="Available items only"
          checked={availableOnly}
          onChange={onAvailableOnlyChange}
        />
      </div>
    </div>
  );
}
