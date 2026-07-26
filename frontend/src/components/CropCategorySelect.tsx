import React from 'react';
import { AGRICULTURAL_CATEGORIES } from '../constants/kenya';
import { toLabel } from '../utils/marketplace';

interface CropCategorySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function CropCategorySelect({ label = 'Crop Category', className, ...props }: CropCategorySelectProps) {
  return (
    <label className="block w-full">
      <span className="mb-2 ml-1 block text-sm font-bold text-[#2B1612]">{label}</span>
      <select
        className={`w-full rounded-2xl border-2 border-[#F4ECE1] bg-white px-4 py-4 text-base font-medium text-[#2B1612] outline-none transition focus:border-[#008D41] ${className || ''}`}
        {...props}
      >
        <option value="">Select category</option>
        {AGRICULTURAL_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {toLabel(category)}
          </option>
        ))}
      </select>
    </label>
  );
}
