import React from 'react';

interface AvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ name = 'User', avatarUrl, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate a color based on the name for consistency
  const colors = [
    'bg-[#E32636]',
    'bg-[#008D41]',
    'bg-[#F7971E]',
    'bg-[#2B1612]',
    'bg-[#4A90E2]',
  ];
  
  const colorIndex = (name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % colors.length;
  const bgColor = colors[colorIndex];

  if (avatarUrl) {
    return (
      <div className={`${sizeClasses[size]} overflow-hidden rounded-full bg-[#F4ECE1]`}>
        <img 
          src={avatarUrl} 
          alt={name} 
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-bold`}>
      {initials}
    </div>
  );
}
