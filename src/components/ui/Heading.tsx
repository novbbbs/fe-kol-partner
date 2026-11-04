import React from 'react';

interface HeadingProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isDarkMode?: boolean;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function Heading({ 
  children, 
  size = 'md', 
  isDarkMode = false, 
  className = '',
  as: Component = 'h2'
}: HeadingProps) {
  // Kita perkecil ukuran teks pada token xs dan sm
  const sizeClasses = {
    xs: 'text-xs font-bold',     // Diperkecil agar pas
    sm: 'text-xs font-bold',     // Diperkecil agar pas
    md: 'text-sm md:text-base font-bold',
    lg: 'text-base md:text-lg font-bold',
    xl: 'text-lg md:text-xl font-extrabold',
  };

  return (
    <Component className={`${sizeClasses[size]} ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tight ${className}`}>
      {children}
    </Component>
  );
}