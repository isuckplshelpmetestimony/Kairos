interface KairosLogoProps {
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg' | 'xl';
  labelSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
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

function labelSizeToClasses(size: NonNullable<KairosLogoProps['labelSize']>) {
  switch (size) {
    case 'sm':
      return 'text-sm';
    case 'md':
      return 'text-base';
    case 'lg':
      return 'text-lg';
    case 'xl':
      return 'text-xl';
    case '2xl':
      return 'text-2xl';
  }
}

export function KairosLogo({ className = "", iconSize = 'md', labelSize = 'md' }: KairosLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Black silhouette cat with yellow glowing eyes */}
      <div className={`${iconSizeToClasses(iconSize)} flex items-center justify-center`}>
        <svg className="w-full h-full" viewBox="0 0 32 32" fill="none">
          {/* Cat silhouette body */}
          <path 
            d="M16 28c-6 0-10-4-10-9s3-8 6-9c1-2 2-3 4-3s3 1 4 3c3 1 6 4 6 9s-4 9-10 9z" 
            fill="#000000"
          />
          {/* Cat ears */}
          <path 
            d="M12 8l-2-4 4 2-2 2zm8 0l2-4-4 2 2 2z" 
            fill="#000000"
          />
          {/* Curved tail */}
          <path 
            d="M24 20c2-2 3-4 2-6-1-1-2 0-3 2s-2 4-1 6c1 1 2-1 2-2z" 
            fill="#000000"
          />
          {/* Yellow glowing eyes */}
          <circle cx="13" cy="16" r="1.5" fill="#FFD700" className="animate-pulse" />
          <circle cx="19" cy="16" r="1.5" fill="#FFD700" className="animate-pulse" />
        </svg>
      </div>
      <span className={`font-semibold text-kairos-charcoal tracking-wide ${labelSizeToClasses(labelSize)}`}>Kairos</span>
    </div>
  );
}