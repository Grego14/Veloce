import cn from '../../utils/cn'
import type { LucideProps } from 'lucide-preact'

type VeloceLogoSize = 'sm' | 'md' | 'lg'

interface VeloceLogoProps extends LucideProps {
  size?: VeloceLogoSize
}

const sizes = {
  sm: 'h-5 w-5',
  md: 'h-7 w-7',
  lg: 'h-10 w-10'
}

export default function VeloceLogo({ class: className, size = 'sm' }: VeloceLogoProps) {
  const logoSize = sizes[size]

  return (
    <svg
      aria-hidden='true'
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      className={cn(logoSize, className)}
    >
      <rect width="100" height="100" rx="20" fill="#09090b" />
      <path d="M 22 25 L 42 75 L 58 75 L 78 25 L 63 25 L 50 60 L 37 25 Z" fill="#ffffff" />
      <polygon points="70,25 80,25 73,42 63,42" fill="#e11d48" />
    </svg>
  )
}
