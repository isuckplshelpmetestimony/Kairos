import React from 'react';
import CatLogo from "../../Untitled.svg";

interface KairosLogoProps {
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg' | 'xl';
  labelSize?: 'sm' | 'md' | 'lg' | 'xl';
}

function iconSizeToClasses(size: NonNullable<KairosLogoProps['iconSize']>) {
  switch (size) {
    case 'sm':
      return 'w-7 h-7';
    case 'md':
      return 'w-8 h-8';
    case 'lg':
      return 'w-10 h-10';
    case 'xl':
      return 'w-12 h-12';
  }
}

export function KairosLogo({ className = "", iconSize = 'md' }: KairosLogoProps) {
  return (
    <div className={`flex items-center gap-0 ${className}`}>
      {/* SVG logo image */}
      <div className={`${iconSizeToClasses(iconSize)} flex items-center justify-center`}>
        <img src={CatLogo} alt="Cairos logo" className="w-full h-full object-contain" draggable={false} />
      </div>
      <span className={`font-semibold text-kairos-charcoal tracking-wide text-35px`}>Cairos</span>
    </div>
  );
}