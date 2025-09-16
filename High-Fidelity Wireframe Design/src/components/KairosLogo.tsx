interface KairosLogoProps {
  className?: string;
}

export function KairosLogo({ className = "" }: KairosLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Black silhouette cat with yellow glowing eyes */}
      <div className="w-8 h-8 flex items-center justify-center">
        <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
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
      <span className="font-medium text-kairos-charcoal tracking-wide">Kairos</span>
    </div>
  );
}