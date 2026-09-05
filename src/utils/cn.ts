import { clsx, type ClassArray } from 'clsx'
import { twMerge } from 'tailwind-merge'

export default function (...inputs: ClassArray) {
  return twMerge(clsx(inputs))
}
