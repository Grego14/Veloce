export default function Star({
  className = 'w-5 h-5',
  strokeWidth = 2,
  fill = 'none',
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      width="24"
      height="24"
      className={className}
      aria-hidden="true"
    >
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.752a.53.53 0 0 1 .294.904l-3.738 3.644a2.12 2.12 0 0 0-.61 1.877l.883 5.145a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.974 0l-4.62 2.43a.53.53 0 0 1-.77-.56l.883-5.145a2.12 2.12 0 0 0-.61-1.877L2.16 9.79a.53.53 0 0 1 .294-.904l5.166-.752a2.12 2.12 0 0 0 1.595-1.16z" />
    </svg>
  )
}
