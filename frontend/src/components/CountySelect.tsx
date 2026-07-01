import React from 'react';
import { KENYAN_COUNTIES } from '../constants/kenya';

interface CountySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const countyLabel = (value: string) => value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

export function CountySelect({ label = 'County', className, ...props }: CountySelectProps) {
  return (
    <label className="block w-full">
      <span className="mb-2 ml-1 block text-sm font-bold text-[#2B1612]">{label}</span>
      <select
        className={`w-full rounded-2xl border-2 border-[#F4ECE1] bg-white px-4 py-4 text-base font-medium text-[#2B1612] outline-none transition focus:border-[#008D41] ${className || ''}`}
        {...props}
      >
        <option value="">Select county</option>
        {KENYAN_COUNTIES.map((county) => (
          <option key={county} value={county}>
            {countyLabel(county)}
          </option>
        ))}
      </select>
    </label>
  );
}
