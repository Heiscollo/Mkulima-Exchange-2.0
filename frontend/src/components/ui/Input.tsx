import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from './GradientButton';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative w-full">
        {icon && (
          <div className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300",
            isFocused ? "text-[#56AB2F]" : "text-gray-400"
          )}>
            {icon}
          </div>
        )}
        <input
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            "w-full rounded-2xl border-2 bg-white/50 px-4 py-4 text-gray-900 outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-gray-400",
            icon ? "pl-12" : "",
            isFocused ? "border-[#56AB2F] bg-white shadow-[0_0_0_4px_rgba(86,171,47,0.1)]" : "border-transparent hover:bg-white/80",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
