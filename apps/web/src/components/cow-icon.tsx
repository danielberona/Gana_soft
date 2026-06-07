import type { SVGProps } from 'react'

export function CowIcon({ size = 24, className = '', ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Head */}
      <path d="M5 9c0-3.3 2.7-5 7-5s7 1.7 7 5v6c0 3.3-2.7 5-7 5s-7-1.7-7-5V9z" />
      {/* Left ear */}
      <path d="M5 9 L2 6 L5 8" />
      {/* Right ear */}
      <path d="M19 9 L22 6 L19 8" />
      {/* Left eye */}
      <circle cx="9.5" cy="11" r="1" />
      {/* Right eye */}
      <circle cx="14.5" cy="11" r="1" />
      {/* Muzzle */}
      <ellipse cx="12" cy="16.5" rx="3.5" ry="2" />
      {/* Left nostril */}
      <circle cx="10.5" cy="16.5" r="0.6" />
      {/* Right nostril */}
      <circle cx="13.5" cy="16.5" r="0.6" />
    </svg>
  )
}
